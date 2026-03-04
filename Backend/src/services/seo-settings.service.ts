import { seoSettingsRepository } from "../repositories/seo-settings.repository.js";
import type { InsertSeoSettings, SeoSettings } from "../../shared/schema.js";
import { redis } from "../lib/redis.js";
import { logger } from "../lib/logger.js";

const CACHE_KEY = "seo_settings";

export class SeoSettingsService {
    /**
     * Retrieves all SEO settings, using Redis cache when available.
     * @returns Array of SEO settings objects
     */
    async getAll(): Promise<SeoSettings[]> {
        const cached = await redis?.get(CACHE_KEY);
        if (cached) return JSON.parse(cached);

        const settings = await seoSettingsRepository.getAll();
        await redis?.set(CACHE_KEY, JSON.stringify(settings), "EX", 3600); // 1 hour
        return settings;
    }

    /**
     * Retrieves SEO settings for a specific page by its slug.
     * @param slug - The page slug to look up
     * @returns The matching SEO settings or null if not found
     */
    async getBySlug(slug: string): Promise<SeoSettings | null> {
        const settings = await this.getAll();
        const setting = settings.find((s) => s.pageSlug === slug);
        if (setting) return setting;

        return seoSettingsRepository.getBySlug(slug);
    }

    /**
     * Creates a new SEO settings entry and invalidates cache.
     * @param settings - The SEO settings data to create
     * @returns The newly created SEO settings
     */
    async create(settings: InsertSeoSettings): Promise<SeoSettings> {
        const created = await seoSettingsRepository.create(settings);
        await this.invalidateCache();
        return created;
    }

    /**
     * Updates an existing SEO settings entry by ID and invalidates cache.
     * @param id - The SEO settings ID to update
     * @param settings - Partial SEO settings data to apply
     * @returns The updated SEO settings
     */
    async update(id: number, settings: Partial<InsertSeoSettings>): Promise<SeoSettings> {
        const updated = await seoSettingsRepository.update(id, settings);
        await this.invalidateCache();
        return updated;
    }

    /**
     * Deletes an SEO settings entry by ID and invalidates cache.
     * @param id - The SEO settings ID to delete
     */
    async delete(id: number): Promise<void> {
        await seoSettingsRepository.delete(id);
        await this.invalidateCache();
    }

    private async invalidateCache() {
        try {
            await redis?.del(CACHE_KEY);
        } catch (error) {
            logger.warn({ context: "cache", service: "seo-settings", error }, "Failed to invalidate SEO settings cache");
        }
    }
}

export const seoSettingsService = new SeoSettingsService();
