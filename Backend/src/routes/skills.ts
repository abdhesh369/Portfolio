import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { skillService } from "../services/skill.service.js";
import { skillConnectionService } from "../services/skill-connection.service.js";
import { insertSkillApiSchema } from "../../shared/schema.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { cachePublic } from "../middleware/cache.js";
import { recordAudit } from "../lib/audit.js";

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

export function registerSkillRoutes(app: Router) {
    // GET /api/skills/connections - List all skill connections
    app.get(
        "/skills/connections",
        cachePublic(3600), // Cache connections for 1 hour
        asyncHandler(async (_req, res) => {
            const connections = await skillConnectionService.getAll();
            res.json(connections);
        })
    );

    // GET /skills - Get all skills
    app.get(
        "/skills",
        cachePublic(600),
        asyncHandler(async (_req, res) => {
            const skills = await skillService.getAll();
            res.json(skills);
        })
    );

    // GET /skills/:id - Get skill by ID
    app.get(
        "/skills/:id",
        cachePublic(600),
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid skill ID" });
                return;
            }
            const skill = await skillService.getById(id);
            if (!skill) {
                res.status(404).json({ message: "Skill not found" });
                return;
            }
            res.json(skill);
        })
    );

    // POST /skills - Create skill
    app.post(
        "/skills",
        isAuthenticated,
        validateBody(insertSkillApiSchema),
        asyncHandler(async (req, res) => {
            const skill = await skillService.create(req.body);
            recordAudit("CREATE", "skill", skill.id, null, req.body);
            res.status(201).json(skill);
        })
    );

    // PUT /skills/:id - Update skill
    app.put(
        "/skills/:id",
        isAuthenticated,
        validateBody(insertSkillApiSchema.partial()),
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid skill ID" });
                return;
            }
            const skill = await skillService.update(id, req.body);
            recordAudit("UPDATE", "skill", id, null, req.body);
            res.json(skill);
        })
    );

    // DELETE /skills/:id - Delete skill
    app.delete(
        "/skills/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid skill ID" });
                return;
            }
            await skillService.delete(id);
            recordAudit("DELETE", "skill", id, null, null);
            res.status(204).send();
        })
    );

    // POST /skills/bulk-delete - Bulk delete skills
    app.post(
        "/skills/bulk-delete",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const schema = z.object({ ids: z.array(z.number()) });
            const { ids } = schema.parse(req.body);
            await skillService.bulkDelete(ids);
            recordAudit("DELETE", "skill", undefined, { ids }, null);
            res.status(204).send();
        })
    );
}
