import * as Sentry from "@sentry/node";
import { env } from "./env.js";

const PROFILING_SUPPORTED_NODE_MAJORS = new Set([16, 18, 20, 22, 24]);
const isProfilingEnabled = process.env.SENTRY_PROFILING_ENABLED === "true";

async function getSentryIntegrations() {
    if (!isProfilingEnabled) {
        return [];
    }

    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0] ?? "", 10);

    if (!PROFILING_SUPPORTED_NODE_MAJORS.has(nodeMajor)) {
        console.warn(
            `[Sentry Profiling] SENTRY_PROFILING_ENABLED=true but Node ${process.versions.node} is not in the supported majors: ${Array.from(PROFILING_SUPPORTED_NODE_MAJORS).join(", ")}`
        );
        return [];
    }

    try {
        const { nodeProfilingIntegration } = await import("@sentry/profiling-node");
        return [nodeProfilingIntegration()];
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        console.warn(`[Sentry Profiling] Profiling integration unavailable: ${reason}`);
        return [];
    }
}

if (env.SENTRY_DSN) {
    const integrations = await getSentryIntegrations();

    Sentry.init({
        dsn: env.SENTRY_DSN,
        // Setting this option to true sends default PII data (e.g. user IP)
        sendDefaultPii: false,
        environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV,
        integrations,
        // Performance Monitoring
        tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
        // Profiling requires native bindings and supported Node versions.
        // If unavailable, keep profiling disabled while retaining tracing.
        profilesSampleRate: integrations.length > 0 ? 1.0 : 0,
    });
}
