import { Router } from "express";
import { isAuthenticated } from "../auth.js";
import { asyncHandler } from "../lib/async-handler.js";
import { recordAudit } from "../lib/audit.js";
import { BulkImageService } from "../services/bulk-image.service.js";
import { logger } from "../lib/logger.js";
import { env } from "../env.js";
import { SubscriberService } from "../services/subscriber.service.js";
import { emailService } from "../services/email.service.js";
import { z } from "zod";

const subscriberService = new SubscriberService();

export function registerAdminRoutes(app: Router) {
    // POST /api/v1/admin/optimize-images - Scan and optimize all images
    app.post(
        "/admin/optimize-images",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            logger.info({ context: "admin-tools", user: typeof req.user === 'object' ? req.user.email : undefined }, "Starting bulk image optimization");

            try {
                const stats = await BulkImageService.optimizeAll();

                recordAudit("UPDATE", "bulk_image_optimizer", undefined, null, stats as unknown as Record<string, unknown>);

                res.json({
                    success: true,
                    message: "Image optimization completed successfully",
                    data: stats
                });
            } catch (error: unknown) {
                logger.error({ context: "admin-tools", error }, "Bulk image optimization failed");
                res.status(500).json({
                    success: false,
                    message: "Image optimization failed",
                    details: error instanceof Error ? error.message : "Unknown error"
                });
            }
        })
    );

    // POST /api/v1/admin/deploy - Trigger production deployment
    app.post(
        "/admin/deploy",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const userEmail = typeof req.user === 'object' ? req.user.email : undefined;
            logger.info({ context: "admin-tools", user: userEmail }, "Request to trigger production deployment");

            if (!env.RENDER_DEPLOY_HOOK_URL) {
                logger.warn({ context: "admin-tools" }, "Deployment failed: RENDER_DEPLOY_HOOK_URL not configured");
                return res.status(400).json({
                    success: false,
                    message: "Deployment hook URL is not configured in environment variables."
                });
            }

            try {
                const response = await fetch(env.RENDER_DEPLOY_HOOK_URL, {
                    method: "POST"
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Render hook returned ${response.status}: ${errorText}`);
                }

                recordAudit("OTHER", "production_deployment", undefined, null, { triggeredBy: userEmail });

                logger.info({ context: "admin-tools" }, "Production deployment triggered successfully");
                res.json({
                    success: true,
                    message: "Production deployment triggered successfully via Render hook."
                });
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Unknown error";
                logger.error({ context: "admin-tools", error: message }, "Failed to trigger production deployment");
                res.status(500).json({
                    success: false,
                    message: "Failed to trigger deployment",
                    details: message
                });
            }
        })
    );

    // POST /api/v1/admin/subscribers/broadcast - Send newsletter to all active subscribers
    app.post(
        "/admin/subscribers/broadcast",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const { subject, body } = z.object({
                subject: z.string().min(1).max(255),
                body: z.string().min(1)
            }).parse(req.body);

            const subscribers = await subscriberService.getActiveSubscribers();
            logger.info({ count: subscribers.length }, "Starting newsletter broadcast");

            // Add all to email queue
            for (const sub of subscribers) {
                await emailService.sendBroadcast({
                    to: sub.email,
                    subject,
                    html: body // body is expected to be HTML from the frontend composer
                });
            }

            recordAudit("OTHER", "newsletter_broadcast", undefined, null, { 
                subject, 
                recipientCount: subscribers.length 
            });

            res.json({
                success: true,
                message: `Broadcast queued for ${subscribers.length} subscribers.`,
                count: subscribers.length
            });
        })
    );
}
