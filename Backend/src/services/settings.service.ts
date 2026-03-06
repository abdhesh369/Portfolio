import { settingsRepository } from "../repositories/settings.repository.js";
import { redis } from "../lib/redis.js";
import { type SiteSettings, type InsertSiteSettings, siteSettingsSchema, insertSiteSettingsApiSchema } from "../../shared/schema.js";
import { logger } from "../lib/logger.js";

export class SettingsService {
    private readonly CACHE_KEY = "site:settings";
    private readonly CACHE_TTL = 3600;

    private safeParseSettings(raw: unknown): SiteSettings {
        const result = siteSettingsSchema.safeParse(raw);
        if (result.success) {
            return result.data;
        }
        // Log validation errors but don't crash — return the raw data cast so
        // the API still responds. This handles legacy DB values that pre-date
        // a stricter schema without taking down the whole service.
        logger.warn({ issues: result.error.issues }, "siteSettingsSchema validation issues — returning raw data");
        return raw as SiteSettings;
    }

    async getSettings(): Promise<SiteSettings> {
        try {
            const cached = await redis?.get(this.CACHE_KEY);
            if (cached) {
                try {
                    const settings = JSON.parse(cached);
                    return this.safeParseSettings(settings);
                } catch { /* ignore corrupted JSON */ }
            }
        } catch (err) {
            // Redis unavailable — fall through to DB
        }

        let settings = await settingsRepository.getSettings();

        if (!settings) {
            // Initialize with defaults if not exists
            settings = await settingsRepository.updateSettings({ isOpenToWork: true } as any);
        }

        const sanitized = this.safeParseSettings(settings);

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
        const sanitizedData = insertSiteSettingsApiSchema.parse(data);
        const settings = await settingsRepository.updateSettings(sanitizedData as any);
        try {
            if (redis) {
                await redis.del(this.CACHE_KEY);
            }
        } catch (err) {
            // Ignore cache delete error
        }
        return this.safeParseSettings(settings);
    }
}

export const settingsService = new SettingsService();
