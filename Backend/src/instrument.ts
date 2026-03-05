import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { env } from "./env.js";

if (env.SENTRY_DSN) {
    Sentry.init({
        dsn: env.SENTRY_DSN,
        // Setting this option to true sends default PII data (e.g. user IP)
        sendDefaultPii: true,
        environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV,
        integrations: [
            nodeProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
    });
}
