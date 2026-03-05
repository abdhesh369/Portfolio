import { settingsRepository } from "../repositories/settings.repository.js";
import { redis } from "../lib/redis.js";
import type { SiteSettings, InsertSiteSettings } from "../../shared/schema.js";

export class SettingsService {
    private readonly CACHE_KEY = "site:settings";
    private readonly CACHE_TTL = 3600;

    async getSettings(): Promise<SiteSettings> {
        try {
            const cached = await redis?.get(this.CACHE_KEY);
            if (cached) {
                try { return JSON.parse(cached); } catch { /* ignore corrupted JSON */ }
            }
        } catch (err) {
            // Error logged by redis internally usually, or can add logger if needed
        }

        let settings = await settingsRepository.getSettings();

        if (!settings) {
            // Initialize with defaults if not exists
            settings = await settingsRepository.updateSettings({ isOpenToWork: true });
        }

        try {
            if (redis) {
                await redis.setex(this.CACHE_KEY, this.CACHE_TTL, JSON.stringify(settings));
            }
        } catch (err) {
            // Ignore cache write error
        }
        return settings;
    }

    async updateSettings(data: InsertSiteSettings): Promise<SiteSettings> {
        const settings = await settingsRepository.updateSettings(data);
        try {
            if (redis) {
                await redis.del(this.CACHE_KEY);
            }
        } catch (err) {
            // Ignore cache delete error
        }
        return settings;
    }
}

export const settingsService = new SettingsService();
