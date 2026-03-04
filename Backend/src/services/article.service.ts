import { articleRepository } from "../repositories/article.repository.js";
import { redis } from "../lib/redis.js";
import { CHAT_CACHE_KEY } from "../routes/chat.js";
import { logger } from "../lib/logger.js";
import type { Article, InsertArticle } from "../../shared/schema.js";

const CACHE_KEY = "articles";
const ARTICLE_CACHE_PREFIX = "article:";

export class ArticleService {
    private calculateReadTime(content: string): number {
        const wordsPerMinute = 200;
        // Strip HTML if any (though content is usually markdown or text)
        const cleanContent = content.replace(/<[^>]*>/g, '');
        const words = cleanContent.trim().split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute) || 1;
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    async getAll(status?: string): Promise<Article[]> {
        const cacheKey = status ? `${CACHE_KEY}:status:${status}` : CACHE_KEY;
        const cached = redis ? await redis.get(cacheKey) : null;

        if (cached) {
            return JSON.parse(cached);
        }


        const articles = await articleRepository.findAll(status);
        if (redis) {
            await redis.setex(cacheKey, 3600, JSON.stringify(articles)); // 1 hour cache
            await redis.sadd(`${CACHE_KEY}:tracked-keys`, cacheKey);
        }
        return articles;
    }

    async getBySlug(slug: string): Promise<Article | null> {
        const cacheKey = `${ARTICLE_CACHE_PREFIX}${slug}`;
        const cached = redis ? await redis.get(cacheKey) : null;

        if (cached) {
            return JSON.parse(cached);
        }


        const article = await articleRepository.findBySlug(slug);
        if (article && redis) {
            await redis.setex(cacheKey, 3600, JSON.stringify(article));
            await redis.sadd(`${CACHE_KEY}:tracked-keys`, cacheKey);
        }
        return article;
    }

    async findById(id: number): Promise<Article | null> {
        return articleRepository.findById(id);
    }

    async search(query: string): Promise<Article[]> {
        if (!query || query.trim().length === 0) return [];
        return articleRepository.search(query.trim(), 10);
    }

    async create(data: InsertArticle & { tags?: string[] }): Promise<Article> {
        const slug = data.slug || this.generateSlug(data.title);
        const readTimeMinutes = this.calculateReadTime(data.content);

        const article = await articleRepository.create({
            ...data,
            slug,
            readTimeMinutes,
        });

        await this.invalidateCache();
        return article;
    }

    async update(id: number, data: Partial<InsertArticle> & { tags?: string[] }, shouldClearQueryCache = true): Promise<Article> {
        const current = await articleRepository.findById(id);
        if (!current) throw new Error(`Article with id ${id} not found`);

        const updateData: Partial<InsertArticle> & { updatedAt: Date; readTimeMinutes?: number; slug?: string } = { ...data, updatedAt: new Date() };

        if (data.content) {
            updateData.readTimeMinutes = this.calculateReadTime(data.content);
        }

        if (data.title && !data.slug && current.title !== data.title && current.status !== "published") {
            updateData.slug = this.generateSlug(data.title);
        }

        const article = await articleRepository.update(id, updateData);
        if (shouldClearQueryCache) {
            await this.invalidateCache(current.slug); // Invalidate old slug
        }
        if (article.slug !== current.slug && redis) {
            await redis.del(`${ARTICLE_CACHE_PREFIX}${article.slug}`); // Ensure new slug is also clear
        }
        return article;
    }

    async delete(id: number, shouldClearQueryCache = true): Promise<void> {
        const article = await articleRepository.findById(id);
        await articleRepository.delete(id);
        if (article && shouldClearQueryCache) {
            await this.invalidateCache(article.slug);
        }
    }

    async bulkDelete(ids: number[], shouldClearQueryCache = true): Promise<void> {
        const articles = await articleRepository.findByIds(ids);
        await articleRepository.bulkDelete(ids);

        // Invalidate cache for all deleted articles
        if (shouldClearQueryCache) {
            await this.invalidateCache();
        }
        if (redis) {
            for (const article of articles) {
                if (article) {
                    await redis.del(`${ARTICLE_CACHE_PREFIX}${article.slug}`);
                }
            }
        }
    }

    async getRelatedArticles(articleId: number, limit: number = 3): Promise<Article[]> {
        return articleRepository.findRelated(articleId, limit);
    }

    async incrementViewCount(id: number): Promise<void> {
        await articleRepository.incrementViewCount(id);
        // Note: View counts are allowed to be slightly stale in cache
    }

    private async invalidateCache(slug?: string) {
        if (!redis) return;

        try {
            const keys = await redis.smembers(`${CACHE_KEY}:tracked-keys`);
            if (keys.length > 0) {
                await redis.del(...keys, `${CACHE_KEY}:tracked-keys`, CHAT_CACHE_KEY);
            } else {
                // Fallback for untracked keys or migration period
                await redis.del(CACHE_KEY, `${CACHE_KEY}:status:published`, `${CACHE_KEY}:status:draft`, CHAT_CACHE_KEY);
            }

            if (slug) {
                await redis.del(`${ARTICLE_CACHE_PREFIX}${slug}`);
            }
        } catch (error) {
            logger.error({ context: "cache", service: "article", error }, "Cache invalidation failed");
        }
    }
}

export const articleService = new ArticleService();
