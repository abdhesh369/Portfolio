import { Queue, Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { Resend } from "resend";
import { env } from "../env.js";

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
const canUseRedis = !isProd || !!env.REDIS_URL;

export const emailQueue = canUseRedis ? new Queue("email", {
    connection: getRedisConnection() as any
}) : null;

export const emailWorker = canUseRedis ? new Worker("email", async (job: Job) => {
    const { type, payload } = job.data;

    if (!env.RESEND_API_KEY) {
        console.warn("[QUEUE] Skipping email: RESEND_API_KEY not set");
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
        console.log(`✅ [JOB:E-MAIL] Job ${job.id} completed successfully (${job.data.type})`);
    });

    emailWorker.on("failed", (job, err) => {
        console.error(`❌ [JOB:E-MAIL] Job ${job?.id} failed (${job?.data?.type}):`, err);
    });
}
