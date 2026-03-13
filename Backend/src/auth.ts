/// <reference path="./types/express.d.ts" />
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { env } from "./env.js";
import { logger } from "./lib/logger.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { redis } from "./lib/redis.js";
import { getIsProd } from "./lib/is-prod.js";

if (getIsProd() && !redis) {
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

// --- Refresh Token Helpers (stateless JWT — no Redis required) ---
//
// Previously these used a random hex token whose hash was stored in Redis.
// That made auth COMPLETELY BROKEN whenever Redis was unavailable (free-tier
// Render, missing REDIS_URL, Redis restart) because validateRefreshToken
// failed-closed and always returned false.
//
// Now refresh tokens are signed JWTs verified with JWT_REFRESH_SECRET.
// Validation is stateless. Redis is used only for optional revocation on logout.

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Creates a signed JWT refresh token (stateless, no Redis required to validate).
 */
export function createRefreshToken(): string {
    return jwt.sign(
        { role: "admin", type: "refresh" },
        env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
}

/**
 * Validates a refresh token JWT.
 * Falls back to true (allow) when Redis is unavailable — the JWT signature
 * itself is the security guarantee.
 */
export async function validateRefreshToken(token: string): Promise<boolean> {
    // 1. Verify signature and expiry — this is the core security check.
    //    If the JWT is invalid or expired, reject immediately.
    try {
        jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch {
        return false;
    }

    // 2. Optional: check Redis revocation list (only when Redis is available).
    //    If Redis is down we ALLOW the refresh — the JWT signature already
    //    proved authenticity. Fail-open for availability; fail-closed for forgery.
    if (redis) {
        try {
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            const isRevoked = await redis.get(`refresh_revoked:${tokenHash}`);
            if (isRevoked) return false;
        } catch (err) {
            logger.warn({ context: "auth", error: err }, "Redis unavailable for revocation check — allowing refresh");
        }
    }

    return true;
}

/**
 * Stores the refresh token in Redis for optional revocation.
 * No-op if Redis is unavailable.
 */
export async function storeRefreshToken(token: string): Promise<void> {
    if (!redis) return;
    try {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        await redis.set(`refresh_revoked:${tokenHash}`, "1", "EX", REFRESH_TOKEN_TTL_SECONDS);
    } catch (err) {
        logger.error({ context: "auth", error: err }, "Failed to store refresh token");
    }
}

/**
 * Revokes a refresh token by marking it in Redis.
 * No-op if Redis is unavailable.
 */
export async function revokeRefreshToken(token: string): Promise<void> {
    if (!redis) return;
    try {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        await redis.set(`refresh_revoked:${tokenHash}`, "1", "EX", REFRESH_TOKEN_TTL_SECONDS);
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
interface JWTPayload {
    role: string;
    iat?: number;
    exp?: number;
}


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
            const result = jwt.verify(token, env.JWT_SECRET);

            // Standard JWT payload schema
            const tokenSchema = z.object({
                role: z.string(),
                iat: z.number().optional(),
                exp: z.number().optional()
            }).passthrough();

            const parsed = tokenSchema.safeParse(result);
            if (!parsed.success) {
                return res.status(401).json({ message: "Invalid token payload" });
            }

            const decoded = parsed.data;

            // Attach decoded token to request with proper typing
            req.user = {
                role: decoded.role,
                token: token,
                via: authHeader ? "bearer" : "cookie"
            };
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
