import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock drizzle db ----
const {
    mockSelect, mockInsert, mockUpdate, mockDelete,
} = vi.hoisted(() => ({
    mockSelect: vi.fn(),
    mockInsert: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
}));

vi.mock("../db.js", () => ({
    db: {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
    },
}));

const { mockCacheGetOrSet, mockCacheInvalidate, mockCacheKey } = vi.hoisted(() => ({
    mockCacheGetOrSet: vi.fn(),
    mockCacheInvalidate: vi.fn(),
    mockCacheKey: vi.fn().mockImplementation((f: string, n: string, id?: string | number) =>
        id !== undefined ? `${f}:${n}:${id}` : `${f}:${n}`
    ),
}));

vi.mock("../lib/cache.js", () => ({
    CacheService: {
        getOrSet: mockCacheGetOrSet,
        invalidate: mockCacheInvalidate,
        key: mockCacheKey,
    },
}));

vi.mock("../lib/logger.js", () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("@portfolio/shared", () => ({
    guestbookTable: { id: "id", isApproved: "isApproved", createdAt: "createdAt" },
}));

vi.mock("drizzle-orm", () => ({
    eq: vi.fn(),
    desc: vi.fn(),
}));

import { GuestbookService } from "./guestbook.service.js";

const MOCK_ENTRY = {
    id: 1,
    name: "Alice",
    content: "Great portfolio!",
    email: "alice@example.com",
    isApproved: true,
    createdAt: new Date(),
};

describe("GuestbookService", () => {
    let service: GuestbookService;

    beforeEach(() => {
        service = new GuestbookService();
        vi.clearAllMocks();
    });

    describe("getMessages", () => {
        it("returns approved messages from cache by default", async () => {
            mockCacheGetOrSet.mockResolvedValue([MOCK_ENTRY]);

            const result = await service.getMessages();

            expect(mockCacheGetOrSet).toHaveBeenCalledWith(
                expect.stringContaining("approved"),
                3600,
                expect.any(Function)
            );
            expect(result).toEqual([MOCK_ENTRY]);
        });

        it("uses 'all' cache key when onlyApproved is false", async () => {
            mockCacheGetOrSet.mockResolvedValue([MOCK_ENTRY]);

            await service.getMessages(false);

            expect(mockCacheKey).toHaveBeenCalledWith("guestbook", "list", "all");
        });
    });

    describe("addMessage", () => {
        it("inserts a new message with isApproved=false and invalidates cache", async () => {
            const chain = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([MOCK_ENTRY]),
            };
            mockInsert.mockReturnValue({ values: chain.values, returning: chain.returning });

            // The real code uses chained db.insert().values().returning()
            // We need to simulate the full chain
            const insertChain = {
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([MOCK_ENTRY]),
                }),
            };
            mockInsert.mockReturnValue(insertChain);

            const result = await service.addMessage({
                name: "Alice",
                content: "Great portfolio!",
                email: "alice@example.com",
            });

            expect(mockInsert).toHaveBeenCalled();
            expect(mockCacheInvalidate).toHaveBeenCalled();
            expect(result).toEqual(MOCK_ENTRY);
        });
    });

    describe("approveMessage", () => {
        it("sets isApproved=true and invalidates cache", async () => {
            const updateChain = {
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([{ ...MOCK_ENTRY, isApproved: true }]),
                    }),
                }),
            };
            mockUpdate.mockReturnValue(updateChain);

            const result = await service.approveMessage(1);

            expect(mockUpdate).toHaveBeenCalled();
            expect(mockCacheInvalidate).toHaveBeenCalled();
            expect(result.isApproved).toBe(true);
        });
    });

    describe("deleteMessage", () => {
        it("deletes the message and invalidates cache", async () => {
            const deleteChain = {
                where: vi.fn().mockResolvedValue(undefined),
            };
            mockDelete.mockReturnValue(deleteChain);

            const result = await service.deleteMessage(1);

            expect(mockDelete).toHaveBeenCalled();
            expect(mockCacheInvalidate).toHaveBeenCalled();
            expect(result).toBe(true);
        });
    });
});
