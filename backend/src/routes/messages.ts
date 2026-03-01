import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Resend } from "resend";
import rateLimit from "express-rate-limit";
import { storage } from "../storage.js";
import { insertMessageApiSchema } from "../../shared/schema.js";
import { api } from "../../shared/routes.js";
import { env } from "../env.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import DOMPurify from 'isomorphic-dompurify';

// Simple HTML escaping helper to prevent XSS in email templates
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

// Validation middleware factory
function validateBody<T extends z.ZodType>(schema: T) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (err) {
            if (err instanceof z.ZodError) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: err.errors.map((e) => ({
                        path: e.path.join("."),
                        message: e.message,
                    })),
                });
                return;
            }
            next(err);
        }
    };
}

// Logger helper
function log(message: string, level: "info" | "error" | "warn" = "info") {
    const timestamp = new Date().toISOString();
    const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✓";
    console.log(`${prefix} [${timestamp}] [ROUTES] ${message}`);
}

export function registerMessageRoutes(app: Router) {
    // GET /messages - List all messages (admin only)
    app.get(
        "/messages",
        isAuthenticated,
        asyncHandler(async (_req, res) => {
            const messages = await storage.getMessages();
            res.json(messages);
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
            const message = await storage.getMessageById(id);
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
            // Honeypot check for spam prevention
            if (req.body.website) {
                log(`Spam blocked (Honeypot filled): ${req.body.email}`, "warn");
                // Fake success to trick the bot
                res.status(201).json({
                    success: true,
                    message: "Message sent! We'll get back to you soon.",
                    data: { id: 0, name: req.body.name, email: req.body.email, subject: req.body.subject, message: "blocked", createdAt: new Date().toISOString() },
                });
                return;
            }

            // Clean data
            const dataToSave = { ...req.body };
            delete dataToSave.website;

            const message = await storage.createMessage(dataToSave);
            log(`New message from: ${message.name} (${message.email})`);

            // Send response immediately
            res.status(201).json({
                success: true,
                message: "Message sent! We'll get back to you soon.",
                data: message,
            });

            // Email Notification Integration (Fire-and-forget)
            (async () => {
                try {
                    if (!env.RESEND_API_KEY) {
                        log("Skipping email: RESEND_API_KEY not set", "warn");
                        return;
                    }

                    const resend = new Resend(env.RESEND_API_KEY);

                    // The verified domain is now used as the sender
                    const targetEmail = env.ADMIN_EMAIL;

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
                        log(`Failed to send email notification: ${error.message}`, "error");
                    } else {
                        log(`Email notification sent successfully. ID: ${data?.id}`);
                    }

                } catch (emailError) {
                    log(`Failed to send email notification: ${emailError}`, "error");
                }
            })();
        })
    );

    // POST /messages/bulk-delete - Bulk delete messages
    app.post(
        "/messages/bulk-delete",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const schema = z.object({ ids: z.array(z.number()) });
            const { ids } = schema.parse(req.body);
            await storage.bulkDeleteMessages(ids);
            res.status(204).send();
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

            const message = await storage.getMessageById(id);
            if (!message) {
                res.status(404).json({ message: "Message not found" });
                return;
            }

            if (!env.RESEND_API_KEY) {
                res.status(500).json({ message: "Email service not configured (RESEND_API_KEY missing)" });
                return;
            }

            const resend = new Resend(env.RESEND_API_KEY);

            // Sanitize HTML before sending
            const sanitizedBody = DOMPurify.sanitize(body, {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
                ALLOWED_ATTR: ['href', 'target']
            });

            const { error } = await resend.emails.send({
                from: env.CONTACT_EMAIL,
                to: message.email,
                subject: subject,
                html: sanitizedBody,
            });

            if (error) {
                log(`Failed to send reply to ${message.email}: ${error.message}`, "error");
                res.status(500).json({ message: `Failed to send email: ${error.message}` });
                return;
            }

            log(`Reply sent to ${message.email}`);
            res.json({ success: true, message: "Reply sent successfully" });
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
            await storage.deleteMessage(id);
            res.status(204).send();
        })
    );
}
