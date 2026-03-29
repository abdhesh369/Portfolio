import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

/**
 * API Version Guard Middleware
 * 
 * Ensures that all requests that look like API calls are directed to
 * a supported version (currently only /api/v1/*).
 * 
 * This prevents accidental exposure of internal or unversioned routes.
 */

const ALLOWED_V1_PREFIXES = [
    "/api/v1/",
    "/health",
    "/ping",
    "/api/v1/debug-sentry"
];

export function versionGuard(req: Request, res: Response, next: NextFunction): void {
    const path = req.path;
    
    // Only apply to paths starting with /api
    if (!path.startsWith("/api")) {
        next();
        return;
    }

    const isAllowed = ALLOWED_V1_PREFIXES.some(prefix => path.startsWith(prefix));

    if (!isAllowed) {
        logger.warn({
            context: "version-guard",
            path: req.path,
            requestId: req.id,
        }, "Blocked request to unsupported API version");

        res.status(404).json({
            error: {
                message: `Unsupported API version or route: ${path}. Only v1 is currently supported.`,
                status: 404
            }
        });
        return;
    }

    next();
}
