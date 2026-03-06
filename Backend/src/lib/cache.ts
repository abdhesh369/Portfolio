import { redis } from "./redis.js";
import { logger } from "./logger.js";

/**
 * Shared Cache Service
 * Provides standardized wrappers around Redis for common patterns like get-or-set.
 */
export class CacheService {
    /**
     * Standardized key generator
     * @param feature - e.g. "article"
     * @param namespace - e.g. "list" or "slug"
     * @param identifier - e.g. "my-article-slug"
     */
    static key(feature: string, namespace: string, identifier?: string | number): string {
        return identifier ? `${feature}:${namespace}:${identifier}` : `${feature}:${namespace}`;
    }

    /**
     * Get or Set pattern
     * Atomically tries to get from cache, then runs fallback if miss and sets cache.
     * @param key - The Redis key
     * @param ttl - Time to live in seconds
     * @param fallback - Async function to fetch data if cache miss
     */
    static async getOrSet<T>(key: string, ttl: number, fallback: () => Promise<T>): Promise<T> {
        if (!redis) {
            return fallback();
        }

        try {
            const cached = await redis.get(key);
            if (cached) {
                try {
                    return JSON.parse(cached) as T;
                } catch (parseErr) {
                    logger.warn({ context: "cache", key, error: parseErr }, "Value in Redis is not valid JSON, overwriting...");
                }
            }
        } catch (err) {
            logger.error({ context: "cache", key, error: err }, "Redis read failed");
        }

        const data = await fallback();

        try {
            await redis.setex(key, ttl, JSON.stringify(data));
        } catch (err) {
            logger.error({ context: "cache", key, error: err }, "Redis write failed");
        }

        return data;
    }

    /**
     * Invalidate one or more keys
     */
    static async invalidate(...keys: string[]): Promise<void> {
        if (!redis || keys.length === 0) return;
        try {
            await redis.del(...keys);
        } catch (err) {
            logger.error({ context: "cache", keys, error: err }, "Redis invalidation failed");
        }
    }

    /**
     * Specialized invalidation for sets (like tracked keys)
     */
    static async invalidateTracked(setKey: string): Promise<void> {
        if (!redis) return;
        try {
            const keys = await redis.smembers(setKey);
            if (keys.length > 0) {
                await redis.del(...keys, setKey);
            }
        } catch (err) {
            logger.error({ context: "cache", setKey, error: err }, "Tracked key invalidation failed");
        }
    }

    /**
     * Track a key in a set for bulk invalidation
     */
    static async track(setKey: string, keyToTrack: string): Promise<void> {
        if (!redis) return;
        try {
            await redis.sadd(setKey, keyToTrack);
            // Optimization: auto-expire the set so it doesn't grow forever if never invalidated
            await redis.expire(setKey, 86400 * 7); // 1 week
        } catch (err) {
            logger.error({ context: "cache", setKey, keyToTrack, error: err }, "Redis tracking failed");
        }
    }
}
