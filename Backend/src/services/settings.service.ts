import { settingsRepository } from "../repositories/settings.repository.js";
import { redis } from "../lib/redis.js";
import type { SiteSettings, InsertSiteSettings } from "../../shared/schema.js";
import DOMPurify from 'isomorphic-dompurify';

export class SettingsService {
    private readonly CACHE_KEY = "site:settings";
    private readonly CACHE_TTL = 3600;

    private sanitizeCss(css: string | null | undefined): string | null {
        if (!css) return null;

        // 1. Remove any potential HTML tags (prevent <script> inside CSS context if somehow injected)
        let sanitized = DOMPurify.sanitize(css, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
        });

        // 2. Strip dangerous CSS constructs: url(), @import, expression(), and protocols
        // Using word boundaries and handling different whitespace characters to neutralize instead of just deleting
        return sanitized
            .replace(/url\b\s*\(/gi, '/* url-stripped */')
            .replace(/@import\b/gi, '/* import-stripped */')
            .replace(/expression\b\s*\(/gi, '/* expression-stripped */')
            .replace(/javascript\s*:/gi, '/* js-stripped */')
            .replace(/vbscript\s*:/gi, '/* vbs-stripped */')
            .replace(/-moz-binding\b/gi, '/* binding-stripped */')
            .replace(/@font-face\b/gi, '/* font-face-stripped */')
            .replace(/@charset\b/gi, '/* charset-stripped */')
            .replace(/@namespace\b/gi, '/* namespace-stripped */');
    }

    async getSettings(): Promise<SiteSettings> {
        try {
            const cached = await redis?.get(this.CACHE_KEY);
            if (cached) {
                try {
                    const settings = JSON.parse(cached);
                    if (settings.customCss) {
                        settings.customCss = this.sanitizeCss(settings.customCss);
                    }
                    return settings;
                } catch { /* ignore corrupted JSON */ }
            }
        } catch (err) {
            // Error logged by redis internally usually, or can add logger if needed
        }

        let settings = await settingsRepository.getSettings();

        if (!settings) {
            // Initialize with defaults if not exists
            settings = await settingsRepository.updateSettings({ isOpenToWork: true });
        }

        // Always sanitize before returning to frontend
        if (settings.customCss) {
            settings.customCss = this.sanitizeCss(settings.customCss);
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
        // Sanitize before persistence
        if (data.customCss) {
            data.customCss = this.sanitizeCss(data.customCss);
        }

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
