import { Router } from "express";
import { storage } from "../storage.js";
import { insertArticleApiSchema, updateArticleApiSchema } from "../../shared/schema.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { z } from "zod";

export const articlesRouter = Router();

// GET /articles - List all articles
articlesRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        const status = req.query.status as string | undefined;
        const articles = await storage.getArticles(status);
        res.json(articles);
    })
);

// GET /articles/:slug - Get article by slug
articlesRouter.get(
    "/:slug",
    asyncHandler(async (req, res) => {
        const slug = req.params.slug;
        const article = await storage.getArticleBySlug(slug);
        if (!article) {
            res.status(404).json({ error: "Article not found" });
            return;
        }
        res.json(article);
    })
);

// POST /articles - Create article
articlesRouter.post(
    "/",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const data = insertArticleApiSchema.parse(req.body);
        const article = await storage.createArticle(data);
        res.status(201).json(article);
    })
);

// POST /articles/bulk-delete - Bulk delete articles
articlesRouter.post(
    "/bulk-delete",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const { ids } = z.object({ ids: z.array(z.number()) }).parse(req.body);
        await storage.bulkDeleteArticles(ids);
        res.status(204).send();
    })
);

// PATCH /articles/:id - Update article
articlesRouter.patch(
    "/:id",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid article ID" });
            return;
        }
        const data = updateArticleApiSchema.parse(req.body);
        const article = await storage.updateArticle(id, data);
        res.json(article);
    })
);

// DELETE /articles/:id - Delete article
articlesRouter.delete(
    "/:id",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid article ID" });
            return;
        }
        await storage.deleteArticle(id);
        res.status(204).send();
    })
);
