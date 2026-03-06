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
import { registerServiceRoutes } from "./routes/services.js";
import seoRoutes from "./routes/seo.js";
import sitemapRoutes from "./routes/sitemap.js";
import { articlesRouter } from "./routes/articles.js";
import { registerTestimonialRoutes } from "./routes/testimonials.js";
import { registerChatRoutes } from "./routes/chat.js";
import { registerSettingsRoutes } from "./routes/settings.js";
import feedRoutes from "./routes/feed.js";
import githubRoutes from "./routes/github.js";
import guestbookRoutes from "./routes/guestbook.js";
import auditLogRoutes from "./routes/audit-log.js";
import express from "express";
import { csrfProtection } from "./middleware/csrf.js";
import { logger } from "./lib/logger.js";

export function registerRoutes(app: Express) {
  const v1Router = Router();

  // CSRF protection for all state-changing admin requests
  // (skips GET/HEAD/OPTIONS and unauthenticated requests automatically)
  v1Router.use(csrfProtection);

  // Register all routes on the v1 router
  v1Router.use("/auth", authRoutes);
  v1Router.use("/seo", seoRoutes);
  v1Router.use("/sitemap", sitemapRoutes);
  v1Router.use("/articles", articlesRouter);
  v1Router.use("/feed", feedRoutes);
  v1Router.use("/github", githubRoutes);
  v1Router.use("/guestbook", guestbookRoutes);

  // CSP violation reporting route
  v1Router.post(
    "/csp-report",
    express.json({ type: "application/csp-report" }),
    (req: express.Request, res: express.Response) => {
      logger.warn({ report: req.body }, "CSP Violation");
      res.status(204).end();
    }
  );

  // Register routes that use the functional registration pattern
  registerProjectRoutes(v1Router);
  registerSkillRoutes(v1Router);
  registerExperienceRoutes(v1Router);
  registerMessageRoutes(v1Router);
  registerMindsetRoutes(v1Router);
  registerServiceRoutes(v1Router);
  registerUploadRoutes(v1Router);
  registerAnalyticsRoutes(v1Router);
  registerEmailTemplateRoutes(v1Router);
  registerTestimonialRoutes(v1Router);
  registerChatRoutes(v1Router);
  registerSettingsRoutes(v1Router);

  // Admin audit log (TICKET-032)
  v1Router.use("/admin", auditLogRoutes);

  // Main API versioning
  app.use("/api/v1", v1Router);
}
