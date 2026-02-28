import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storage } from "../storage.js";
import { insertServiceApiSchema } from "../../shared/schema.js";
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

export function registerServiceRoutes(app: Router) {
  // GET /services - public list
  app.get(
    "/services",
    asyncHandler(async (_req, res) => {
      const services = await storage.getServices();
      res.json(services);
    })
  );

  // GET /services/:id - public single
  app.get(
    "/services/:id",
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid service ID" });
        return;
      }
      const service = await storage.getServiceById(id);
      if (!service) {
        res.status(404).json({ message: "Service not found" });
        return;
      }
      res.json(service);
    })
  );

  // POST /services - admin create
  app.post(
    "/services",
    isAuthenticated,
    validateBody(insertServiceApiSchema),
    asyncHandler(async (req, res) => {
      const service = await storage.createService(req.body);
      res.status(201).json(service);
    })
  );

  // PATCH /services/:id - admin update
  app.patch(
    "/services/:id",
    isAuthenticated,
    validateBody(insertServiceApiSchema.partial()),
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid service ID" });
        return;
      }
      const service = await storage.updateService(id, req.body);
      res.json(service);
    })
  );

  // DELETE /services/:id - admin delete
  app.delete(
    "/services/:id",
    isAuthenticated,
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid service ID" });
        return;
      }
      await storage.deleteService(id);
      res.status(204).send();
    })
  );
}

