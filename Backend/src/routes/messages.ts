import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Resend } from "resend";
import rateLimit from "express-rate-limit";
import { messageService } from "../services/message.service.js";
import { insertMessageApiSchema } from "../../shared/schema.js";
import { api } from "../../shared/routes.js";
import { env } from "../env.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import DOMPurify from 'isomorphic-dompurify';
import { emailQueue } from "../lib/queue.js";
import { logger } from "../lib/logger.js";
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Rate Limiter: max 5 requests per 15 minutes
const contactFormLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many messages sent from this IP, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

import { validateBody } from "../middleware/validate.js";

// Rate Limiter: max 5 requests per 15 minutes

export function registerMessageRoutes(app: Router) {
    // GET /messages - List all messages (admin only)
    app.get(
        "/messages",
        isAuthenticated,
        asyncHandler(async (_req, res) => {
            const messages = await messageService.getAll();
            res.json(messages);
        })
    );

    // POST /messages/bulk-delete - Bulk delete messages
    app.post(
        "/messages/bulk-delete",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const schema = z.object({ ids: z.array(z.number()) });
            const { ids } = schema.parse(req.body);
            await messageService.bulkDelete(ids);
            res.status(204).send();
        })
    );

    // GET /messages/:id - Get single message
    app.get(
        "/messages/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid message ID" });
                return;
            }
            const message = await messageService.getById(id);
            if (!message) {
                res.status(404).json({ message: "Message not found" });
                return;
            }
            res.json(message);
        })
    );

    // POST /messages - Create message (contact form)
    app.post(
        "/messages",
        contactFormLimiter,
        validateBody(insertMessageApiSchema),
        asyncHandler(async (req, res) => {
            try {
                const message = await messageService.create(req.body);
                logger.info({ context: "messages", name: message.name, email: message.email }, "New message received");

                // Send response immediately
                res.status(201).json({
                    success: true,
                    message: "Message sent! We'll get back to you soon.",
                    data: message,
                });

                // Email Notification Integration (Fire-and-forget via Queue)
                if (emailQueue) {
                    emailQueue.add("send-contact-email", {
                        type: "contact-notification",
                        payload: {
                            message,
                            targetEmail: env.ADMIN_EMAIL,
                        }
                    }).catch(err => logger.error({ context: "messages", error: err }, "Failed to queue email"));
                } else {
                    logger.warn({ context: "messages" }, "Skipping email notification: Queue not initialized");
                }
            } catch (error: any) {
                if (error.message === "Message rejected") {
                    logger.warn({ context: "messages", email: req.body.email }, "Spam blocked (Honeypot filled)");
                    // Fake success to trick the bot
                    res.status(201).json({
                        success: true,
                        message: "Message sent! We'll get back to you soon.",
                        data: { id: 0, message: "blocked" },
                    });
                    return;
                }
                throw error;
            }
        })
    );

    // POST /messages/:id/reply - Reply to a message
    app.post(
        "/messages/:id/reply",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid message ID" });
                return;
            }

            const schema = z.object({
                subject: z.string().min(1),
                body: z.string().min(1),
            });

            const { subject, body } = schema.parse(req.body);

            const message = await messageService.getById(id);
            if (!message) {
                res.status(404).json({ message: "Message not found" });
                return;
            }

            if (!env.RESEND_API_KEY) {
                res.status(500).json({ message: "Email service not configured (RESEND_API_KEY missing)" });
                return;
            }

            const resend = new Resend(env.RESEND_API_KEY);

            // Sanitize HTML before sending — block javascript: URIs and enforce secure links
            const sanitizedBody = DOMPurify.sanitize(body, {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
                ALLOWED_ATTR: ['href', 'target', 'rel'],
                FORBID_ATTR: [],
                ALLOW_DATA_ATTR: false,
            });
            // Post-process: strip javascript: hrefs and enforce rel="noopener noreferrer"
            const safeSanitizedBody = sanitizedBody
                .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
                .replace(/<a\b([^>]*?)(\srel="[^"]*")?([^>]*?)>/gi, (match, p1, p2, p3) => {
                    // Remove any existing rel attribute and add the mandatory one
                    return `<a${p1}${p3} rel="noopener noreferrer">`;
                });

            if (emailQueue) {
                try {
                    await emailQueue.add("send-reply-email", {
                        type: "admin-reply",
                        payload: {
                            to: message.email,
                            subject: subject,
                            html: safeSanitizedBody,
                        }
                    });
                    logger.info({ context: "messages", to: message.email }, "Queued reply");
                    res.json({ success: true, message: "Reply queued successfully" });
                } catch (queueError: any) {
                    logger.error({ context: "messages", to: message.email, error: queueError.message }, "Failed to queue reply");
                    res.status(500).json({ message: `Failed to queue email: ${queueError.message}` });
                }
            } else {
                res.status(500).json({ message: "Email queue not configured (Redis required)" });
            }
        })
    );

    // DELETE /messages/:id - Delete message
    app.delete(
        "/messages/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid message ID" });
                return;
            }
            const deleted = await messageService.delete(id);
            if (!deleted) {
                res.status(404).json({ message: "Message not found" });
                return;
            }
            res.status(204).send();
        })
    );
}
