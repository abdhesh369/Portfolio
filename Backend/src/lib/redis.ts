import { Redis } from "ioredis";
import { env } from "../env.js";
import { logger } from "./logger.js";

const DEFAULT_REDIS_URL = "redis://localhost:6379";

function isLocalRedisUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^\[|\]$/g, "");
        return host === "localhost" || host === "127.0.0.1" || host === "::1";
    } catch {
        return false;
    }
}

/**
 * Global Redis Client
 * Provides a unified way to access Redis for caching and session management.
 */
export class RedisClient {
    private static instance: Redis | null = null; private static isConnected: boolean = false;

    public static getInstance(): Redis | null {
        if (env.NODE_ENV === "production") {
            if (!env.REDIS_URL) {
                logger.warn({ context: "redis" }, "REDIS_URL is missing in production. Redis will be disabled.");
                return null;
            }

            if (isLocalRedisUrl(env.REDIS_URL)) {
                logger.warn(
                    { context: "redis", url: env.REDIS_URL },
                    "REDIS_URL points to localhost in production. Redis will be disabled."
                );
                return null;
            }
        }

        if (!this.instance) {
            const url = env.REDIS_URL || DEFAULT_REDIS_URL;

            try {
                this.instance = new Redis(url, {
                    maxRetriesPerRequest: 3,
                    retryStrategy(times) {
                        const delay = Math.min(times * 50, 2000);
                        return delay;
                    },
                    reconnectOnError(err) {
                        const targetError = "READONLY";
                        if (err.message.includes(targetError)) {
                            return true;
                        }
                        return false;
                    },
                });

                this.instance.on("connect", () => {
                    this.isConnected = true;
                    logger.info({ context: "redis" }, "Connected successfully");
                });

                this.instance.on("error", (err: Error) => {
                    this.isConnected = false;
                    logger.error({ context: "redis", error: err.message }, "Connection error");
                });
            } catch (error) {
                logger.error({ context: "redis", error }, "Failed to initialize");
                return null;
            }
        }

        return this.instance;
    }

    public static get isReady(): boolean {
        return this.isConnected;
    }

    public static async checkHealth(): Promise<{ healthy: boolean; message: string }> {
        if (!this.instance) {
            return { healthy: false, message: "Redis client not initialized" };
        }
        try {
            await this.instance.ping();
            return { healthy: true, message: "Redis connected successfully" };
        } catch (error: any) {
            return { healthy: false, message: error.message };
        }
    }

    public static async quit(): Promise<void> {
        if (this.instance) {
            await this.instance.quit();
            this.instance = null;
            this.isConnected = false;
            logger.info({ context: "redis" }, "Disconnected gracefully");
        }
    }
}

export const redis = RedisClient.getInstance();
