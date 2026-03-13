import { Router } from "express";
import { portfolioServiceService } from "../services/portfolio-service.service.js";
import { insertServiceApiSchema } from "@portfolio/shared";
import { isAuthenticated } from "../auth.js";
import { asyncHandler } from "../lib/async-handler.js";
import { cachePublic } from "../middleware/cache.js";
import { recordAudit } from "../lib/audit.js";
import { validateBody } from "../middleware/validate.js";

export function registerServiceRoutes(app: Router) {
  // GET /services - public list
  app.get(
    "/services",
    cachePublic(3600),
    asyncHandler(async (_req, res) => {
      const services = await portfolioServiceService.getAll();
      res.json(services);
    })
  );

  // GET /services/:id - public single
  app.get(
    "/services/:id",
    cachePublic(3600),
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "Invalid service ID" });
        return;
      }
      const service = await portfolioServiceService.getById(id);
      if (!service) {
        res.status(404).json({ success: false, message: "Service not found" });
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
      const service = await portfolioServiceService.create(req.body);
      recordAudit("CREATE", "service", service.id, null, req.body);
      res.status(201).json({
        success: true,
        message: "Service created successfully",
        data: service
      });
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
        res.status(400).json({ success: false, message: "Invalid service ID" });
        return;
      }
      const service = await portfolioServiceService.update(id, req.body);
      recordAudit("UPDATE", "service", id, null, req.body);
      res.json({
        success: true,
        message: "Service updated successfully",
        data: service
      });
    })
  );

  // DELETE /services/:id - admin delete
  app.delete(
    "/services/:id",
    isAuthenticated,
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "Invalid service ID" });
        return;
      }
      await portfolioServiceService.delete(id);
      recordAudit("DELETE", "service", id, null, null);
      res.status(204).send();
    })
  );
}


