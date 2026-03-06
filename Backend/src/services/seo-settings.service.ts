import { seoSettingsRepository } from "../repositories/seo-settings.repository.js";
import type { InsertSeoSettings, SeoSettings } from "@portfolio/shared";
import { CacheService } from "../lib/cache.js";

const FEATURE = "seo";
const NAMESPACE = "settings";
const CACHE_TTL = 3600;

export class SeoSettingsService {
    /**
     * Retrieves all SEO settings, using Redis cache when available.
     * @returns Array of SEO settings objects
     */
    async getAll(): Promise<SeoSettings[]> {
        const key = CacheService.key(FEATURE, NAMESPACE);
        return CacheService.getOrSet(key, CACHE_TTL, () => seoSettingsRepository.getAll());
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
        const key = CacheService.key(FEATURE, NAMESPACE);
        await CacheService.invalidate(key);
    }
}

export const seoSettingsService = new SeoSettingsService();
