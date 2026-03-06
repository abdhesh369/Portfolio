import { settingsRepository } from "../repositories/settings.repository.js";
import { redis } from "../lib/redis.js";
import { type SiteSettings, type InsertSiteSettings, siteSettingsSchema, insertSiteSettingsApiSchema } from "../../shared/schema.js";

export class SettingsService {
    private readonly CACHE_KEY = "site:settings";
    private readonly CACHE_TTL = 3600;

    async getSettings(): Promise<SiteSettings> {
        try {
            const cached = await redis?.get(this.CACHE_KEY);
            if (cached) {
                try {
                    const settings = JSON.parse(cached);
                    // Standard parsing also applies sanitization
                    return siteSettingsSchema.parse(settings);
                } catch { /* ignore corrupted JSON */ }
            }
        } catch (err) {
            // Error logged by redis internally usually
        }

        let settings = await settingsRepository.getSettings();

        if (!settings) {
            // Initialize with defaults if not exists
            // Using type assertion here because repository might have different internal requirements
            settings = await settingsRepository.updateSettings({ isOpenToWork: true } as any);
        }

        // Always sanitize via schema before returning
        const sanitized = siteSettingsSchema.parse(settings);

        try {
            if (redis) {
                await redis.setex(this.CACHE_KEY, this.CACHE_TTL, JSON.stringify(sanitized));
            }
        } catch (err) {
            // Ignore cache write error
        }
        return sanitized;
    }

    async updateSettings(data: InsertSiteSettings): Promise<SiteSettings> {
        // Data is already sanitized if it came through the API route (validateBody),
        // but we parse it again here for robustness and type safety.
        const sanitizedData = insertSiteSettingsApiSchema.parse(data);

        const settings = await settingsRepository.updateSettings(sanitizedData as any);
        try {
            if (redis) {
                await redis.del(this.CACHE_KEY);
            }
        } catch (err) {
            // Ignore cache delete error
        }
        return siteSettingsSchema.parse(settings);
    }
}

export const settingsService = new SettingsService();
