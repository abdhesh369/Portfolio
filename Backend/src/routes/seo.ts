import { Router } from "express";
import { seoSettingsService } from "../services/seo-settings.service.js";
import { insertSeoSettingsApiSchema } from "@portfolio/shared";
import { isAuthenticated } from "../auth.js";
import { parseIntParam } from "../lib/params.js";
import { asyncHandler } from "../lib/async-handler.js";
import { z } from "zod";
import { cachePublic } from "../middleware/cache.js";
import { recordAudit } from "../lib/audit.js";

const router = Router();

// GET /seo - List all SEO settings
router.get(
    "/",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const settings = await seoSettingsService.getAll();
        res.json(settings);
    })
);

// GET /seo/:slug - Get SEO settings by slug
router.get(
    "/:slug",
    cachePublic(3600),
    asyncHandler(async (req, res) => {
        const slug = req.params.slug;
        const settings = await seoSettingsService.getBySlug(slug);
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
        const existing = await seoSettingsService.getBySlug(data.pageSlug);
        if (existing) {
            res.status(409).json({ message: "SEO settings for this slug already exist" });
            return;
        }
        const settings = await seoSettingsService.create(data);

        // Audit log (A3)
        recordAudit("CREATE", "seo", settings.id, null, data);

        res.status(201).json({
            success: true,
            message: "SEO settings created successfully",
            data: settings
        });
    })
);

// PATCH /seo/:id - Update SEO settings
router.patch(
    "/:id",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const id = parseIntParam(res, req.params.id, "Invalid ID");
            if (id === null) return;
        const data = insertSeoSettingsApiSchema.partial().parse(req.body);
        const updated = await seoSettingsService.update(id, data);

        // Audit log (A3)
        recordAudit("UPDATE", "seo", id, null, data);

        res.json({
            success: true,
            message: "SEO settings updated successfully",
            data: updated
        });
    })
);

// DELETE /seo/:id - Delete SEO settings
router.delete(
    "/:id",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const id = parseIntParam(res, req.params.id, "Invalid ID");
            if (id === null) return;
        await seoSettingsService.delete(id);

        // Audit log (A3)
        recordAudit("DELETE", "seo", id);

        res.status(204).send();
    })
);

export default router;
