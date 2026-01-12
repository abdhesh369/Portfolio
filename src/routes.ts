import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { z } from "zod";
import nodemailer from "nodemailer";
import { api } from "../shared/routes.js";
import { storage } from "./storage.js";
import {
  insertProjectApiSchema,
  insertSkillApiSchema,
  insertExperienceApiSchema,
  insertMessageApiSchema,
} from "../shared/schema.js";

// Logging utility
function log(message: string, level: "info" | "error" | "warn" = "info") {
  const timestamp = new Date().toISOString();
  const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✓";
  console.log(`${prefix} [${timestamp}] [ROUTES] ${message}`);
}

// Validation middleware factory
function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        log(`Validation Error: ${JSON.stringify(err.errors)}`, "error");
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
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  log("Registering API routes...");

  // ==================== PROJECTS ====================

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
      log(`Created project: ${project.title}`);
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
      log(`Updated project: ${project.title}`);
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
      log(`Deleted project with id: ${id}`);
      res.status(204).send();
    })
  );

  // ==================== SKILLS ====================

  // GET /api/skills - List all skills
  app.get(
    api.skills.list.path,
    asyncHandler(async (_req, res) => {
      const skills = await storage.getSkills();
      res.json(skills);
    })
  );

  // GET /api/skills/:id - Get single skill
  app.get(
    "/api/skills/:id",
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid skill ID" });
        return;
      }

      const skill = await storage.getSkillById(id);

      if (!skill) {
        res.status(404).json({ message: "Skill not found" });
        return;
      }

      res.json(skill);
    })
  );

  // POST /api/skills - Create skill
  app.post(
    "/api/skills",
    validateBody(insertSkillApiSchema),
    asyncHandler(async (req, res) => {
      const skill = await storage.createSkill(req.body);
      log(`Created skill: ${skill.name}`);
      res.status(201).json(skill);
    })
  );

  // PUT /api/skills/:id - Update skill
  app.put(
    "/api/skills/:id",
    validateBody(insertSkillApiSchema.partial()),
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid skill ID" });
        return;
      }

      const skill = await storage.updateSkill(id, req.body);
      log(`Updated skill: ${skill.name}`);
      res.json(skill);
    })
  );

  // DELETE /api/skills/:id - Delete skill
  app.delete(
    "/api/skills/:id",
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid skill ID" });
        return;
      }

      await storage.deleteSkill(id);
      log(`Deleted skill with id: ${id}`);
      res.status(204).send();
    })
  );

  // ==================== EXPERIENCES ====================

  // GET /api/experiences - List all experiences
  app.get(
    api.experiences.list.path,
    asyncHandler(async (_req, res) => {
      const experiences = await storage.getExperiences();
      res.json(experiences);
    })
  );

  // GET /api/experiences/:id - Get single experience
  app.get(
    "/api/experiences/:id",
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid experience ID" });
        return;
      }

      const experience = await storage.getExperienceById(id);

      if (!experience) {
        res.status(404).json({ message: "Experience not found" });
        return;
      }

      res.json(experience);
    })
  );

  // POST /api/experiences - Create experience
  app.post(
    "/api/experiences",
    validateBody(insertExperienceApiSchema),
    asyncHandler(async (req, res) => {
      const experience = await storage.createExperience(req.body);
      log(`Created experience: ${experience.role}`);
      res.status(201).json(experience);
    })
  );

  // PUT /api/experiences/:id - Update experience
  app.put(
    "/api/experiences/:id",
    validateBody(insertExperienceApiSchema.partial()),
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid experience ID" });
        return;
      }

      const experience = await storage.updateExperience(id, req.body);
      log(`Updated experience: ${experience.role}`);
      res.json(experience);
    })
  );

  // DELETE /api/experiences/:id - Delete experience
  app.delete(
    "/api/experiences/:id",
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid experience ID" });
        return;
      }

      await storage.deleteExperience(id);
      log(`Deleted experience with id: ${id}`);
      res.status(204).send();
    })
  );

  // ==================== MESSAGES ====================

  // GET /api/messages - List all messages (admin only in production)
  app.get(
    "/api/messages",
    asyncHandler(async (_req, res) => {
      const messages = await storage.getMessages();
      res.json(messages);
    })
  );

  // GET /api/messages/:id - Get single message
  app.get(
    "/api/messages/:id",
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid message ID" });
        return;
      }

      const message = await storage.getMessageById(id);

      if (!message) {
        res.status(404).json({ message: "Message not found" });
        return;
      }

      res.json(message);
    })
  );

  // POST /api/messages - Create message (contact form)
  app.post(
    api.messages.create.path,
    validateBody(insertMessageApiSchema),
    asyncHandler(async (req, res) => {
      const message = await storage.createMessage(req.body);
      log(`New message from: ${message.name} (${message.email})`);

      // Email Notification Integration
      try {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
          log("Skipping email: GMAIL_USER or GMAIL_APP_PASSWORD not set", "warn");
        } else {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_APP_PASSWORD,
            },
          });

          const mailOptions = {
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER, // Send to self
            subject: `Portfolio Message: ${message.subject || "No Subject"}`,
            text: `
Name: ${message.name}
Email: ${message.email}
Subject: ${message.subject}

Message:
${message.message}
            `,
            html: `
<h3>New Message from Portfolio</h3>
<p><strong>Name:</strong> ${message.name}</p>
<p><strong>Email:</strong> ${message.email}</p>
<p><strong>Subject:</strong> ${message.subject}</p>
<hr/>
<p><strong>Message:</strong></p>
<p style="white-space: pre-wrap;">${message.message}</p>
            `,
          };

          await transporter.sendMail(mailOptions);
          log("Email notification sent successfully");
        }
      } catch (emailError) {
        log(`Failed to send email notification: ${emailError}`, "error");
        // We do not fail the request if email fails, as the message is saved in DB
      }

      res.status(201).json({
        success: true,
        message: "Message sent successfully! We'll get back to you soon.",
        data: message,
      });
    })
  );

  // DELETE /api/messages/:id - Delete message
  app.delete(
    "/api/messages/:id",
    asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid message ID" });
        return;
      }

      await storage.deleteMessage(id);
      log(`Deleted message with id: ${id}`);
      res.status(204).send();
    })
  );

  // ==================== HEALTH & INFO ====================

  // API info endpoint
  app.get("/api", (_req, res) => {
    res.json({
      name: "Portfolio API",
      version: "1.0.0",
      endpoints: {
        projects: "/api/projects",
        skills: "/api/skills",
        experiences: "/api/experiences",
        messages: "/api/messages",
      },
    });
  });

  // Count and log registered routes safely
  try {
    const routeCount = app._router?.stack?.filter((r: any) => r.route)?.length ?? 0;
    log(`Registered ${routeCount > 0 ? routeCount : 'multiple'} API routes`);
  } catch (error) {
    log('API routes registered successfully');
  }

  return httpServer;
}