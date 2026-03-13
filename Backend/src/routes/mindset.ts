import { Router } from "express";
import { mindsetService } from "../services/mindset.service.js";
import { insertMindsetApiSchema } from "@portfolio/shared";
import { isAuthenticated } from "../auth.js";
import { asyncHandler } from "../lib/async-handler.js";
import { cachePublic } from "../middleware/cache.js";
import { validateBody } from "../middleware/validate.js";
import { recordAudit } from "../lib/audit.js";

export function registerMindsetRoutes(app: Router) {
    // GET /api/mindset - Get mindset data
    app.get(
        "/mindset",
        cachePublic(3600),
        asyncHandler(async (req, res) => {
            const mindset = await mindsetService.getAll();
            res.json(mindset);
        })
    );

    // POST /api/mindset - Create mindset entry
    app.post(
        "/mindset",
        isAuthenticated,
        validateBody(insertMindsetApiSchema),
        asyncHandler(async (req, res) => {
            const mindset = await mindsetService.create(req.body);
            recordAudit("CREATE", "mindset", mindset.id, null, req.body as Record<string, unknown>);
            res.status(201).json({
                success: true,
                message: "Mindset principle created successfully",
                data: mindset
            });
        })
    );

    // GET /api/mindset/:id - Get single mindset principle
    app.get(
        "/mindset/:id",
        cachePublic(3600),
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid mindset ID" });
                return;
            }
            const mindset = await mindsetService.getById(id);
            if (!mindset) {
                res.status(404).json({
                    success: false,
                    message: "Mindset principle not found"
                });
                return;
            }
            res.json(mindset);
        })
    );

    // PATCH /api/mindset/:id - Update mindset entry
    app.patch(
        "/mindset/:id",
        isAuthenticated,
        validateBody(insertMindsetApiSchema.partial()),
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid mindset ID" });
                return;
            }
            const mindset = await mindsetService.update(id, req.body);
            recordAudit("UPDATE", "mindset", id, null, req.body as Record<string, unknown>);
            res.json({
                success: true,
                message: "Mindset principle updated successfully",
                data: mindset
            });
        })
    );

    // DELETE /api/mindset/:id - Delete mindset entry
    app.delete(
        "/mindset/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid mindset ID" });
                return;
            }
            await mindsetService.delete(id);
            recordAudit("DELETE", "mindset", id, null, null);
            res.status(204).send();
        })
    );
}

