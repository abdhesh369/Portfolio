import { Router } from "express";
import { insertTestimonialApiSchema } from "@portfolio/shared";
import { isAuthenticated } from "../auth.js";
import { asyncHandler } from "../lib/async-handler.js";
import { cachePublic } from "../middleware/cache.js";
import { testimonialService } from "../services/testimonial.service.js";
import { recordAudit } from "../lib/audit.js";

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
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid testimonial ID" });
                return;
            }
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
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid testimonial ID" });
                return;
            }
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
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid testimonial ID" });
                return;
            }
            await testimonialService.delete(id);
            recordAudit("DELETE", "testimonial", id, null, null);
            res.status(204).send();
        })
    );
}
