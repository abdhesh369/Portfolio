import { Redis } from "ioredis";
import { env } from "../env.js";

const DEFAULT_REDIS_URL = "redis://localhost:6379";

/**
 * Global Redis Client
 * Provides a unified way to access Redis for caching and session management.
 */
class RedisClient {
    private static instance: Redis | null = null;
    private static isConnected: boolean = false;

    public static getInstance(): Redis | null {
        if (!env.REDIS_URL && env.NODE_ENV === "production") {
            console.error("❌ [REDIS] Error: REDIS_URL is missing in production.");
            return null;
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
                    console.log("✓ [REDIS] Connected successfully");
                });

                this.instance.on("error", (err) => {
                    this.isConnected = false;
                    console.error(`❌ [REDIS] Connection error: ${err.message}`);
                });

            } catch (error) {
                console.error(`❌ [REDIS] Failed to initialize: ${error}`);
                return null;
            }
        }

        return this.instance;
    }

    public static get isReady(): boolean {
        return this.isConnected;
    }
}

export const redis = RedisClient.getInstance();
