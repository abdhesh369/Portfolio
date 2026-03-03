import { eq, count } from "drizzle-orm";
import { db } from "../db.js";
import { analyticsTable, type InsertAnalytics, type Analytics } from "../../shared/schema.js";

function transformAnalytics(dbAnalytics: any): Analytics {
    return {
        id: dbAnalytics.id,
        type: dbAnalytics.type,
        targetId: dbAnalytics.targetId,
        path: dbAnalytics.path,
        browser: dbAnalytics.browser,
        os: dbAnalytics.os,
        device: dbAnalytics.device,
        country: dbAnalytics.country,
        city: dbAnalytics.city,
        createdAt: dbAnalytics.createdAt,
    };
}

export class AnalyticsRepository {
    async logEvent(event: InsertAnalytics): Promise<Analytics> {
        const [inserted] = await db.insert(analyticsTable).values(event).returning();
        if (!inserted) throw new Error("Failed to log analytics event");
        return transformAnalytics(inserted);
    }

    async getSummary(): Promise<{ totalViews: number; events: number }> {
        const [totalResult] = await db
            .select({ value: count() })
            .from(analyticsTable);

        const [viewsResult] = await db
            .select({ value: count() })
            .from(analyticsTable)
            .where(eq(analyticsTable.type, "page_view"));

        return {
            totalViews: viewsResult?.value ?? 0,
            events: totalResult?.value ?? 0,
        };
    }
}

export const analyticsRepository = new AnalyticsRepository();
