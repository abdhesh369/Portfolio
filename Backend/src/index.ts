// Validate environment variables immediately
import "./env.js";

import express, { type Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { env } from "./env.js";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import { registerRoutes } from "./routes.js";
import compression from "compression";
import cookieParser from "cookie-parser";
import { seedDatabase } from "./seed.js";

import { checkDatabaseHealth } from "./db.js";
import { emailQueue, emailWorker } from "./lib/queue.js";
import { redis } from "./lib/redis.js"; // Import redis instance or the helper
import { logger } from "./lib/logger.js";

import rateLimit from "express-rate-limit";

import { randomUUID } from "crypto";

const app = express();
app.set("trust proxy", 1); // For production environments behind proxies (Render, Heroku, etc.)
const httpServer = createServer(app);

// Initialize Sentry
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV,
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });
  logger.info({ context: "sentry" }, "Sentry initialized");
}

declare module "http" {
  interface IncomingMessage {
    rawBody: Buffer;
  }
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

      const isAllowed = allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== "production" && origin.startsWith("http://localhost:")) ||
        (process.env.BACKEND_RENDER_URL ? origin === process.env.BACKEND_RENDER_URL : false);

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn({ origin }, "CORS blocked origin");
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
    hidePoweredBy: true, // Remove X-Powered-By in all environments
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "https://www.googletagmanager.com"],
        "object-src": ["'none'"],
        "connect-src": ["'self'", "https://api.github.com", "https://backend-1gk6.onrender.com", "https://www.google-analytics.com", "https://region1.google-analytics.com"],
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
        "report-uri": ["/api/v1/csp-report"],
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
      logger.info({
        requestId: (req as any).id,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
      }, `Request processed`);
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

  // Use the static method from RedisClient
  const { RedisClient } = await import("./lib/redis.js");
  const redisHealth = await RedisClient.checkHealth();

  const isHealthy = dbHealth.healthy && redisHealth.healthy;

  res.status(200).json({
    status: isHealthy ? "healthy" : "degraded",
    database: dbHealth.healthy ? "connected" : "reconnecting",
    redis: redisHealth.healthy ? "connected" : "reconnecting",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && {
      details: {
        database: dbHealth.message,
        redis: redisHealth.message
      }
    })
  });
});

// Formal API Health Check for monitoring tools
app.get("/api/v1/health", async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();
  const { RedisClient } = await import("./lib/redis.js");
  const redisHealth = await RedisClient.checkHealth();

  const isHealthy = dbHealth.healthy && redisHealth.healthy;

  res.status(200).json({
    status: isHealthy ? "healthy" : "degraded",
    database: dbHealth.healthy ? "connected" : "reconnecting",
    redis: redisHealth.healthy ? "connected" : "reconnecting",
    timestamp: new Date().toISOString(),
  });
});

function setupGracefulShutdown() {
  const shutdown = async (signal: string) => {
    logger.info({ context: "shutdown" }, `${signal} received, shutting down...`);

    // Close HTTP server first to stop accepting new requests
    httpServer.close(() => {
      logger.info({ context: "shutdown" }, "HTTP server closed");
    });

    // Force exit if shutdown takes too long (must be set before any await)
    const forceTimer = setTimeout(() => {
      logger.info({ context: "shutdown" }, "Forced shutdown due to timeout");
      process.exit(1);
    }, 10000);
    forceTimer.unref();

    try {
      // Close database pool
      const { closePool } = await import("./db.js");
      await closePool();
      logger.info({ context: "shutdown" }, "Database pool closed");

      try {
        if (emailQueue) await emailQueue.close();
        if (emailWorker) await emailWorker.close();
        logger.info({ context: "shutdown" }, "Email queue and worker closed");
      } catch (qErr) {
        logger.error({ context: "shutdown", error: qErr }, `Error closing queue`);
      }

      process.exit(0);
    } catch (err) {
      logger.error({ context: "shutdown", error: err }, `Error during shutdown`);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

// ==================== MAIN STARTUP ====================
async function startServer() {
  try {
    logger.info({ context: "startup" }, "Starting server...");

    // ── 1. Bind the port FIRST so Render detects the service immediately ──
    //    Static routes (/, /ping) are already registered above and will respond
    //    while the rest of the startup continues in the background.
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = "0.0.0.0";

    await new Promise<void>((resolve) => {
      httpServer.listen(port, host, () => {
        logger.info({ context: "startup", port, host }, `✓ Server listening on ${host}:${port}`);
        resolve();
      });
    });

    // ── 2. Database health check ──
    logger.info({ context: "startup" }, "📍 Checking database health...");
    const health = await checkDatabaseHealth();

    if (!health.healthy) {
      logger.error({ context: "startup", error: health.message }, "❌ Database connection failed. Shutting down...");
      process.exit(1);
    }
    logger.info({ context: "startup" }, "✓ Database is healthy");

    // Controlled seeding: Skip in production unless explicitly forced
    const shouldSeed = process.env.NODE_ENV !== "production" || process.env.FORCE_SEED === "true";

    if (shouldSeed) {
      logger.info({ context: "startup" }, "📍 Seeding Database...");
      try {
        await seedDatabase();
        logger.info({ context: "startup" }, "✓ Seeding complete");
      } catch (err) {
        logger.warn({ context: "startup", error: err }, `⚠️ Seeding failed`);
      }
    } else {
      logger.info({ context: "startup" }, "ℹ️ Skipping auto-seeding in production environment");
    }

    // ── 3. Register API routes ──
    logger.info({ context: "startup" }, "📍 Registering API routes...");
    registerRoutes(app);
    logger.info({ context: "startup" }, "✓ API routes registered");

    // Sentry Error Handler (must be before custom error handlers)
    if (env.SENTRY_DSN) {
      Sentry.setupExpressErrorHandler(app);
    }

    // Sanitize Global Error Handler
    app.use(
      (err: Error & { status?: number; statusCode?: number }, req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = status === 500 ? "Internal Server Error" : err.message;

        logger.error({
          requestId: (req as any).id,
          status,
          error: err.message,
          stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        }, `Global Error Handler`);

        if (env.SENTRY_DSN && status >= 500) {
          Sentry.captureException(err);
        }

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

    logger.info({ context: "startup" }, "✓ Server fully ready");
  } catch (error) {
    logger.fatal({ context: "startup", error }, `❌ STARTUP FAILED`);
    process.exit(1);
  }
}

// Run the startup
startServer();
