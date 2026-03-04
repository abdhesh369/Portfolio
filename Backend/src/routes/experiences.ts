import { Router } from "express";
import { insertExperienceApiSchema } from "../../shared/schema.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { cachePublic } from "../middleware/cache.js";
import { experienceService } from "../services/experience.service.js";
import { recordAudit } from "../lib/audit.js";

export function registerExperienceRoutes(app: Router) {
    // GET /experiences - Get all experiences
    app.get(
        "/experiences",
        cachePublic(600),
        asyncHandler(async (_req, res) => {
            const experiences = await experienceService.getAll();
            res.json(experiences);
        })
    );

    // GET /experiences/:id - Get experience by ID
    app.get(
        "/experiences/:id",
        cachePublic(600),
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid experience ID" });
                return;
            }
            const experience = await experienceService.getById(id);
            if (!experience) {
                res.status(404).json({ message: "Experience not found" });
                return;
            }
            res.json(experience);
        })
    );

    // POST /experiences - Create experience
    app.post(
        "/experiences",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const data = insertExperienceApiSchema.parse(req.body);
            const experience = await experienceService.create(data);
            recordAudit("CREATE", "experience", experience.id, null, data as Record<string, unknown>);
            res.status(201).json(experience);
        })
    );

    // PUT /experiences/:id - Update experience
    app.put(
        "/experiences/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid experience ID" });
                return;
            }
            const data = insertExperienceApiSchema.partial().parse(req.body);
            const experience = await experienceService.update(id, data);
            recordAudit("UPDATE", "experience", id, null, data as Record<string, unknown>);
            res.json(experience);
        })
    );

    // DELETE /experiences/:id - Delete experience
    app.delete(
        "/experiences/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid experience ID" });
                return;
            }
            await experienceService.delete(id);
            recordAudit("DELETE", "experience", id, null, null);
            res.status(204).send();
        })
    );
}
