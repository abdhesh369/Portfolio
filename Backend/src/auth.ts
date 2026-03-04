import { Request, Response, NextFunction } from "express";
import { env } from "./env.js";
import jwt from "jsonwebtoken";
import { Redis } from "ioredis";

// Central Redis connection for token blacklist
const redis = env.REDIS_URL ? new Redis(env.REDIS_URL) : null;
const isProd = env.NODE_ENV === "production";

if (isProd && !redis) {
    console.warn("⚠️  [AUTH] Redis is not configured in production. Token blacklist is disabled. Tokens cannot be revoked persistently.");
}

/**
 * Revokes a JWT token by adding it to the blacklist
 */
export async function revokeToken(token: string) {
    if (!redis) return; // Skip if no Redis

    try {
        const decoded = jwt.decode(token) as { exp?: number } | null;
        if (decoded?.exp) {
            const ttl = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
            if (ttl > 0) {
                // Store in Redis with TTL so it expires automatically
                await redis.set(`blacklist:${token}`, "1", "EX", ttl);
            }
        }
    } catch (err) {
        console.error("[AUTH] Failed to revoke token:", err);
    }
}

/**
 * Checks if the request is authenticated via JWT or API Key without throwing an error
 */
export async function checkAuthStatus(req: Request): Promise<boolean> {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
    }

    if (token) {
        if (redis) {
            const isBlacklisted = await redis.get(`blacklist:${token}`);
            if (isBlacklisted) return false;
        }
        try {
            jwt.verify(token, env.JWT_SECRET);
            return true;
        } catch (err) {
            return false;
        }
    }

    const apiKey = req.headers["x-api-key"];
    if (apiKey === env.ADMIN_API_KEY) {
        return true;
    }

    return false;
}

/**
 * Middleware to check for admin authentication via JWT or API Key
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
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
        // Check if token is blacklisted in Redis
        if (redis) {
            const isBlacklisted = await redis.get(`blacklist:${token}`);
            if (isBlacklisted) {
                return res.status(401).json({ message: "Token has been revoked. Please login again." });
            }
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

// Alias for better readability in admin routes
export const isAdmin = isAuthenticated;

/**
 * Error handler wrapper for async routes
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
