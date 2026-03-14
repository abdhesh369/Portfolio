import { Queue, Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { Resend } from "resend";
import { env } from "../env.js";
import { logger } from "./logger.js";
import { isLocalRedisUrl, formatRedisUrlForLog } from "./redis.js";
import { createScopeWorker } from "../workers/scope.worker.js";

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

// bullmq bundles its own ioredis — cast via the ConnectionOptions shape it actually expects
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ioredis version mismatch; pinned in root overrides
function toBullMQConnection(r: ReturnType<typeof getRedisConnection>) {
    return r as unknown as import("bullmq").ConnectionOptions;
}

// Ensure BullMQ is only active if REDIS validation passes or running locally
const isProd = process.env.NODE_ENV === "production";
const hasRedisUrl = !!env.REDIS_URL;
const isProdLocalRedis = isProd && hasRedisUrl && isLocalRedisUrl(env.REDIS_URL as string);

const canUseRedis = !isProd || (hasRedisUrl && !isProdLocalRedis);

export let emailQueue: Queue | null = null;
export let scopeQueue: Queue | null = null;
export let emailWorker: Worker | null = null;
export let scopeWorker: Worker | null = null;

import { emailTemplateService } from "../services/email-template.service.js";

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function initQueues() {
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

    if (!canUseRedis) return;

    logger.info({ context: "queue" }, "📍 Initializing BullMQ queues and workers...");

    const defaultJobOptions = {
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false, // Keep failed jobs for manual inspection
    };

    emailQueue = new Queue("email", {
        connection: toBullMQConnection(getRedisConnection()),
        defaultJobOptions
    });

    scopeQueue = new Queue("scope", {
        connection: toBullMQConnection(getRedisConnection()),
        defaultJobOptions
    });

    emailWorker = new Worker("email", async (job: Job) => {
        const { type, payload } = job.data;

        if (!env.RESEND_API_KEY) {
            logger.warn({ context: "queue" }, "Skipping email: RESEND_API_KEY not set");
            return;
        }

        const resend = new Resend(env.RESEND_API_KEY);

        if (type === "contact-notification") {
            const { message, targetEmail } = payload;

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
        } else if (type === "admin-notification") {
            const { to, subject, html, attachments } = payload;
            const { data, error } = await resend.emails.send({
                from: env.CONTACT_EMAIL, 
                to: to || env.ADMIN_EMAIL,
                subject,
                html,
                attachments
            });

            if (error) {
                throw new Error(`Failed to send admin notification: ${error.message}`);
            }
            return data;
        } else if (type === "client-notification") {
            const { to, subject, html, attachments } = payload;
            const { data, error } = await resend.emails.send({
                from: env.CONTACT_EMAIL,
                to,
                subject,
                html,
                attachments
            });

            if (error) {
                throw new Error(`Failed to send client notification: ${error.message}`);
            }
            return data;
        } else if (type === "auto-reply") {
            const { message } = payload;
            
            // Try to find a dynamic template
            const templates = await emailTemplateService.getAll();
            const dynamicTemplate = templates.find(t => t.name.toLowerCase().includes('auto-reply') || t.name.toLowerCase().includes('inquiry'));

            let subject = "Thank you for reaching out!";
            let html = `
                <p>Hi ${escapeHtml(message.name)},</p>
                <p>Thank you for your message. I have received it and will get back to you as soon as possible.</p>
                <p>Best regards,<br/>Portfolio Admin</p>
            `;

            if (dynamicTemplate) {
                subject = dynamicTemplate.subject;
                html = dynamicTemplate.body.replace(/\{name\}/g, escapeHtml(message.name));
            }

            const { data, error } = await resend.emails.send({
                from: env.CONTACT_EMAIL,
                to: message.email,
                subject,
                html
            });

            if (error) {
                throw new Error(`Failed to send auto-reply email: ${error.message}`);
            }
            return data;
        } else {
            throw new Error(`Unknown job type: ${type}`);
        }
    }, {
        connection: toBullMQConnection(getRedisConnection())
    });

    scopeWorker = createScopeWorker(getRedisConnection() as unknown as import("ioredis").Redis);

    if (emailWorker) {
        emailWorker.on("completed", (job) => {
            logger.info({ context: "queue", jobId: job.id, type: job.data.type }, "Job completed successfully");
        });

        emailWorker.on("failed", (job, err) => {
            logger.error({ context: "queue", jobId: job?.id, type: job?.data?.type, error: err }, "Job failed");
        });
    }

    logger.info({ context: "queue" }, "✓ BullMQ queues and workers initialized");
}
