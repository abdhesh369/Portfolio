import { analyticsRepository, type AnalyticsSummary, type VitalEntry, type VitalsSummary } from "../repositories/analytics.repository.js";
import type { InsertAnalytics, Analytics } from "@portfolio/shared";
import { CacheService } from "../lib/cache.js";

const FEATURE = "analytics";
const SUMMARY_TTL = 3600; // 1 hour

export class AnalyticsService {
    /**
     * Logs an analytics event to the database.
     * @param event - The analytics event data to record
     * @returns The created analytics record
     */
    async logEvent(event: InsertAnalytics): Promise<Analytics> {
        return analyticsRepository.logEvent(event);
    }

    /**
     * Retrieves an aggregated analytics summary, cached for 1 hour.
     * @returns The analytics summary data
     */
    async getSummary(): Promise<AnalyticsSummary> {
        const key = CacheService.key(FEATURE, "summary");
        return CacheService.getOrSet(key, SUMMARY_TTL, () =>
            analyticsRepository.getSummary()
        );
    }

    /**
     * Logs a web vital metric entry.
     * @param vital - The web vital entry data to record
     * @returns Resolves when the vital is logged
     */
    async logVital(vital: VitalEntry): Promise<void> {
        return analyticsRepository.logVital(vital);
    }

    /**
     * Retrieves a summary of web vitals metrics, cached for 1 hour.
     * @param days - Optional number of days to include in the summary
     * @returns The aggregated web vitals summary
     */
    async getVitalsSummary(days: number = 7): Promise<VitalsSummary> {
        const key = CacheService.key(FEATURE, `vitals:${days}`);
        return CacheService.getOrSet(key, SUMMARY_TTL, () =>
            analyticsRepository.getVitalsSummary(days)
        );
    }
}

export const analyticsService = new AnalyticsService();
