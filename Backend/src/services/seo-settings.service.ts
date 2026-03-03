import { seoSettingsRepository } from "../repositories/seo-settings.repository.js";
import type { InsertSeoSettings, SeoSettings } from "../../shared/schema.js";
import { redis } from "../lib/redis.js";

const CACHE_KEY = "seo_settings";

export class SeoSettingsService {
    async getAll(): Promise<SeoSettings[]> {
        const cached = await redis?.get(CACHE_KEY);
        if (cached) return JSON.parse(cached);

        const settings = await seoSettingsRepository.getAll();
        await redis?.set(CACHE_KEY, JSON.stringify(settings), "EX", 3600); // 1 hour
        return settings;
    }

    async getBySlug(slug: string): Promise<SeoSettings | null> {
        const settings = await this.getAll();
        const setting = settings.find((s) => s.pageSlug === slug);
        if (setting) return setting;

        return seoSettingsRepository.getBySlug(slug);
    }

    async create(settings: InsertSeoSettings): Promise<SeoSettings> {
        const created = await seoSettingsRepository.create(settings);
        await this.invalidateCache();
        return created;
    }

    async update(id: number, settings: Partial<InsertSeoSettings>): Promise<SeoSettings> {
        const updated = await seoSettingsRepository.update(id, settings);
        await this.invalidateCache();
        return updated;
    }

    async delete(id: number): Promise<void> {
        await seoSettingsRepository.delete(id);
        await this.invalidateCache();
    }

    private async invalidateCache() {
        try {
            await redis?.del(CACHE_KEY);
        } catch (error) {
            console.warn("Failed to invalidate SEO settings cache:", error);
        }
    }
}

export const seoSettingsService = new SeoSettingsService();
