import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { generateOgImageBuffer, sanitizeOgText } from "../lib/og.js";
import { projectService } from "../services/project.service.js";
import { articleService } from "../services/article.service.js";

const router = Router();

// Default OG generation via query params
router.get("/", asyncHandler(async (req, res) => {
    const title = sanitizeOgText(req.query.title as string, 80) || "Portfolio";
    const description = sanitizeOgText(req.query.description as string, 160) || "Full Stack Developer & Software Engineer";
    const type = sanitizeOgText(req.query.type as string, 40) || "portfolio";
    
    const buffer = await generateOgImageBuffer(title, description, type);
    
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(buffer);
}));

// GET /og/project/:slug
router.get("/project/:slug", asyncHandler(async (req, res) => {
    const project = await projectService.getBySlug(req.params.slug as string);
    if (!project) return res.status(404).send("Project not found");
    
    const buffer = await generateOgImageBuffer(project.title, project.summary || project.description, "Project Case Study");
    
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(buffer);
}));

// GET /og/article/:slug
router.get("/article/:slug", asyncHandler(async (req, res) => {
    const article = await articleService.getBySlug(req.params.slug as string);
    if (!article) return res.status(404).send("Article not found");
    
    const buffer = await generateOgImageBuffer(article.title, article.excerpt || "Read more on my blog", "Tech Article");
    
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(buffer);
}));

export default router;
