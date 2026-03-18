import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "../routes.js";

/**
 * Creates a full Express app instance for integration testing.
 * Uses the same registerRoutes() function as the real app to ensure
 * middleware, CSRF, and routing prefixes (/api/v1) are identical.
 */
export function createTestApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    
    // Register all routes using the production route registration logic
    registerRoutes(app);

    // Error handler
    app.use(
        (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
            const status = err.status || err.statusCode || 500;
            res.status(status).json({ 
                message: err.message || "Internal Server Error",
                errors: err.errors // Include Zod validation errors if present
            });
        }
    );

    return app;
}

