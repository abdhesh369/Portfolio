import type { Express } from "express";
import { Router } from "express";
import { registerProjectRoutes } from "./routes/projects.js";
import { registerSkillRoutes } from "./routes/skills.js";
import { registerExperienceRoutes } from "./routes/experiences.js";
import { registerMessageRoutes } from "./routes/messages.js";
import { registerMindsetRoutes } from "./routes/mindset.js";
import { authRoutes } from "./routes/auth.js";
import { registerUploadRoutes } from "./routes/upload.js";
import { registerAnalyticsRoutes } from "./routes/analytics.js";
import { registerEmailTemplateRoutes } from "./routes/email-templates.js";
import seoRoutes from "./routes/seo.js";
import sitemapRoutes from "./routes/sitemap.js";
import { articlesRouter } from "./routes/articles.js";

export function registerRoutes(app: Express) {
  const v1Router = Router();

  // Register all routes on the v1 router
  v1Router.use("/auth", authRoutes);
  v1Router.use("/seo", seoRoutes);
  v1Router.use("/sitemap", sitemapRoutes);
  v1Router.use("/articles", articlesRouter);

  // Register routes that use the functional registration pattern
  registerProjectRoutes(v1Router);
  registerSkillRoutes(v1Router);
  registerExperienceRoutes(v1Router);
  registerMessageRoutes(v1Router);
  registerMindsetRoutes(v1Router);
  registerUploadRoutes(v1Router);
  registerAnalyticsRoutes(v1Router);
  registerEmailTemplateRoutes(v1Router);

  // Main API versioning
  app.use("/api/v1", v1Router);

  // Compatibility shim: Forward /api/* to /api/v1/* if not explicitly v1
  app.use("/api", (req, res, next) => {
    if (req.path.startsWith("/v1")) {
      return next();
    }
    // Remove /api from originalUrl and prepend /api/v1
    const targetPath = req.url.startsWith('/') ? req.url : `/${req.url}`;
    res.redirect(307, `/api/v1${targetPath}`);
  });
}
