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
     * Note: This implementation has a TOCTOU (Time-of-Check to Time-of-Use) race condition 
     * between the get and set operations. In high-concurrency environments, this may 
     * lead to "cache stampede" where multiple requests fetch from DB simultaneously.
     * 
     * @param key - The Redis key
     * @param ttl - Time to live in seconds
     * @param fallback - Async function to fetch data if cache miss
     */
    static async getOrSet<T>(key: string, ttl: number, fallback: () => Promise<T>): Promise<T> {
        if (!redis) {
            return fallback();
        }

        try {
            const cached = await this.get<T>(key);
            if (cached !== null) return cached;
        } catch (err) {
            logger.warn({ context: "cache", key, error: err }, "Cache read failure, falling back to DB");
        }

        const data = await fallback();

        try {
            await this.set(key, data, ttl);
        } catch (err) {
            logger.warn({ context: "cache", key, error: err }, "Cache write failure");
        }

        return data;
    }

    /**
     * Gets a value from cache
     */
    static async get<T>(key: string): Promise<T | null> {
        if (!redis) return null;
        try {
            const cached = await redis.get(key);
            if (!cached) return null;

            return JSON.parse(cached) as T;
        } catch (err) {
            logger.warn({ context: "cache", key, error: err }, "Cache read or parse failed");
            return null;
        }
    }

    /**
     * Sets a value in cache
     */
    static async set<T = unknown>(key: string, data: T, ttl: number): Promise<void> {
        if (!redis) return;
        try {
            await redis.setex(key, ttl, JSON.stringify(data));
        } catch (err) {
            logger.error({ context: "cache", key, error: err }, "Redis write failed");
        }
    }

    /**
     * Invalidate one or more keys (alias for del)
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
            } else {
                await redis.del(setKey);
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

    /**
     * Clear all cached data (Flush Database)
     */
    static async clearAll(): Promise<void> {
        if (!redis) return;
        try {
            // SECURITY: Avoid flushdb() as it wipes security blacklists (A2).
            // PERFORMANCE: Use SCAN instead of KEYS to avoid blocking the Redis server (P1).
            const namespaces = [
                "article:*", "project:*", "skill:*", "experience:*", 
                "testimonial:*", "guestbook:*", "settings:*", "mindset:*",
                "chat:*", "analytics:*"
            ];
            
            for (const pattern of namespaces) {
                let cursor = "0";
                do {
                    // Scan for keys matching the pattern in batches of 100
                    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
                    cursor = nextCursor;
                    
                    if (keys.length > 0) {
                        await redis.del(...keys);
                    }
                } while (cursor !== "0");
            }
            
            logger.info({ context: "cache" }, "Safe targeted cache cleared via SCAN");
        } catch (err) {
            logger.error({ context: "cache", error: err }, "Safe cache clear failed");
            throw err;
        }
    }
}
