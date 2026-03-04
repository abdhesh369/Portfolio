import { eq, count, sql, desc, gte, and } from "drizzle-orm";
import { db } from "../db.js";
import { analyticsTable, type InsertAnalytics, type Analytics } from "../../shared/schema.js";

/* ── Response types ── */

export interface DailyView {
    date: string;
    views: number;
}

export interface TopProject {
    targetId: number;
    views: number;
}

export interface DeviceBreakdown {
    device: string;
    count: number;
    percentage: number;
}

export interface TopCountry {
    country: string;
    visits: number;
}

export interface AnalyticsSummary {
    totalViews: number;
    totalEvents: number;
    dailyViews: DailyView[];
    topProjects: TopProject[];
    deviceBreakdown: DeviceBreakdown[];
    topCountries: TopCountry[];
}

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

export interface VitalEntry {
    name: string;
    value: number;
    rating: string;
    path: string;
}

export interface VitalAggregate {
    name: string;
    avg: number;
    p75: number;
    good: number;
    needsImprovement: number;
    poor: number;
    total: number;
}

export interface VitalsSummary {
    vitals: VitalAggregate[];
}

export class AnalyticsRepository {
    async logEvent(event: InsertAnalytics): Promise<Analytics> {
        const [inserted] = await db.insert(analyticsTable).values(event).returning();
        if (!inserted) throw new Error("Failed to log analytics event");
        return transformAnalytics(inserted);
    }

    async getSummary(): Promise<AnalyticsSummary> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Run all 6 aggregations in parallel for performance
        const [
            totalEventsResult,
            totalViewsResult,
            dailyViewsResult,
            topProjectsResult,
            deviceResult,
            countriesResult,
        ] = await Promise.all([
            // 1. Total events (all types)
            db.select({ value: count() }).from(analyticsTable),

            // 2. Total page views
            db.select({ value: count() })
                .from(analyticsTable)
                .where(eq(analyticsTable.type, "page_view")),

            // 3. Daily views for last 30 days (GROUP BY date)
            db.select({
                date: sql<string>`DATE(${analyticsTable.createdAt})`.as("date"),
                views: count(),
            })
                .from(analyticsTable)
                .where(
                    and(
                        eq(analyticsTable.type, "page_view"),
                        gte(analyticsTable.createdAt, thirtyDaysAgo),
                    ),
                )
                .groupBy(sql`DATE(${analyticsTable.createdAt})`)
                .orderBy(sql`DATE(${analyticsTable.createdAt})`),

            // 4. Top 5 projects by view count
            db.select({
                targetId: analyticsTable.targetId,
                views: count(),
            })
                .from(analyticsTable)
                .where(
                    and(
                        eq(analyticsTable.type, "project_view"),
                        sql`${analyticsTable.targetId} IS NOT NULL`,
                    ),
                )
                .groupBy(analyticsTable.targetId)
                .orderBy(desc(count()))
                .limit(5),

            // 5. Device breakdown (mobile / desktop / etc.)
            db.select({
                device: analyticsTable.device,
                count: count(),
            })
                .from(analyticsTable)
                .where(sql`${analyticsTable.device} IS NOT NULL`)
                .groupBy(analyticsTable.device)
                .orderBy(desc(count())),

            // 6. Top 10 countries by visit count
            db.select({
                country: analyticsTable.country,
                visits: count(),
            })
                .from(analyticsTable)
                .where(sql`${analyticsTable.country} IS NOT NULL`)
                .groupBy(analyticsTable.country)
                .orderBy(desc(count()))
                .limit(10),
        ]);

        const totalEvents = totalEventsResult[0]?.value ?? 0;
        const totalViews = totalViewsResult[0]?.value ?? 0;

        // Calculate device percentages
        const deviceTotal = deviceResult.reduce((sum, d) => sum + (d.count ?? 0), 0);
        const deviceBreakdown: DeviceBreakdown[] = deviceResult.map((d) => ({
            device: d.device ?? "unknown",
            count: d.count ?? 0,
            percentage: deviceTotal > 0 ? Math.round(((d.count ?? 0) / deviceTotal) * 100) : 0,
        }));

        return {
            totalViews,
            totalEvents,
            dailyViews: dailyViewsResult.map((d) => ({
                date: String(d.date),
                views: d.views ?? 0,
            })),
            topProjects: topProjectsResult.map((p) => ({
                targetId: p.targetId!,
                views: p.views ?? 0,
            })),
            deviceBreakdown,
            topCountries: countriesResult.map((c) => ({
                country: c.country ?? "Unknown",
                visits: c.visits ?? 0,
            })),
        };
    }

    async logVital(vital: VitalEntry): Promise<void> {
        // Store vitals as analytics events with type='vital'
        // Encode vital data in available columns:
        //   browser = vital name (LCP, CLS, etc.)
        //   os = rating (good, needs-improvement, poor)
        //   device = vital value as string
        await db.insert(analyticsTable).values({
            type: 'vital',
            path: vital.path,
            browser: vital.name,
            os: vital.rating,
            device: String(vital.value),
        });
    }

    async getVitalsSummary(days: number = 7): Promise<VitalsSummary> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const rows = await db
            .select({
                name: analyticsTable.browser,
                avg: sql<number>`ROUND(AVG(${analyticsTable.device}::numeric))`.as('avg'),
                p75: sql<number>`ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ${analyticsTable.device}::numeric))`.as('p75'),
                good: sql<number>`COUNT(*) FILTER (WHERE ${analyticsTable.os} = 'good')`.as('good'),
                needsImprovement: sql<number>`COUNT(*) FILTER (WHERE ${analyticsTable.os} = 'needs-improvement')`.as('needs_improvement'),
                poor: sql<number>`COUNT(*) FILTER (WHERE ${analyticsTable.os} = 'poor')`.as('poor'),
                total: count(),
            })
            .from(analyticsTable)
            .where(
                and(
                    eq(analyticsTable.type, 'vital'),
                    gte(analyticsTable.createdAt, since),
                ),
            )
            .groupBy(analyticsTable.browser);

        return {
            vitals: rows.map((r) => ({
                name: r.name ?? 'unknown',
                avg: Number(r.avg) || 0,
                p75: Number(r.p75) || 0,
                good: Number(r.good) || 0,
                needsImprovement: Number(r.needsImprovement) || 0,
                poor: Number(r.poor) || 0,
                total: r.total ?? 0,
            })),
        };
    }
}

export const analyticsRepository = new AnalyticsRepository();
