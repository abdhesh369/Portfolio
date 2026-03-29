import { Request, Response, NextFunction } from "express";
import { isDatabaseAvailable, recordSuccess, recordFailure, getCircuitState } from "../lib/circuit-breaker.js";
import { logger } from "../lib/logger.js";

/**
 * Database Guard Middleware
 * 
 * Sits before all API routes and checks the circuit breaker state.
 * If the database is known to be down (circuit OPEN), it immediately
 * returns a friendly 503 instead of letting the request hit the DB
 * and fail with a raw 500.
 * 
 * Read-only public endpoints that don't need the DB (e.g. /ping, /health)
 * should be registered BEFORE this middleware.
 */

// Paths that should bypass the DB guard (they handle DB errors themselves or don't need DB)
const BYPASS_PATHS = new Set([
    "/auth/status",
    "/auth/login",
    "/auth/refresh",
    "/auth/logout",
]);

export function dbGuard(req: Request, res: Response, next: NextFunction): void {
    // Skip for safe read-only methods on public endpoints that have their own caching
    // or for auth endpoints that need to work even during DB issues
    if (BYPASS_PATHS.has(req.path)) {
        next();
        return;
    }

    if (!isDatabaseAvailable()) {
        logger.warn({
            context: "db-guard",
            path: req.path,
            method: req.method,
            state: getCircuitState(),
            requestId: req.id,
        }, "Request blocked by circuit breaker — database unavailable");

        res.status(503).json({
            error: {
                message: "Service temporarily unavailable. The database is experiencing issues. Please try again in a moment.",
                status: 503,
                retryAfter: 30,
            }
        });
        return;
    }

    // Wrap res.on('finish') to track success/failure for the circuit breaker
    res.on("finish", () => {
        if (res.statusCode >= 500) {
            recordFailure();
        } else {
            recordSuccess();
        }
    });

    next();
}
