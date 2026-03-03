import { articleRepository } from "../repositories/article.repository.js";
import { redis } from "../lib/redis.js";
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
        const cached = await redis.get(cacheKey);

        if (cached) {
            console.log(`Cache Hit: ${cacheKey}`);
            return JSON.parse(cached);
        }

        console.log(`Cache Miss: ${cacheKey}`);
        const articles = await articleRepository.findAll(status);
        await redis.setex(cacheKey, 3600, JSON.stringify(articles)); // 1 hour cache
        return articles;
    }

    async getBySlug(slug: string): Promise<Article | null> {
        const cacheKey = `${ARTICLE_CACHE_PREFIX}${slug}`;
        const cached = await redis.get(cacheKey);

        if (cached) {
            console.log(`Cache Hit: ${cacheKey}`);
            return JSON.parse(cached);
        }

        console.log(`Cache Miss: ${cacheKey}`);
        const article = await articleRepository.findBySlug(slug);
        if (article) {
            await redis.setex(cacheKey, 3600, JSON.stringify(article));
        }
        return article;
    }

    async findById(id: number): Promise<Article | null> {
        return articleRepository.findById(id);
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

    async update(id: number, data: Partial<InsertArticle> & { tags?: string[] }): Promise<Article> {
        const current = await articleRepository.findById(id);
        if (!current) throw new Error(`Article with id ${id} not found`);

        const updateData: any = { ...data };

        if (data.content) {
            updateData.readTimeMinutes = this.calculateReadTime(data.content);
        }

        if (data.title && !data.slug && current.title !== data.title) {
            updateData.slug = this.generateSlug(data.title);
        }

        const article = await articleRepository.update(id, updateData);
        await this.invalidateCache(current.slug); // Invalidate old slug
        if (article.slug !== current.slug) {
            await redis.del(`${ARTICLE_CACHE_PREFIX}${article.slug}`); // Ensure new slug is also clear
        }
        return article;
    }

    async delete(id: number): Promise<void> {
        const article = await articleRepository.findById(id);
        await articleRepository.delete(id);
        if (article) {
            await this.invalidateCache(article.slug);
        }
    }

    async bulkDelete(ids: number[]): Promise<void> {
        const articles = await Promise.all(ids.map(id => articleRepository.findById(id)));
        await articleRepository.bulkDelete(ids);

        // Invalidate cache for all deleted articles
        await this.invalidateCache();
        for (const article of articles) {
            if (article) {
                await redis?.del(`${ARTICLE_CACHE_PREFIX}${article.slug}`);
            }
        }
    }

    async incrementViewCount(id: number): Promise<void> {
        await articleRepository.incrementViewCount(id);
        // Note: View counts are allowed to be slightly stale in cache
    }

    private async invalidateCache(slug?: string) {
        if (!redis) return;

        try {
            const keys = await redis.keys(`${CACHE_KEY}*`);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
            if (slug) {
                await redis.del(`${ARTICLE_CACHE_PREFIX}${slug}`);
            }
        } catch (error) {
            console.error(`[REDIS] Invalidation failed: ${error}`);
        }
    }
}

export const articleService = new ArticleService();
