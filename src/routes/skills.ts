import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage.js";
import { insertSkillApiSchema } from "../../shared/schema.js";
import { api } from "../../shared/routes.js";

// Validation middleware factory
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

// Error handler wrapper
function asyncHandler(fn: (req: any, res: any, next: any) => Promise<any>) {
    return (req: any, res: any, next: any): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export function registerSkillRoutes(app: Router) {
    // GET /api/skills/connections - List all skill connections
    // (Defined BEFORE :id to avoid conflict)
    app.get(
        api.skills.connections.path,
        asyncHandler(async (_req, res) => {
            const connections = await storage.getSkillConnections();
            res.json(connections);
        })
    );

    // GET /api/skills - List all skills
    app.get(
        api.skills.list.path,
        asyncHandler(async (_req, res) => {
            const skills = await storage.getSkills();
            res.json(skills);
        })
    );

    // GET /api/skills/:id - Get single skill
    app.get(
        "/api/skills/:id",
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid skill ID" });
                return;
            }
            const skill = await storage.getSkillById(id);
            if (!skill) {
                res.status(404).json({ message: "Skill not found" });
                return;
            }
            res.json(skill);
        })
    );

    // POST /api/skills - Create skill
    app.post(
        "/api/skills",
        validateBody(insertSkillApiSchema),
        asyncHandler(async (req, res) => {
            const skill = await storage.createSkill(req.body);
            res.status(201).json(skill);
        })
    );

    // PUT /api/skills/:id - Update skill
    app.put(
        "/api/skills/:id",
        validateBody(insertSkillApiSchema.partial()),
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid skill ID" });
                return;
            }
            const skill = await storage.updateSkill(id, req.body);
            res.json(skill);
        })
    );

    // DELETE /api/skills/:id - Delete skill
    app.delete(
        "/api/skills/:id",
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid skill ID" });
                return;
            }
            await storage.deleteSkill(id);
            res.status(204).send();
        })
    );
}
