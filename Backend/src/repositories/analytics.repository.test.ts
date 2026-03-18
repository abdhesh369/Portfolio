/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../db.js";

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
    const sqlTag = (...args: unknown[]) => {
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
        and: vi.fn((...args: unknown[]) => ({ and: args })),
    };
});

// db mock is in setup.ts

import { AnalyticsRepository } from "./analytics.repository.js";

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

            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockReturnThis(),
                then: vi.fn(onFulfilled => {
                    const p = Promise.resolve([mockInserted]);
                    return onFulfilled ? p.then(onFulfilled) : p;
                })
            } as any);  

            const result = await repo.logEvent(mockEvent as any);
            expect(result).toMatchObject({ id: 1, type: "page_view" });
        });

        it("throws if insert fails", async () => {
            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockReturnThis(),
                then: vi.fn(onFulfilled => {
                    const p = Promise.resolve([]);
                    return onFulfilled ? p.then(onFulfilled) : p;
                })
            } as any);  

            await expect(repo.logEvent({} as any)).rejects.toThrow("Failed to log analytics event");
        });
    });

    describe("getSummary", () => {
        it("returns full analytics summary with all aggregations", async () => {
            vi.mocked(db.select)
                // 1. totalEvents
                .mockReturnValueOnce({ from: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve([{ value: 200 }]).then(f) } as any)
                // 2. totalViews (page_view)
                .mockReturnValueOnce({ from: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve([{ value: 75 }]).then(f) } as any)
                // 3. dailyViews
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), groupBy: vi.fn().mockReturnThis(), orderBy: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve([
                        { date: "2025-01-01", views: 10 },
                        { date: "2025-01-02", views: 15 },
                    ]).then(f)
                } as any)
                // 4. topProjects
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), groupBy: vi.fn().mockReturnThis(), orderBy: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve([
                        { targetId: 3, views: 50 },
                        { targetId: 7, views: 30 },
                    ]).then(f)
                } as any)
                // 5. deviceBreakdown
                 
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), groupBy: vi.fn().mockReturnThis(), orderBy: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve([
                        { device: "desktop", count: 120 },
                        { device: "mobile", count: 80 },
                    ]).then(f)
                } as any)
                // 6. topCountries
                 
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), groupBy: vi.fn().mockReturnThis(), orderBy: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve([
                        { country: "US", visits: 90 },
                        { country: "IN", visits: 40 },
                    ]).then(f)
                } as any);

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
            expect(result.deviceBreakdown).toEqual(expect.arrayContaining([
                expect.objectContaining({ device: "desktop", percentage: 60 }),
                expect.objectContaining({ device: "mobile", percentage: 40 }),
            ]));
            expect(result.topCountries).toEqual([
                { country: "US", visits: 90 },
                { country: "IN", visits: 40 },
            ]);
        });
    });
});
