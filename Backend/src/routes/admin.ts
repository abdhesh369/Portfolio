import { Router } from "express";
import { isAuthenticated } from "../auth.js";
import { asyncHandler } from "../lib/async-handler.js";
import { recordAudit } from "../lib/audit.js";
import { BulkImageService } from "../services/bulk-image.service.js";
import { logger } from "../lib/logger.js";
import { env } from "../env.js";
import { SubscriberService } from "../services/subscriber.service.js";
import { emailService } from "../services/email.service.js";
import { CacheService } from "../lib/cache.js";
import { z } from "zod";
import { isAdmin } from "../auth.js";
import { validateSafeUrl } from "../lib/url-validator.js";

const subscriberService = new SubscriberService();

export function registerAdminRoutes(app: Router) {
    // POST /api/v1/admin/optimize-images - Scan and optimize all images
    app.post(
        "/admin/optimize-images",
        isAuthenticated,
        isAdmin,
        asyncHandler(async (req, res) => {
            logger.info({ context: "admin-tools", user: req.user?.email || "unknown" }, "Starting bulk image optimization");

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
        isAdmin,
        asyncHandler(async (req, res) => {
            const userEmail = req.user?.email || "unknown";
            logger.info({ context: "admin-tools", user: userEmail }, "Request to trigger production deployment");

            if (!env.RENDER_DEPLOY_HOOK_URL) {
                logger.warn({ context: "admin-tools" }, "Deployment failed: RENDER_DEPLOY_HOOK_URL not configured");
                return res.status(400).json({
                    success: false,
                    message: "Deployment hook URL is not configured in environment variables."
                });
            }

            try {
                const { url, resolvedIp } = await validateSafeUrl(env.RENDER_DEPLOY_HOOK_URL);
                const parsedUrl = new URL(url);

                // For DNS rebinding prevention, connect to the resolved IP directly
                // but keep the original Host header for the server.
                const requestUrl = url.replace(parsedUrl.hostname, resolvedIp);

                const response = await fetch(requestUrl, {
                    method: "POST",
                    headers: {
                        "Host": parsedUrl.hostname
                    }
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
        isAdmin,
        asyncHandler(async (req, res) => {
            const { subject, body } = z.object({
                subject: z.string().min(1).max(255),
                body: z.string().min(1)
            }).parse(req.body);

            const subscribers = await subscriberService.getActiveSubscribers();
            if (subscribers.length === 0) {
                return res.json({ success: true, message: "No active subscribers found.", count: 0 });
            }

            logger.info({ count: subscribers.length }, "Starting newsletter broadcast");

            // Execute all broadcasts concurrently
            const results = await Promise.allSettled(
                subscribers.map(sub => 
                    emailService.sendBroadcast({
                        to: sub.email,
                        subject,
                        html: body
                    })
                )
            );

            const succeeded = results.filter(r => r.status === "fulfilled").length;
            const failed = results.filter(r => r.status === "rejected").length;

            recordAudit("OTHER", "newsletter_broadcast", undefined, null, { 
                subject, 
                recipientCount: subscribers.length,
                succeeded,
                failed
            });

            res.json({
                success: true,
                message: `Broadcast completed. Succeeded: ${succeeded}, Failed: ${failed}`,
                data: {
                    total: subscribers.length,
                    succeeded,
                    failed
                }
            });
        })
    );

    // POST /api/v1/admin/cache/clear - Clear system cache
    app.post(
        "/admin/cache/clear",
        isAuthenticated,
        isAdmin,
        asyncHandler(async (req, res) => {
            logger.info({ context: "admin-tools", user: req.user?.email || "unknown" }, "Clearing system cache");

            try {
                await CacheService.clearAll();
                recordAudit("OTHER", "cache_clear", undefined, null, { triggeredBy: typeof req.user === 'object' ? req.user.email : undefined });

                res.json({
                    success: true,
                    message: "System cache cleared successfully"
                });
            } catch (error: unknown) {
                logger.error({ context: "admin-tools", error }, "Cache clear failed");
                res.status(500).json({
                    success: false,
                    message: "Failed to clear cache",
                    details: error instanceof Error ? error.message : "Unknown error"
                });
            }
        })
    );
}
