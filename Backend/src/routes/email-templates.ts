import { Router } from "express";
import { storage } from "../storage.js";
import { insertEmailTemplateApiSchema } from "../../shared/schema.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { z } from "zod";

export function registerEmailTemplateRoutes(app: Router) {
    // GET /email-templates - List all templates (admin only)
    app.get(
        "/email-templates",
        isAuthenticated,
        asyncHandler(async (_req, res) => {
            const templates = await storage.getEmailTemplates();
            res.json(templates);
        })
    );

    // GET /email-templates/:id - Get single template
    app.get(
        "/email-templates/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid template ID" });
                return;
            }
            const template = await storage.getEmailTemplateById(id);
            if (!template) {
                res.status(404).json({ message: "Template not found" });
                return;
            }
            res.json(template);
        })
    );

    // POST /email-templates - Create template
    app.post(
        "/email-templates",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const parsed = insertEmailTemplateApiSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ message: "Invalid template data", errors: parsed.error.errors });
                return;
            }
            const template = await storage.createEmailTemplate(parsed.data);
            res.status(201).json(template);
        })
    );

    // PUT /email-templates/:id - Update template
    app.put(
        "/email-templates/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid template ID" });
                return;
            }
            const parsed = insertEmailTemplateApiSchema.partial().safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ message: "Invalid template data", errors: parsed.error.errors });
                return;
            }
            const template = await storage.updateEmailTemplate(id, parsed.data);
            res.json(template);
        })
    );

    // DELETE /email-templates/:id - Delete template
    app.delete(
        "/email-templates/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid template ID" });
                return;
            }
            await storage.deleteEmailTemplate(id);
            res.status(204).send();
        })
    );
}
