import { Router } from "express";
import { z } from "zod";
import { insertTestimonialApiSchema } from "@portfolio/shared";
import { isAuthenticated } from "../auth.js";
import { asyncHandler } from "../lib/async-handler.js";
import { parseIntParam } from "../lib/params.js";
import { cachePublic } from "../middleware/cache.js";
import { testimonialService } from "../services/testimonial.service.js";
import { recordAudit } from "../lib/audit.js";
import { emailService } from "../services/email.service.js";

export function registerTestimonialRoutes(app: Router) {
    // GET /testimonials - public list
    app.get(
        "/testimonials",
        cachePublic(300),
        asyncHandler(async (_req, res) => {
            const testimonials = await testimonialService.getAll();
            res.json(testimonials);
        })
    );

    // GET /testimonials/:id - public single
    app.get(
        "/testimonials/:id",
        cachePublic(300),
        asyncHandler(async (req, res) => {
            const id = parseIntParam(res, req.params.id, "testimonial ID");
            if (id === null) return;
            const testimonial = await testimonialService.getById(id);
            if (!testimonial) {
                res.status(404).json({ success: false, message: "Testimonial not found" });
                return;
            }
            res.json(testimonial);
        })
    );

    // POST /testimonials - admin create
    app.post(
        "/testimonials",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const data = insertTestimonialApiSchema.parse(req.body);
            const testimonial = await testimonialService.create(data);
            recordAudit("CREATE", "testimonial", testimonial.id, null, data as Record<string, unknown>);
            res.status(201).json({
                success: true,
                message: "Testimonial created successfully",
                data: testimonial
            });
        })
    );

    // PATCH /testimonials/:id - admin update
    app.patch(
        "/testimonials/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseIntParam(res, req.params.id, "testimonial ID");
            if (id === null) return;
            const data = insertTestimonialApiSchema.partial().parse(req.body);
            const testimonial = await testimonialService.update(id, data);
            recordAudit("UPDATE", "testimonial", id, null, data as Record<string, unknown>);
            res.json({
                success: true,
                message: "Testimonial updated successfully",
                data: testimonial
            });
        })
    );

    // DELETE /testimonials/:id - admin delete
    app.delete(
        "/testimonials/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseIntParam(res, req.params.id, "testimonial ID");
            if (id === null) return;
            await testimonialService.delete(id);
            recordAudit("DELETE", "testimonial", id, null, null);
            res.status(204).send();
        })
    );

    // POST /testimonials/request - admin request testimonial from client
    app.post(
        "/testimonials/request",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const schema = z.object({
                clientName: z.string(),
                clientEmail: z.string().email(),
                projectTitle: z.string()
            });
            const data = schema.parse(req.body);
            await emailService.sendTestimonialRequest(data);
            recordAudit("OTHER", "testimonial_request", undefined, null, data);
            res.json({
                success: true,
                message: "Testimonial request sent successfully"
            });
        })
    );
}
