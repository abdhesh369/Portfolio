import express from "express";
import cookieParser from "cookie-parser";
import { authRoutes } from "../routes/auth.js";

/**
 * Creates a minimal Express app with auth routes for integration testing.
 * Does NOT start a server - use with supertest's request(app).
 */
export function createTestApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/v1/auth", authRoutes);

    // Error handler
    app.use(
        (err: Error & { status?: number }, _req: express.Request, res: express.Response, __next: express.NextFunction) => { // eslint-disable-line @typescript-eslint/no-unused-vars
            const status = err.status || 500;
            res.status(status).json({ message: err.message });
        }
    );

    return app;
}
