import type { Express } from "express";
import { registerProjectRoutes } from "./routes/projects.js";
import { registerSkillRoutes } from "./routes/skills.js";
import { registerExperienceRoutes } from "./routes/experiences.js";
import { registerMessageRoutes } from "./routes/messages.js";
import { registerMindsetRoutes } from "./routes/mindset.js";
import { authRoutes } from "./routes/auth.js";
import { registerUploadRoutes } from "./routes/upload.js";
import { registerAnalyticsRoutes } from "./routes/analytics.js";
import { registerEmailTemplateRoutes } from "./routes/email-templates.js";

export function registerRoutes(app: Express) {
  const router = app; // Express app can be used as a router

  router.use("/api", authRoutes);
  registerProjectRoutes(router);
  registerSkillRoutes(router);
  registerExperienceRoutes(router);
  registerMessageRoutes(router);
  registerMindsetRoutes(router);
  registerUploadRoutes(router);
  registerAnalyticsRoutes(router);
  registerEmailTemplateRoutes(router);
}
