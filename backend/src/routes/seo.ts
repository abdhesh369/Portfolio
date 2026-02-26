import { Router } from "express";
import { storage } from "../storage.js";
import { insertSeoSettingsApiSchema } from "../../shared/schema.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { z } from "zod";

const router = Router();

// GET /seo - List all SEO settings
router.get(
    "/",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const settings = await storage.getSeoSettings();
        res.json(settings);
    })
);

// GET /seo/:slug - Get SEO settings by slug
router.get(
    "/:slug",
    asyncHandler(async (req, res) => {
        const slug = req.params.slug;
        const settings = await storage.getSeoSettingsBySlug(slug);
        if (!settings) {
            res.status(404).json({ message: "SEO settings not found" });
            return;
        }
        res.json(settings);
    })
);

// POST /seo - Create SEO settings
router.post(
    "/",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const data = insertSeoSettingsApiSchema.parse(req.body);
        const existing = await storage.getSeoSettingsBySlug(data.pageSlug);
        if (existing) {
            res.status(409).json({ message: "SEO settings for this slug already exist" });
            return;
        }
        const settings = await storage.createSeoSettings(data);
        res.status(201).json(settings);
    })
);

// PATCH /seo/:id - Update SEO settings
router.patch(
    "/:id",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "Invalid ID" });
            return;
        }
        const data = insertSeoSettingsApiSchema.partial().parse(req.body);
        const updated = await storage.updateSeoSettings(id, data);
        res.json(updated);
    })
);

// DELETE /seo/:id - Delete SEO settings
router.delete(
    "/:id",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "Invalid ID" });
            return;
        }
        await storage.deleteSeoSettings(id);
        res.status(204).send();
    })
);

export default router;
