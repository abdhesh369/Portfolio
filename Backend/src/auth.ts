import { Request, Response, NextFunction } from "express";
import { env } from "./env.js";
import { logger } from "./lib/logger.js";
import jwt from "jsonwebtoken";

import { redis } from "./lib/redis.js";
const isProd = env.NODE_ENV === "production";

if (isProd && !redis) {
    logger.warn({ context: "auth" }, "Redis is not configured in production. Token blacklist is disabled.");
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
        logger.error({ context: "auth", error: err }, "Failed to revoke token");
    }
}

// --- Refresh Token Helpers ---

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 604800 seconds (7 days)

/**
 * Stores a hashed refresh token in Redis with 7-day TTL
 */
export async function storeRefreshToken(tokenHash: string): Promise<void> {
    if (!redis) return;
    try {
        await redis.set(`refresh:${tokenHash}`, "1", "EX", REFRESH_TOKEN_TTL);
    } catch (err) {
        logger.error({ context: "auth", error: err }, "Failed to store refresh token");
    }
}

/**
 * Validates whether a hashed refresh token exists in Redis
 */
export async function validateRefreshToken(tokenHash: string): Promise<boolean> {
    if (!redis) {
        logger.warn({ context: "auth" }, "Redis unavailable — denying refresh (fail-closed)");
        return false; // Fail closed if no Redis
    }
    try {
        const exists = await redis.get(`refresh:${tokenHash}`);
        return exists === "1";
    } catch (err) {
        logger.error({ context: "auth", error: err }, "Failed to validate refresh token");
        return false;
    }
}

/**
 * Revokes a refresh token by deleting its hash from Redis
 */
export async function revokeRefreshToken(tokenHash: string): Promise<void> {
    if (!redis) return;
    try {
        await redis.del(`refresh:${tokenHash}`);
    } catch (err) {
        logger.error({ context: "auth", error: err }, "Failed to revoke refresh token");
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
            if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: "Invalid or expired token" });
            } else {
                return res.status(401).json({ message: "Token verification failed" });
            }
        }
    }

    res.status(401).json({ message: "Unauthorized. Please provide a valid token." });
};


/**
 * Error handler wrapper for async routes
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
