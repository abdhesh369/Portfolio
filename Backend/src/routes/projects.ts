import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { projectService } from "../services/project.service.js";
import { insertProjectApiSchema } from "../../shared/schema.js";
import { api } from "../../shared/routes.js";
import { isAuthenticated, asyncHandler } from "../auth.js";

const router = Router();

import { validateBody } from "../middleware/validate.js";
import { cachePublic } from "../middleware/cache.js";

export function registerProjectRoutes(app: Router) {
  // GET /api/projects - Get all projects
  app.get(
    "/projects",
    cachePublic(600), // Cache for 10 minutes
    asyncHandler(async (_req, res) => {
      const projects = await projectService.getAll();
      res.json(projects);
    })
  );

  // Static named routes BEFORE dynamic :id routes

  // PUT /projects/reorder - Reorder projects
  app.put(
    "/projects/reorder",
    isAuthenticated,
    asyncHandler(async (req, res) => {
      const schema = z.object({ orderedIds: z.array(z.number()) });
      const { orderedIds } = schema.parse(req.body);
      await projectService.updateReorder(orderedIds);
      res.status(204).send();
    })
  );

  // POST /projects/bulk-delete
  app.post(
    "/projects/bulk-delete",
    isAuthenticated,
    asyncHandler(async (req, res) => {
      const schema = z.object({ ids: z.array(z.number()) });
      const { ids } = schema.parse(req.body);
      await projectService.bulkDelete(ids);
      res.status(204).send();
    })
  );

  // POST /projects/bulk-status
  app.post(
    "/projects/bulk-status",
    isAuthenticated,
    asyncHandler(async (req, res) => {
      const schema = z.object({
        ids: z.array(z.number()),
        status: z.enum(["In Progress", "Completed", "Archived"]),
      });
      const { ids, status } = schema.parse(req.body);
      await projectService.bulkUpdateStatus(ids, status);
      res.status(204).send();
    })
  );

  // GET /api/projects/:id - Get project by ID (Moved to bottom)
  app.get(
    "/projects/:id",
    cachePublic(600),
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid project ID" });
        return;
      }
      const project = await projectService.getById(id);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    })
  );

  // PUT /projects/:id - Update project
  app.put(
    "/projects/:id",
    isAuthenticated,
    validateBody(insertProjectApiSchema.partial()),
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid project ID" });
        return;
      }
      const project = await projectService.update(id, req.body);
      res.json(project);
    })
  );

  // DELETE /projects/:id - Delete project
  app.delete(
    "/projects/:id",
    isAuthenticated,
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid project ID" });
        return;
      }
      await projectService.delete(id);
      res.status(204).send();
    })
  );
}
