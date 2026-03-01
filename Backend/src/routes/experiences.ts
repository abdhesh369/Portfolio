import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storage } from "../storage.js";
import { insertExperienceApiSchema } from "../../shared/schema.js";
import { api } from "../../shared/routes.js";
import { isAuthenticated, asyncHandler } from "../auth.js";

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

export function registerExperienceRoutes(app: Router) {
    // GET /experiences - Get all experiences
    app.get(
        "/experiences",
        asyncHandler(async (_req, res) => {
            const experiences = await storage.getExperiences();
            res.json(experiences);
        })
    );

    // GET /experiences/:id - Get experience by ID
    app.get(
        "/experiences/:id",
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

    // POST /experiences - Create experience
    app.post(
        "/experiences",
        isAuthenticated,
        validateBody(insertExperienceApiSchema),
        asyncHandler(async (req, res) => {
            const experience = await storage.createExperience(req.body);
            res.status(201).json(experience);
        })
    );

    // PUT /experiences/:id - Update experience
    app.put(
        "/experiences/:id",
        isAuthenticated,
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
            await storage.deleteExperience(id);
            res.status(204).send();
        })
    );
}
