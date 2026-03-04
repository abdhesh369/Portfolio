import { analyticsRepository, type AnalyticsSummary, type VitalEntry, type VitalsSummary } from "../repositories/analytics.repository.js";
import type { InsertAnalytics, Analytics } from "../../shared/schema.js";

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
     * Retrieves an aggregated analytics summary.
     * @returns The analytics summary data
     */
    async getSummary(): Promise<AnalyticsSummary> {
        return analyticsRepository.getSummary();
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
     * Retrieves a summary of web vitals metrics.
     * @param days - Optional number of days to include in the summary
     * @returns The aggregated web vitals summary
     */
    async getVitalsSummary(days?: number): Promise<VitalsSummary> {
        return analyticsRepository.getVitalsSummary(days);
    }
}

export const analyticsService = new AnalyticsService();
