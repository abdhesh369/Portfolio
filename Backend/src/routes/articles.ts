import { Router } from "express";
import { insertArticleApiSchema, updateArticleApiSchema } from "../../shared/schema.js";
import { isAuthenticated, asyncHandler, checkAuthStatus } from "../auth.js";
import { z } from "zod";
import { cachePublic } from "../middleware/cache.js";
import { articleService } from "../services/article.service.js";
import { logger } from "../lib/logger.js";

export const articlesRouter = Router();

// GET /articles - List all articles
articlesRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        const isAdmin = await checkAuthStatus(req);
        let status = req.query.status as string | undefined;

        if (!isAdmin) {
            status = "published";
            // Only cache public (non-admin) responses
            res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
        } else {
            // Never cache admin responses containing drafts
            res.setHeader("Cache-Control", "no-store");
        }

        const articles = await articleService.getAll(status);
        res.json(articles);
    })
);

// GET /articles/related/:slug - Get related articles based on overlapping tags
articlesRouter.get(
    "/related/:slug",
    cachePublic(300),
    asyncHandler(async (req, res) => {
        const slug = req.params.slug;
        const article = await articleService.getBySlug(slug);
        if (!article) {
            res.status(404).json({ error: "Article not found" });
            return;
        }

        const related = await articleService.getRelatedArticles(article.id);
        res.json(related);
    })
);

// GET /articles/:slug - Get article by slug
articlesRouter.get(
    "/:slug",
    cachePublic(300),
    asyncHandler(async (req, res) => {
        const slug = req.params.slug;
        const article = await articleService.getBySlug(slug);

        if (!article) {
            res.status(404).json({ error: "Article not found" });
            return;
        }

        const isAdmin = await checkAuthStatus(req);
        if (article.status !== "published" && !isAdmin) {
            res.setHeader("Cache-Control", "no-store"); // BUG-07
            res.status(403).json({ error: "Access denied" });
            return;
        }

        if (isAdmin) {
            res.setHeader("Cache-Control", "no-store");
        }

        const relatedArticles = await articleService.getRelatedArticles(article.id);
        res.json({ ...article, relatedArticles });

        if (!isAdmin) {
            // Fire-and-forget: don't await, don't block response
            articleService.incrementViewCount(article.id).catch((err) => {
                logger.error({ context: "article", id: article.id, error: err }, "Failed to increment view count");
            });
        }
    })
);

// POST /articles - Create article
articlesRouter.post(
    "/",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const data = insertArticleApiSchema.parse(req.body);
        const article = await articleService.create(data);
        res.status(201).json(article);
    })
);

// POST /articles/bulk-delete - Bulk delete articles
articlesRouter.post(
    "/bulk-delete",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const { ids } = z.object({ ids: z.array(z.number()) }).parse(req.body);
        await articleService.bulkDelete(ids);
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
        const article = await articleService.update(id, data);
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
        await articleService.delete(id);
        res.status(204).send();
    })
);
