import { Router } from "express";
import { emailTemplateService } from "../services/email-template.service.js";
import { insertEmailTemplateApiSchema } from "../../shared/schema.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { z } from "zod";
import { validateBody } from "../middleware/validate.js";
import { recordAudit } from "../lib/audit.js";

export function registerEmailTemplateRoutes(app: Router) {
    // GET /email-templates - List all templates (admin only)
    app.get(
        "/email-templates",
        isAuthenticated,
        asyncHandler(async (_req, res) => {
            const templates = await emailTemplateService.getAll();
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
            const template = await emailTemplateService.getById(id);
            if (!template) {
                res.status(404).json({
                    success: false,
                    message: "Template not found"
                });
                return;
            }
            res.json(template);
        })
    );

    // POST /email-templates - Create template
    app.post(
        "/email-templates",
        isAuthenticated,
        validateBody(insertEmailTemplateApiSchema),
        asyncHandler(async (req, res) => {
            const template = await emailTemplateService.create(req.body);

            // Audit log (A4)
            recordAudit("CREATE", "email_template", template.id, null, req.body);

            res.status(201).json({
                success: true,
                message: "Email template created successfully",
                data: template
            });
        })
    );

    // PUT /email-templates/:id - Update template
    app.put(
        "/email-templates/:id",
        isAuthenticated,
        validateBody(insertEmailTemplateApiSchema.partial()),
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid template ID" });
                return;
            }
            const template = await emailTemplateService.update(id, req.body);

            // Audit log (A4)
            recordAudit("UPDATE", "email_template", id, null, req.body);

            res.json({
                success: true,
                message: "Email template updated successfully",
                data: template
            });
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
            await emailTemplateService.delete(id);

            // Audit log (A4)
            recordAudit("DELETE", "email_template", id);

            res.status(204).send();
        })
    );
}
