import { settingsRepository } from "../repositories/settings.repository.js";
import { redis } from "../lib/redis.js";
import type { SiteSettings, InsertSiteSettings } from "../../shared/schema.js";

export class SettingsService {
    private readonly CACHE_KEY = "site:settings";
    private readonly CACHE_TTL = 3600;

    async getSettings(): Promise<SiteSettings> {
        const cached = await redis?.get(this.CACHE_KEY);
        if (cached) return JSON.parse(cached);

        let settings = await settingsRepository.getSettings();

        if (!settings) {
            // Initialize with defaults if not exists
            settings = await settingsRepository.updateSettings({ isOpenToWork: true });
        }

        if (redis) {
            await redis.setex(this.CACHE_KEY, this.CACHE_TTL, JSON.stringify(settings));
        }
        return settings;
    }

    async updateSettings(data: InsertSiteSettings): Promise<SiteSettings> {
        const settings = await settingsRepository.updateSettings(data);
        if (redis) {
            await redis.del(this.CACHE_KEY);
        }
        return settings;
    }
}

export const settingsService = new SettingsService();
