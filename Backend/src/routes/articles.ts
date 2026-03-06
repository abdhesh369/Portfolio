import { Router } from "express";
import { insertArticleApiSchema, updateArticleApiSchema, type Article } from "@portfolio/shared";
import { isAuthenticated, asyncHandler, checkAuthStatus } from "../auth.js";
import { z } from "zod";
import { cachePublic } from "../middleware/cache.js";
import { articleService } from "../services/article.service.js";
import { logger } from "../lib/logger.js";
import { recordAudit } from "../lib/audit.js";
import { redis } from "../lib/redis.js";

export const articlesRouter = Router();

// GET /articles - List all articles
articlesRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        const isAdmin = await checkAuthStatus(req);
        let status = req.query.status as Article["status"] | undefined;

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

// GET /articles/search?q=<term> - Full-text search published articles
articlesRouter.get(
    "/search",
    cachePublic(60),
    asyncHandler(async (req, res) => {
        const q = (req.query.q as string) || "";
        if (!q.trim()) {
            res.json([]);
            return;
        }
        const results = await articleService.search(q);
        res.json(results);
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
            res.status(404).json({ success: false, message: "Article not found" });
            return;
        }

        const isAdmin = await checkAuthStatus(req);
        if (article.status !== "published" && !isAdmin) {
            res.setHeader("Cache-Control", "no-store");
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }

        if (isAdmin) {
            res.setHeader("Cache-Control", "no-store");
        }

        const relatedArticles = await articleService.getRelatedArticles(article.id);
        res.json({ ...article, relatedArticles });

        if (!isAdmin) {
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            const viewKey = `article_view:${article.id}:${ip}`;

            // Fire-and-forget: don't await, don't block response
            (async () => {
                try {
                    let hasViewed = false;
                    if (redis) {
                        // Set key only if it doesn't exist, expire in 1 hour
                        const result = await redis.set(viewKey, '1', 'EX', 3600, 'NX');
                        hasViewed = result === null;
                    }
                    if (!hasViewed) {
                        await articleService.incrementViewCount(article.id);
                    }
                } catch (err) {
                    logger.error({ context: "article", id: article.id, error: err }, "Failed to increment view count");
                }
            })();
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
        recordAudit("CREATE", "article", article.id, null, data as Record<string, unknown>);
        res.status(201).json({
            success: true,
            message: "Article created successfully",
            data: article
        });
    })
);

// POST /articles/bulk-delete - Bulk delete articles
articlesRouter.post(
    "/bulk-delete",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const { ids } = z.object({ ids: z.array(z.number()) }).parse(req.body);
        await articleService.bulkDelete(ids);
        recordAudit("DELETE", "article", undefined, { ids }, null);
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
            res.status(400).json({ success: false, message: "Invalid article ID" });
            return;
        }
        const data = updateArticleApiSchema.parse(req.body);
        const article = await articleService.update(id, data);
        recordAudit("UPDATE", "article", id, null, data as Record<string, unknown>);
        res.json({
            success: true,
            message: "Article updated successfully",
            data: article
        });
    })
);

// DELETE /articles/:id - Delete article
articlesRouter.delete(
    "/:id",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid article ID" });
            return;
        }
        await articleService.delete(id);
        recordAudit("DELETE", "article", id, null, null);
        res.status(204).send();
    })
);
