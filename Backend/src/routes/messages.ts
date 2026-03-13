import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Resend } from "resend";
import { contactLimiter } from "../lib/rate-limit.js";
import { messageService } from "../services/message.service.js";
import { insertMessageApiSchema } from "@portfolio/shared";
import { api } from "@portfolio/shared";
import { env } from "../env.js";
import { isAuthenticated } from "../auth.js";
import { asyncHandler } from "../lib/async-handler.js";
import DOMPurify from 'isomorphic-dompurify';
import { emailQueue } from "../lib/queue.js";
import { logger } from "../lib/logger.js";
import { recordAudit } from "../lib/audit.js";
import { parseIntParam } from "../lib/params.js";

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

import { validateBody } from "../middleware/validate.js";
import { messageSSE } from "../lib/sse.js";
import crypto from "crypto";

// Rate Limiter: max 5 requests per 15 minutes

export function registerMessageRoutes(app: Router) {
    // GET /messages/stream - SSE endpoint for real-time message notifications (admin only)
    app.get(
        "/messages/stream",
        isAuthenticated,
        (req: Request, res: Response) => {
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no", // Disable nginx buffering
            });

            // Send initial connection event
            res.write(`event: connected\ndata: ${JSON.stringify({ status: "ok" })}\n\n`);

            const clientId = crypto.randomUUID();
            messageSSE.addClient(clientId, res);

            req.on("close", () => {
                messageSSE.removeClient(clientId);
            });
        }
    );

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

            // Audit log (A2)
            recordAudit("DELETE", "message_bulk", undefined, null, { deletedIds: ids });

            res.status(204).send();
        })
    );

    // GET /messages/:id - Get single message
    app.get(
        "/messages/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseIntParam(res, req.params.id, "message ID");
            if (id === null) return;
            const message = await messageService.getById(id);
            if (!message) {
                res.status(404).json({ success: false, message: "Message not found" });
                return;
            }
            res.json(message);
        })
    );

    // POST /messages - Create message (contact form)
    app.post(
        "/messages",
        contactLimiter,
        validateBody(insertMessageApiSchema),
        asyncHandler(async (req, res) => {
            try {
                const message = await messageService.create(req.body);
                logger.info({ context: "messages", name: message.name, email: message.email }, "New message received");

                // Emit SSE event for real-time admin notification
                messageSSE.emit("new-message", {
                    id: message.id,
                    name: message.name,
                    subject: message.subject,
                    createdAt: message.createdAt,
                });

                // Send response immediately
                res.status(201).json({
                    success: true,
                    message: "Message sent! We'll get back to you soon.",
                    data: message,
                });

                // Direct fallback logic
                const sendDirectFallback = async (jobType: string, payload: any) => {
                    if (!env.RESEND_API_KEY) {
                        logger.error({ context: "messages" }, "RESEND_API_KEY not set - contact form emails are disabled");
                        return;
                    }
                    try {
                        const resend = new Resend(env.RESEND_API_KEY);
                        if (jobType === "contact-notification") {
                            await resend.emails.send({
                                from: env.CONTACT_EMAIL || "onboarding@resend.dev",
                                to: payload.targetEmail,
                                subject: `Portfolio Message: ${escapeHtml(payload.message.subject || "No Subject")}`,
                                html: `
                                <h3>New Message from Portfolio</h3>
                                <p><strong>Name:</strong> ${escapeHtml(payload.message.name)}</p>
                                <p><strong>Email:</strong> ${escapeHtml(payload.message.email)}</p>
                                <hr/>
                                <p><strong>Message:</strong></p>
                                <p style="white-space: pre-wrap;">${escapeHtml(payload.message.message)}</p>
                                `
                            });
                        } else if (jobType === "auto-reply") {
                            const { emailTemplateService } = await import("../services/email-template.service.js");
                            const templates = await emailTemplateService.getAll();
                            const dynamicTemplate = templates.find(t => t.name.toLowerCase().includes('auto-reply') || t.name.toLowerCase().includes('inquiry'));

                            let subject = "Thank you for reaching out!";
                            let html = `
                                <p>Hi ${escapeHtml(payload.message.name)},</p>
                                <p>Thank you for your message. I have received it and will get back to you as soon as possible.</p>
                                <p>Best regards,<br/>Portfolio Admin</p>
                            `;

                            if (dynamicTemplate) {
                                subject = dynamicTemplate.subject;
                                html = dynamicTemplate.body.replace(/\{name\}/g, escapeHtml(payload.message.name));
                            }

                            await resend.emails.send({
                                from: env.CONTACT_EMAIL || "onboarding@resend.dev",
                                to: payload.message.email,
                                subject,
                                html
                            });
                        }
                    } catch (e) {
                         logger.error({ context: "messages", error: e }, "Direct Resend fallback failed");
                    }
                };

                if (emailQueue) {
                    try {
                        await emailQueue.add("send-contact-email", {
                            type: "contact-notification",
                            payload: {
                                message,
                                targetEmail: env.ADMIN_EMAIL,
                            }
                        });
                        await emailQueue.add("send-auto-reply", {
                            type: "auto-reply",
                            payload: { message }
                        });
                    } catch (err) {
                        logger.error({ context: "messages", error: err }, "Failed to queue email. Attempting direct fallback.");
                        await sendDirectFallback("contact-notification", { message, targetEmail: env.ADMIN_EMAIL });
                        await sendDirectFallback("auto-reply", { message });
                    }
                } else {
                    logger.warn({ context: "messages" }, "Skipping queue - not initialized. Using direct Resend fallback.");
                    if (!env.RESEND_API_KEY) {
                         logger.error({ context: "messages" }, "RESEND_API_KEY not set - message stored but no email sent");
                    }
                    await sendDirectFallback("contact-notification", { message, targetEmail: env.ADMIN_EMAIL });
                    await sendDirectFallback("auto-reply", { message });
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.message === "Message rejected") {
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
            const id = parseIntParam(res, req.params.id, "message ID");
            if (id === null) return;

            const schema = z.object({
                subject: z.string().min(1),
                body: z.string().min(1),
            });

            const { subject, body } = schema.parse(req.body);

            const message = await messageService.getById(id);
            if (!message) {
                res.status(404).json({ success: false, message: "Message not found" });
                return;
            }

            if (!env.RESEND_API_KEY) {
                res.status(500).json({ success: false, message: "Email service not configured (RESEND_API_KEY missing)" });
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

                    // Audit log (A2)
                    recordAudit("CREATE", "message_reply", id, null, { subject });

                    res.json({ success: true, message: "Reply queued successfully" });
                } catch (queueError: any) {
                    logger.error({ context: "messages", to: message.email, error: queueError.message }, "Failed to queue reply");
                    res.status(500).json({ success: false, message: `Failed to queue email: ${queueError.message}` });
                }
            } else {
                res.status(500).json({ success: false, message: "Email queue not configured (Redis required)" });
            }
        })
    );

    // DELETE /messages/:id - Delete message
    app.delete(
        "/messages/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseIntParam(res, req.params.id, "message ID");
            if (id === null) return;
            const deleted = await messageService.delete(id);
            if (!deleted) {
                res.status(404).json({ success: false, message: "Message not found" });
                return;
            }

            // Audit log (A2)
            recordAudit("DELETE", "message", id);

            res.status(204).send();
        })
    );
}
