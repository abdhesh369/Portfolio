import pino from "pino";
import { env } from "../env.js";

/**
 * Configure the Pino logger.
 * In development, we use pino-pretty for human-readable output.
 * In production, we use structured JSON for log aggregation.
 */
const transport = env.NODE_ENV === "development"
    ? {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
        },
    }
    : undefined;

export const logger = pino({
    level: env.NODE_ENV === "development" ? "debug" : "info",
    transport,
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
    // Add useful metadata to all logs
    base: {
        env: env.NODE_ENV,
        service: "portfolio-backend",
    },
});
