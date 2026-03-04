import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock drizzle db ----
vi.mock("../db.js", () => ({
    db: {
        select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([]),
            }),
        }),
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([]),
            }),
        }),
    },
}));

vi.mock("../../shared/schema.js", () => ({
    analyticsTable: { id: "id", type: "type" },
}));

vi.mock("drizzle-orm", () => ({
    eq: vi.fn((col, val) => ({ col, val })),
    count: vi.fn(() => "count_expr"),
}));

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
        it("returns totalViews and events counts", async () => {
            const { db } = await import("../db.js");
            (db.select as any)
                // First call: total events
                .mockReturnValueOnce({
                    from: vi.fn().mockResolvedValue([{ value: 100 }]),
                })
                // Second call: page_view count
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockResolvedValue([{ value: 42 }]),
                    }),
                });

            const result = await repo.getSummary();
            expect(result).toEqual({ totalViews: 42, events: 100 });
        });

        it("returns 0 when no data", async () => {
            const { db } = await import("../db.js");
            (db.select as any)
                .mockReturnValueOnce({
                    from: vi.fn().mockResolvedValue([undefined]),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockResolvedValue([undefined]),
                    }),
                });

            const result = await repo.getSummary();
            expect(result).toEqual({ totalViews: 0, events: 0 });
        });
    });
});
