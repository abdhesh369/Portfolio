import { Request, Response, NextFunction } from "express";
import { env } from "./env.js";
import jwt from "jsonwebtoken";

/**
 * Middleware to check for admin authentication via API Key
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    // 1. Check for Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
            jwt.verify(token, env.JWT_SECRET);
            return next();
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    }

    // 2. Fallback to x-api-key (deprecated)
    const apiKey = req.headers["x-api-key"];
    if (apiKey === env.ADMIN_API_KEY) {
        return next();
    }

    res.status(401).json({ message: "Unauthorized. Please provide a valid token or API key." });
};

/**
 * Error handler wrapper for async routes
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
