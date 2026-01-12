import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage.js";
import { insertExperienceApiSchema } from "../../shared/schema.js";
import { api } from "../../shared/routes.js";

function validateBody<T extends z.ZodType>(schema: T) {
    return (req: any, res: any, next: any): void => {
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

function asyncHandler(fn: (req: any, res: any, next: any) => Promise<any>) {
    return (req: any, res: any, next: any): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export function registerExperienceRoutes(app: Router) {
    // GET /api/experiences - List all experiences
    app.get(
        api.experiences.list.path,
        asyncHandler(async (_req, res) => {
            const experiences = await storage.getExperiences();
            res.json(experiences);
        })
    );

    // GET /api/experiences/:id - Get single experience
    app.get(
        "/api/experiences/:id",
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid experience ID" });
                return;
            }
            const experience = await storage.getExperienceById(id);
            if (!experience) {
                res.status(404).json({ message: "Experience not found" });
                return;
            }
            res.json(experience);
        })
    );

    // POST /api/experiences - Create experience
    app.post(
        "/api/experiences",
        validateBody(insertExperienceApiSchema),
        asyncHandler(async (req, res) => {
            const experience = await storage.createExperience(req.body);
            res.status(201).json(experience);
        })
    );

    // PUT /api/experiences/:id - Update experience
    app.put(
        "/api/experiences/:id",
        validateBody(insertExperienceApiSchema.partial()),
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid experience ID" });
                return;
            }
            const experience = await storage.updateExperience(id, req.body);
            res.json(experience);
        })
    );

    // DELETE /api/experiences/:id - Delete experience
    app.delete(
        "/api/experiences/:id",
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid experience ID" });
                return;
            }
            await storage.deleteExperience(id);
            res.status(204).send();
        })
    );
}
