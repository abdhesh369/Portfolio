import { Queue, Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { Resend } from "resend";
import { env } from "../env.js";
import { logger } from "./logger.js";

function isLocalRedisUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^\[|\]$/g, "");
        return host === "localhost" || host === "127.0.0.1" || host === "::1";
    } catch {
        return false;
    }
}

function formatRedisUrlForLog(url?: string): string | undefined {
    if (!url) return undefined;

    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^\[|\]$/g, "");
        const port = parsed.port ? `:${parsed.port}` : "";
        const dbPath = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "";
        return `${parsed.protocol}//${host}${port}${dbPath}`;
    } catch {
        return "[invalid REDIS_URL]";
    }
}

// BullMQ requires dedicated ioredis connections with maxRetriesPerRequest: null.
// Queue and Worker each need their own connection (BullMQ internal requirement).
// These are intentionally separate from the app-level redis singleton in redis.ts.
function getRedisConnection() {
    return new Redis(env.REDIS_URL || "redis://localhost:6379", {
        maxRetriesPerRequest: null, // BullMQ requires this to be null
        retryStrategy(times) {
            return Math.min(times * 50, 2000);
        }
    });
}

// Ensure BullMQ is only active if REDIS validation passes or running locally
const isProd = process.env.NODE_ENV === "production";
const hasRedisUrl = !!env.REDIS_URL;
const isProdLocalRedis = isProd && hasRedisUrl && isLocalRedisUrl(env.REDIS_URL as string);

if (isProd && (!hasRedisUrl || isProdLocalRedis)) {
    logger.warn(
        {
            context: "queue",
            redisConfigured: hasRedisUrl,
            redisUrl: formatRedisUrlForLog(env.REDIS_URL),
        },
        "Queue disabled in production: REDIS_URL is missing or points to localhost. Set REDIS_URL to a managed Redis endpoint (recommended rediss://...) or unset REDIS_URL to disable background jobs intentionally."
    );
}

const canUseRedis = !isProd || (hasRedisUrl && !isProdLocalRedis);

export const emailQueue = canUseRedis ? new Queue("email", {
    connection: getRedisConnection() as any
}) : null;

export const emailWorker = canUseRedis ? new Worker("email", async (job: Job) => {
    const { type, payload } = job.data;

    if (!env.RESEND_API_KEY) {
        logger.warn({ context: "queue" }, "Skipping email: RESEND_API_KEY not set");
        return;
    }

    const resend = new Resend(env.RESEND_API_KEY);

    if (type === "contact-notification") {
        const { message, targetEmail } = payload;

        // Simple HTML escaping helper for job background
        function escapeHtml(text: string): string {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        const { data, error } = await resend.emails.send({
            from: env.CONTACT_EMAIL,
            to: targetEmail,
            subject: `Portfolio Message: ${escapeHtml(message.subject || "No Subject")}`,
            html: `
            <h3>New Message from Portfolio</h3>
            <p><strong>Name:</strong> ${escapeHtml(message.name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(message.email)}</p>
            <p><strong>Subject:</strong> ${escapeHtml(message.subject || "")}</p>
            <hr/>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${escapeHtml(message.message)}</p>
            `,
        });

        if (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
        return data;
    } else if (type === "admin-reply") {
        const { to, subject, html } = payload;
        const { data, error } = await resend.emails.send({
            from: env.CONTACT_EMAIL,
            to,
            subject,
            html
        });

        if (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
        return data;
    } else {
        throw new Error(`Unknown job type: ${type}`);
    }
}, {
    connection: getRedisConnection() as any
}) : null;

if (emailWorker) {
    emailWorker.on("completed", (job) => {
        logger.info({ context: "queue", jobId: job.id, type: job.data.type }, "Job completed successfully");
    });

    emailWorker.on("failed", (job, err) => {
        logger.error({ context: "queue", jobId: job?.id, type: job?.data?.type, error: err }, "Job failed");
    });
}
