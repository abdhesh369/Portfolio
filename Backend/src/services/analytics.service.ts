import { analyticsRepository } from "../repositories/analytics.repository.js";
import type { InsertAnalytics, Analytics } from "../../shared/schema.js";

export class AnalyticsService {
    async logEvent(event: InsertAnalytics): Promise<Analytics> {
        return analyticsRepository.logEvent(event);
    }

    async getSummary(): Promise<{ totalViews: number; events: number }> {
        return analyticsRepository.getSummary();
    }
}

export const analyticsService = new AnalyticsService();
