import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage.js";
import { insertMindsetApiSchema } from "../../shared/schema.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { z } from "zod";

const router = Router();

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

export function registerMindsetRoutes(app: Router) {
    // GET /api/mindset - Get mindset data
    app.get(
        "/mindset",
        asyncHandler(async (req, res) => {
            const mindset = await storage.getMindset();
            res.json(mindset);
        })
    );

    // POST /api/mindset - Create mindset entry
    app.post(
        "/mindset",
        isAuthenticated,
        validateBody(insertMindsetApiSchema),
        asyncHandler(async (req, res) => {
            const mindset = await storage.createMindset(req.body);
            res.status(201).json(mindset);
        })
    );

    // GET /api/mindset/:id - Get single mindset principle
    app.get(
        "/mindset/:id",
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid mindset ID" });
                return;
            }
            const mindset = await storage.getMindsetById(id);
            if (!mindset) {
                res.status(404).json({ message: "Mindset principle not found" });
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
            const mindset = await storage.updateMindset(id, req.body);
            res.json(mindset);
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
            await storage.deleteMindset(id);
            res.status(204).send();
        })
    );
}
