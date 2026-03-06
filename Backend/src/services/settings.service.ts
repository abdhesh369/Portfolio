import { settingsRepository } from "../repositories/settings.repository.js";
import { type SiteSettings, type InsertSiteSettings, siteSettingsSchema, insertSiteSettingsApiSchema } from "@portfolio/shared";
import { logger } from "../lib/logger.js";
import { CacheService } from "../lib/cache.js";

const FEATURE = "site";
const NAMESPACE = "settings";
const CACHE_TTL = 3600;

export class SettingsService {
    private initPromise: Promise<SiteSettings> | null = null;

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
        if (this.initPromise) return this.initPromise;

        const key = CacheService.key(FEATURE, NAMESPACE);

        this.initPromise = (async () => {
            try {
                const settings = await CacheService.getOrSet(key, CACHE_TTL, async () => {
                    let data = await settingsRepository.getSettings();
                    if (!data) {
                        // Initialize with defaults if not exists
                        data = await settingsRepository.updateSettings({ isOpenToWork: true });
                    }
                    return data;
                });

                return this.safeParseSettings(settings);
            } finally {
                this.initPromise = null;
            }
        })();

        return this.initPromise;
    }

    async updateSettings(data: InsertSiteSettings): Promise<SiteSettings> {
        const sanitizedData = insertSiteSettingsApiSchema.parse(data);
        const settings = await settingsRepository.updateSettings(sanitizedData);

        const key = CacheService.key(FEATURE, NAMESPACE);
        await CacheService.invalidate(key);

        return this.safeParseSettings(settings);
    }
}

export const settingsService = new SettingsService();
