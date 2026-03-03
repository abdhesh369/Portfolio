// Validate environment variables immediately
import "./env.js";

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import { registerRoutes } from "./routes.js";
import compression from "compression";
import cookieParser from "cookie-parser";
import { seedDatabase } from "./seed.js";

import { checkDatabaseHealth } from "./db.js";

import rateLimit from "express-rate-limit";

import { randomUUID } from "crypto";

const app = express();
app.set("trust proxy", 1); // For production environments behind proxies (Render, Heroku, etc.)
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: Buffer;
  }
}

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const sanitizedMessage = message.replace(/\n|\r/g, " ");
  console.log(`${formattedTime} [${source}] ${sanitizedMessage}`);
}

// Request Tracing
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).id = randomUUID();
  res.setHeader("X-Request-ID", (req as any).id);
  next();
});

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4173",
  "https://abdheshsah.com.np",
  "https://www.abdheshsah.com.np",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(compression());
app.use(cookieParser());

// Backward-compatible URL rewrite: /api/* → /api/v1/*
// Avoids 307 redirects which cause double round-trips, cookie/body loss, and CORS issues.
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api/') && !req.url.startsWith('/api/v1')) {
    req.url = '/api/v1' + req.url.slice(4);
  }
  next();
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: "Too many requests from this IP, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/v1", globalLimiter);

// Harden CORS
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow non-browser requests (health checks, monitoring, cURL) — they have no Origin
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin) || (process.env.NODE_ENV !== "production" && origin.startsWith("http://localhost:"))) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Tighten Helmet CSP
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "https://www.googletagmanager.com"],
        "object-src": ["'none'"],
        "connect-src": ["'self'", "https://api.github.com", "https://portfolio-b7nz.onrender.com", "https://www.google-analytics.com", "https://region1.google-analytics.com"],
        "img-src": [
          "'self'",
          "data:",
          "https:",
          "http:",
          "https://res.cloudinary.com",
          "https://*.cloudinary.com",
        ],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "frame-ancestors": ["'none'"],
        "form-action": ["'self'"],
      },
    } : false,
    crossOriginEmbedderPolicy: process.env.NODE_ENV === "production",
    crossOriginOpenerPolicy: process.env.NODE_ENV === "production",
    crossOriginResourcePolicy: { policy: "cross-origin" },
    strictTransportSecurity: process.env.NODE_ENV === "production" ? {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    } : false,
  })
);

// Reduce Payload Limits
app.use(
  express.json({
    limit: "1mb",
    verify: (req: Request, _res: Response, buf: Buffer) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// Request Logger with ID
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(`[${(req as any).id}] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Root route — friendly landing for direct visits
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "Portfolio API",
    version: "1.0.0",
    status: "running",
    docs: "/health for health check, /api/* for API endpoints",
  });
});

// Lightweight liveness probe — used by Render's deploy health check.
// Must NOT touch the database so it stays fast even when Neon is cold.
app.get("/ping", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Readiness / deep health check — includes database connectivity.
// Returns 200 even if DB is waking up, with a "degraded" flag,
// so Render doesn't mark the deploy as failed during Neon cold starts.
app.get("/health", async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();

  res.status(200).json({
    status: dbHealth.healthy ? "healthy" : "degraded",
    database: dbHealth.healthy ? "connected" : "reconnecting",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { details: dbHealth.message })
  });
});

function setupGracefulShutdown() {
  const shutdown = async (signal: string) => {
    log(`${signal} received, shutting down...`, "shutdown");

    // Close HTTP server first to stop accepting new requests
    httpServer.close(() => {
      log("HTTP server closed", "shutdown");
    });

    // Force exit if shutdown takes too long (must be set before any await)
    const forceTimer = setTimeout(() => {
      log("Forced shutdown due to timeout", "shutdown");
      process.exit(1);
    }, 10000);
    forceTimer.unref();

    try {
      // Close database pool
      const { closePool } = await import("./db.js");
      await closePool();
      log("Database pool closed", "shutdown");

      process.exit(0);
    } catch (err) {
      log(`Error during shutdown: ${err}`, "error");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

// ==================== MAIN STARTUP ====================
async function startServer() {
  try {
    log("Starting server...", "startup");

    // ── 1. Bind the port FIRST so Render detects the service immediately ──
    //    Static routes (/, /ping) are already registered above and will respond
    //    while the rest of the startup continues in the background.
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = "0.0.0.0";

    await new Promise<void>((resolve) => {
      httpServer.listen(port, host, () => {
        log(`✓ Server listening on ${host}:${port}`, "startup");
        resolve();
      });
    });

    // ── 2. Database health check ──
    log("📍 Checking database health...", "startup");
    const health = await checkDatabaseHealth();

    if (!health.healthy) {
      log("❌ Database connection failed. Shutting down...", "startup");
      log(`Reason: ${health.message}`, "error");
      process.exit(1);
    }
    log("✓ Database is healthy", "startup");

    // Controlled seeding: Skip in production unless explicitly forced
    const shouldSeed = process.env.NODE_ENV !== "production" || process.env.FORCE_SEED === "true";

    if (shouldSeed) {
      log("📍 Seeding Database...", "startup");
      try {
        await seedDatabase();
        log("✓ Seeding complete", "startup");
      } catch (err) {
        log(`⚠️ Seeding failed: ${err}`, "startup");
      }
    } else {
      log("ℹ️ Skipping auto-seeding in production environment", "startup");
    }

    // ── 3. Register API routes ──
    log("📍 Registering API routes...", "startup");
    registerRoutes(app);
    log("✓ API routes registered", "startup");

    // Sanitize Global Error Handler
    app.use(
      (err: Error & { status?: number; statusCode?: number }, req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = status === 500 ? "Internal Server Error" : err.message;

        log(`[${(req as any).id}] Error ${status}: ${err.message}`, "error");

        res.status(status).json({
          error: {
            message,
            status,
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
          }
        });
      }
    );

    // SETUP GRACEFUL SHUTDOWN
    setupGracefulShutdown();

    log("✓ Server fully ready", "startup");
  } catch (error) {
    log(`❌ STARTUP FAILED: ${error}`, "error");
    process.exit(1);
  }
}

// Run the startup
startServer();
