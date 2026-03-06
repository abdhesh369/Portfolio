import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "./redis.js";
import { logger } from "./logger.js";

/**
 * Creates a standardized rate limiter with Redis backend if available.
 * Falls back to memory store if Redis is disconnected.
 */
const createLimiter = (options: {
    windowMs: number;
    max: number;
    message: string;
    skipSuccessfulRequests?: boolean;
    keyPrefix: string;
}) => {
    return rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        message: { message: options.message },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: options.skipSuccessfulRequests || false,
        store: redis ? new RedisStore({
            // @ts-ignore - ioredis compatibility
            sendCommand: (...args: string[]) => redis!.call(...args),
            prefix: `rl:${options.keyPrefix}:`,
        }) : undefined,
        handler: (req, res, next, options) => {
            logger.warn({
                ip: req.ip,
                path: req.path,
                prefix: options.store instanceof RedisStore ? 'redis' : 'memory'
            }, "Rate limit exceeded");
            res.status(options.statusCode).send(options.message);
        }
    });
};

/**
 * Global API limiter: 300 requests per 15 minutes
 */
export const globalLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: "Too many requests from this IP, please try again later",
    keyPrefix: "global",
});

/**
 * Auth limiter: 5 attempts per 15 minutes (skips successful logins)
 */
export const authLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again later",
    skipSuccessfulRequests: true,
    keyPrefix: "auth",
});

/**
 * Contact form limiter: 5 messages per 15 minutes
 */
export const contactLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many messages sent, please try again later",
    keyPrefix: "contact",
});

/**
 * Guestbook limiter: 5 entries per hour
 */
export const guestbookLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many guestbook entries, please try again in an hour",
    keyPrefix: "guestbook",
});

/**
 * Sensitive API limiter: 20 requests per 15 minutes
 */
export const strictApiLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Action limit exceeded, please try again later",
    keyPrefix: "strict",
});
