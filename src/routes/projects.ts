import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage.js";
import { insertProjectApiSchema } from "../../shared/schema.js";
import { api } from "../../shared/routes.js";

const router = Router();

// Validation middleware factory
function validateBody<T extends z.ZodType>(schema: T) {
  return (req: any, res: any, next: any): void => {
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

// Error handler wrapper
function asyncHandler(fn: (req: any, res: any, next: any) => Promise<any>) {
  return (req: any, res: any, next: any): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function registerProjectRoutes(app: Router) {
  // GET /api/projects - List all projects
  app.get(
    api.projects.list.path,
    asyncHandler(async (_req, res) => {
      const projects = await storage.getProjects();
      res.json(projects);
    })
  );

  // GET /api/projects/:id - Get single project
  app.get(
    "/api/projects/:id",
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
    "/api/projects",
    validateBody(insertProjectApiSchema),
    asyncHandler(async (req, res) => {
      const project = await storage.createProject(req.body);
      res.status(201).json(project);
    })
  );

  // PUT /api/projects/:id - Update project
  app.put(
    "/api/projects/:id",
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

  // DELETE /api/projects/:id - Delete project
  app.delete(
    "/api/projects/:id",
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
