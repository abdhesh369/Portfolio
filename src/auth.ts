import { Request, Response, NextFunction } from "express";
import { env } from "./env.js";
import jwt from "jsonwebtoken";

// In-memory token blacklist (use Redis in production)
const tokenBlacklist = new Set<string>();

/**
 * Revokes a JWT token by adding it to the blacklist
 */
export function revokeToken(token: string) {
    tokenBlacklist.add(token);
}

/**
 * Middleware to check for admin authentication via JWT or API Key
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // 1. Check for Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    }
    // 2. Check for token in auth_token cookie
    else if (req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
    }

    if (token) {
        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ message: "Token has been revoked. Please login again." });
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            // Attach decoded token to request if needed
            (req as any).user = decoded;
            return next();
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    }

    // 3. Fallback to x-api-key (deprecated)
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
