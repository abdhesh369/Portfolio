import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- helpers for building mock chains ----
function mockChain(resolved: any) {
    return {
        from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue(resolved),
                        then: (r: any) => Promise.resolve(resolved).then(r),
                    }),
                    then: (r: any) => Promise.resolve(resolved).then(r),
                }),
                then: (r: any) => Promise.resolve(resolved).then(r),
            }),
            then: (r: any) => Promise.resolve(resolved).then(r),
        }),
    };
}

// ---- Mock drizzle db ----
vi.mock("../db.js", () => ({
    db: {
        select: vi.fn().mockReturnValue(mockChain([])),
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([]),
            }),
        }),
    },
}));

vi.mock("@portfolio/shared", () => ({
    analyticsTable: {
        id: "id",
        type: "type",
        targetId: "targetId",
        device: "device",
        country: "country",
        createdAt: "createdAt",
    },
}));

vi.mock("drizzle-orm", () => {
    const sqlTag = (...args: any[]) => {
        const result = { __sql: args, as: vi.fn().mockReturnThis() };
        return result;
    };
    sqlTag.raw = vi.fn((s: string) => s);
    return {
        eq: vi.fn((col, val) => ({ col, val })),
        count: vi.fn(() => "count_expr"),
        sql: sqlTag,
        desc: vi.fn((v) => ({ desc: v })),
        gte: vi.fn((col, val) => ({ gte: col, val })),
        and: vi.fn((...args: any[]) => ({ and: args })),
    };
});

import { AnalyticsRepository } from "../repositories/analytics.repository.js";

describe("AnalyticsRepository", () => {
    let repo: AnalyticsRepository;

    beforeEach(() => {
        repo = new AnalyticsRepository();
        vi.clearAllMocks();
    });

    describe("logEvent", () => {
        it("inserts and returns the analytics event", async () => {
            const mockEvent = {
                type: "page_view" as const,
                path: "/",
                browser: "Chrome",
                os: "Windows",
                device: "Desktop",
            };
            const mockInserted = { id: 1, ...mockEvent, createdAt: new Date() };

            const { db } = await import("../db.js");
            (db.insert as any).mockReturnValueOnce({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([mockInserted]),
                }),
            });

            const result = await repo.logEvent(mockEvent as any);
            expect(result).toMatchObject({ id: 1, type: "page_view", path: "/" });
        });

        it("throws if insert fails", async () => {
            const { db } = await import("../db.js");
            (db.insert as any).mockReturnValueOnce({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([]),
                }),
            });

            await expect(repo.logEvent({} as any)).rejects.toThrow("Failed to log analytics event");
        });
    });

    describe("getSummary", () => {
        it("returns full analytics summary with all aggregations", async () => {
            const { db } = await import("../db.js");
            (db.select as any)
                // 1. totalEvents
                .mockReturnValueOnce(mockChain([{ value: 200 }]))
                // 2. totalViews (page_view)
                .mockReturnValueOnce(mockChain([{ value: 75 }]))
                // 3. dailyViews
                .mockReturnValueOnce(mockChain([
                    { date: "2025-01-01", views: 10 },
                    { date: "2025-01-02", views: 15 },
                ]))
                // 4. topProjects
                .mockReturnValueOnce(mockChain([
                    { targetId: 3, views: 50 },
                    { targetId: 7, views: 30 },
                ]))
                // 5. deviceBreakdown
                .mockReturnValueOnce(mockChain([
                    { device: "desktop", count: 120 },
                    { device: "mobile", count: 80 },
                ]))
                // 6. topCountries
                .mockReturnValueOnce(mockChain([
                    { country: "US", visits: 90 },
                    { country: "IN", visits: 40 },
                ]));

            const result = await repo.getSummary();

            expect(result.totalViews).toBe(75);
            expect(result.totalEvents).toBe(200);
            expect(result.dailyViews).toEqual([
                { date: "2025-01-01", views: 10 },
                { date: "2025-01-02", views: 15 },
            ]);
            expect(result.topProjects).toEqual([
                { targetId: 3, views: 50 },
                { targetId: 7, views: 30 },
            ]);
            expect(result.deviceBreakdown).toEqual([
                { device: "desktop", count: 120, percentage: 60 },
                { device: "mobile", count: 80, percentage: 40 },
            ]);
            expect(result.topCountries).toEqual([
                { country: "US", visits: 90 },
                { country: "IN", visits: 40 },
            ]);
        });

        it("returns empty arrays and zeros when no data", async () => {
            const { db } = await import("../db.js");
            (db.select as any)
                .mockReturnValueOnce(mockChain([undefined]))
                .mockReturnValueOnce(mockChain([undefined]))
                .mockReturnValueOnce(mockChain([]))
                .mockReturnValueOnce(mockChain([]))
                .mockReturnValueOnce(mockChain([]))
                .mockReturnValueOnce(mockChain([]));

            const result = await repo.getSummary();

            expect(result.totalViews).toBe(0);
            expect(result.totalEvents).toBe(0);
            expect(result.dailyViews).toEqual([]);
            expect(result.topProjects).toEqual([]);
            expect(result.deviceBreakdown).toEqual([]);
            expect(result.topCountries).toEqual([]);
        });

        it("calculates device percentages correctly with single device", async () => {
            const { db } = await import("../db.js");
            (db.select as any)
                .mockReturnValueOnce(mockChain([{ value: 50 }]))
                .mockReturnValueOnce(mockChain([{ value: 50 }]))
                .mockReturnValueOnce(mockChain([]))
                .mockReturnValueOnce(mockChain([]))
                .mockReturnValueOnce(mockChain([{ device: "mobile", count: 50 }]))
                .mockReturnValueOnce(mockChain([]));

            const result = await repo.getSummary();

            expect(result.deviceBreakdown).toEqual([
                { device: "mobile", count: 50, percentage: 100 },
            ]);
        });

        it("handles null device/country gracefully", async () => {
            const { db } = await import("../db.js");
            (db.select as any)
                .mockReturnValueOnce(mockChain([{ value: 10 }]))
                .mockReturnValueOnce(mockChain([{ value: 5 }]))
                .mockReturnValueOnce(mockChain([]))
                .mockReturnValueOnce(mockChain([]))
                .mockReturnValueOnce(mockChain([{ device: null, count: 10 }]))
                .mockReturnValueOnce(mockChain([{ country: null, visits: 5 }]));

            const result = await repo.getSummary();

            expect(result.deviceBreakdown[0].device).toBe("unknown");
            expect(result.topCountries[0].country).toBe("Unknown");
        });
    });
});
