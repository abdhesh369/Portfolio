// ============================================================
// FILE: src/server.ts
// ============================================================
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import { registerRoutes } from "./routes.js";
import { seedDatabase } from "./seed.js";
import { createTables } from "./create-tables.js";

const app = express();
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
  console.log(`${formattedTime} [${source}] ${message}`);
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://abdheshsah.com.np",
  "https://www.abdheshsah.com.np",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.get("/healthz", (_req, res) => {
  res.status(200).json({
    ok: true,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

function setupGracefulShutdown() {
  const shutdown = (signal: string) => {
    log(`${signal} received, shutting down...`, "shutdown");

    httpServer.close(() => {
      log("HTTP server closed", "shutdown");
      process.exit(0);
    });

    setTimeout(() => {
      log("Forced shutdown", "shutdown");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

(async () => {
  try {
    log("Starting server...", "startup");

    // ✅ CRITICAL: Create tables FIRST
    log("Creating database tables...", "startup");
    try {
      await createTables();
      log("✓ Database tables created successfully", "startup");
    } catch (error) {
      log(`❌ Failed to create tables: ${error}`, "error");
      throw error;
    }

    // ✅ Then seed
    log("Seeding database...", "startup");
    try {
      await seedDatabase();
      log("✓ Database seed complete", "startup");
    } catch (err) {
      log("⚠️ Seed skipped or failed (safe to ignore)", "startup");
    }

    // ✅ Register API routes
    log("Registering API routes...", "startup");
    await registerRoutes(httpServer, app);
    log("✓ API routes registered", "startup");

    app.use(
      (err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        log(`Error ${status}: ${message}`, "error");

        res.status(status).json({
          message,
          ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
        });
      }
    );

    setupGracefulShutdown();

    const port = parseInt(process.env.PORT || "5000", 10);
    const host = "0.0.0.0";

    httpServer.listen(port, host, () => {
      log(`Server running on ${host}:${port}`, "startup");
    });
  } catch (error) {
    log(`Startup failed: ${error}`, "error");
    process.exit(1);
  }
})();
