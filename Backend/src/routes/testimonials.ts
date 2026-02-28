import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storage } from "../storage.js";
import { insertTestimonialApiSchema } from "../../shared/schema.js";
import { isAuthenticated, asyncHandler } from "../auth.js";

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

export function registerTestimonialRoutes(app: Router) {
    // GET /testimonials - public list
    app.get(
        "/testimonials",
        asyncHandler(async (_req, res) => {
            const testimonials = await storage.getTestimonials();
            res.json(testimonials);
        })
    );

    // GET /testimonials/:id - public single
    app.get(
        "/testimonials/:id",
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid testimonial ID" });
                return;
            }
            const testimonial = await storage.getTestimonialById(id);
            if (!testimonial) {
                res.status(404).json({ message: "Testimonial not found" });
                return;
            }
            res.json(testimonial);
        })
    );

    // POST /testimonials - admin create
    app.post(
        "/testimonials",
        isAuthenticated,
        validateBody(insertTestimonialApiSchema),
        asyncHandler(async (req, res) => {
            const testimonial = await storage.createTestimonial(req.body);
            res.status(201).json(testimonial);
        })
    );

    // PATCH /testimonials/:id - admin update
    app.patch(
        "/testimonials/:id",
        isAuthenticated,
        validateBody(insertTestimonialApiSchema.partial()),
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid testimonial ID" });
                return;
            }
            const testimonial = await storage.updateTestimonial(id, req.body);
            res.json(testimonial);
        })
    );

    // DELETE /testimonials/:id - admin delete
    app.delete(
        "/testimonials/:id",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid testimonial ID" });
                return;
            }
            await storage.deleteTestimonial(id);
            res.status(204).send();
        })
    );
}
