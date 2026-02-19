import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storage } from "../storage.js";
import { insertProjectApiSchema } from "../../shared/schema.js";
import { api } from "../../shared/routes.js";
import { isAuthenticated, asyncHandler } from "../auth.js";

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

export function registerProjectRoutes(app: Router) {
  // GET /api/projects - Get all projects
  app.get(
    "/projects",
    asyncHandler(async (_req, res) => {
      const projects = await storage.getProjects();
      res.json(projects);
    })
  );

  // GET /api/projects/:id - Get project by ID
  app.get(
    "/projects/:id",
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid project ID" });
        return;
      }
      const project = await storage.getProjectById(id);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    })
  );

  // POST /api/projects - Create project
  app.post(
    "/projects",
    isAuthenticated,
    validateBody(insertProjectApiSchema),
    asyncHandler(async (req, res) => {
      const project = await storage.createProject(req.body);
      res.status(201).json(project);
    })
  );

  // PUT /projects/reorder - Reorder projects
  app.put(
    "/projects/reorder",
    isAuthenticated,
    asyncHandler(async (req, res) => {
      const schema = z.object({ orderedIds: z.array(z.number()) });
      const { orderedIds } = schema.parse(req.body);
      await storage.reorderProjects(orderedIds);
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
      await storage.bulkDeleteProjects(ids);
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
      await storage.bulkUpdateProjectStatus(ids, status);
      res.status(204).send();
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
      const project = await storage.updateProject(id, req.body);
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
      await storage.deleteProject(id);
      res.status(204).send();
    })
  );
}
