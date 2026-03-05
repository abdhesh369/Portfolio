import { Router } from "express";
import { guestbookService } from "../services/guestbook.service.js";
import { asyncHandler, isAuthenticated } from "../auth.js";
import { z } from "zod";
import { validateBody } from "../middleware/validate.js";
import rateLimit from "express-rate-limit";

import { cachePublic } from "../middleware/cache.js";

const guestbookRoutes = Router();

const guestbookLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 guestbook entries per hour
    message: { message: "Too many guestbook entries, please try again in an hour" }
});

const insertGuestbookSchema = z.object({
    name: z.string().min(1).max(255),
    content: z.string().min(1).max(1000),
    email: z.string().email().max(255).optional().or(z.literal("")),
});

// GET /guestbook - Fetch approved entries
guestbookRoutes.get("/", cachePublic(60), asyncHandler(async (_req, res) => {
    const entries = await guestbookService.getMessages(true);
    res.json(entries);
}));

// POST /guestbook - Submit a new entry
guestbookRoutes.post("/", guestbookLimiter, validateBody(insertGuestbookSchema), asyncHandler(async (req, res) => {
    const entry = await guestbookService.addMessage(req.body);
    res.status(201).json({
        message: "Thank you for your message! It will appear once approved.",
        entry
    });
}));

// --- Admin Routes ---

// GET /guestbook/admin - Fetch all entries (unfiltered)
guestbookRoutes.get("/admin", isAuthenticated, asyncHandler(async (_req, res) => {
    const entries = await guestbookService.getMessages(false);
    res.json(entries);
}));

// PATCH /guestbook/:id/approve - Approve an entry
guestbookRoutes.patch("/:id/approve", isAuthenticated, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ message: "Invalid guestbook entry ID" });
        return;
    }
    const entry = await guestbookService.approveMessage(id);
    res.json(entry);
}));

// DELETE /guestbook/:id - Delete an entry
guestbookRoutes.delete("/:id", isAuthenticated, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ message: "Invalid guestbook entry ID" });
        return;
    }
    await guestbookService.deleteMessage(id);
    res.status(204).end();
}));

export default guestbookRoutes;
