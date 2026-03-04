import { analyticsRepository, type AnalyticsSummary, type VitalEntry, type VitalsSummary } from "../repositories/analytics.repository.js";
import type { InsertAnalytics, Analytics } from "../../shared/schema.js";

export class AnalyticsService {
    async logEvent(event: InsertAnalytics): Promise<Analytics> {
        return analyticsRepository.logEvent(event);
    }

    async getSummary(): Promise<AnalyticsSummary> {
        return analyticsRepository.getSummary();
    }

    async logVital(vital: VitalEntry): Promise<void> {
        return analyticsRepository.logVital(vital);
    }

    async getVitalsSummary(days?: number): Promise<VitalsSummary> {
        return analyticsRepository.getVitalsSummary(days);
    }
}

export const analyticsService = new AnalyticsService();
