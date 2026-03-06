import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock drizzle db (vi.hoisted ensures availability during vi.mock hoisting) ----
const { mockReturning, mockDeleteWhere, mockValues } = vi.hoisted(() => {
    const mockReturning = vi.fn();
    const mockDeleteWhere = vi.fn().mockReturnValue({ returning: mockReturning });
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    return { mockReturning, mockDeleteWhere, mockValues };
});

vi.mock("../db.js", () => ({
    db: {
        select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue([]),
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([]),
                }),
            }),
        }),
        insert: vi.fn().mockReturnValue({ values: mockValues }),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({ returning: mockReturning }),
            }),
        }),
        delete: vi.fn().mockReturnValue({ where: mockDeleteWhere }),
    },
}));

vi.mock("@portfolio/shared", () => ({
    messagesTable: { id: "id", createdAt: "createdAt" },
}));

vi.mock("drizzle-orm", () => ({
    eq: vi.fn((col, val) => ({ col, val })),
    desc: vi.fn((col) => ({ col })),
    inArray: vi.fn((col, vals) => ({ col, vals })),
}));

import { MessageRepository } from "../repositories/message.repository.js";

describe("MessageRepository", () => {
    let repo: MessageRepository;

    beforeEach(() => {
        repo = new MessageRepository();
        vi.clearAllMocks();
    });

    describe("findAll", () => {
        it("returns transformed messages", async () => {
            const now = new Date();
            const mockResults = [
                { id: 1, name: "Test", email: "test@test.com", subject: "Hi", message: "Hello", createdAt: now },
            ];

            const { db } = await import("../db.js");
            (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockResolvedValue(mockResults),
                }),
            });

            const result = await repo.findAll();

            expect(result).toHaveLength(1);
            expect(result[0].createdAt).toBe(now.toISOString());
        });

        it("preserves string createdAt values", async () => {
            const mockResults = [
                { id: 1, name: "Test", email: "test@test.com", subject: "Hi", message: "Hello", createdAt: "2025-01-01T00:00:00.000Z" },
            ];

            const { db } = await import("../db.js");
            (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockResolvedValue(mockResults),
                }),
            });

            const result = await repo.findAll();

            expect(result[0].createdAt).toBe("2025-01-01T00:00:00.000Z");
        });
    });

    describe("create", () => {
        it("creates and transforms a message", async () => {
            const now = new Date();
            mockReturning.mockResolvedValueOnce([
                { id: 1, name: "User", email: "user@mail.com", subject: "", message: "Hello", createdAt: now },
            ]);

            const { db } = await import("../db.js");
            (db.insert as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
                values: vi.fn().mockReturnValue({ returning: mockReturning }),
            });

            const result = await repo.create({
                name: "User",
                email: "user@mail.com",
                message: "Hello",
                subject: "",
            });

            expect(result.id).toBe(1);
            expect(result.createdAt).toBe(now.toISOString());
        });
    });

    describe("delete", () => {
        it("returns true when a record is deleted", async () => {
            const mockDeleteReturning = vi.fn().mockResolvedValue([{ id: 1 }]);
            const mockDeleteWhereFn = vi.fn().mockReturnValue({ returning: mockDeleteReturning });

            const { db } = await import("../db.js");
            (db.delete as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({ where: mockDeleteWhereFn });

            const result = await repo.delete(1);
            expect(result).toBe(true);
        });

        it("returns false when no record is found", async () => {
            const mockDeleteReturning = vi.fn().mockResolvedValue([]);
            const mockDeleteWhereFn = vi.fn().mockReturnValue({ returning: mockDeleteReturning });

            const { db } = await import("../db.js");
            (db.delete as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({ where: mockDeleteWhereFn });

            const result = await repo.delete(999);
            expect(result).toBe(false);
        });
    });

    describe("bulkDelete", () => {
        it("does nothing when ids array is empty", async () => {
            const { db } = await import("../db.js");
            await repo.bulkDelete([]);
            expect(db.delete).not.toHaveBeenCalled();
        });

        it("deletes records for given ids", async () => {
            const mockBulkWhere = vi.fn().mockResolvedValue(undefined);
            const { db } = await import("../db.js");
            (db.delete as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({ where: mockBulkWhere });

            await repo.bulkDelete([1, 2, 3]);
            expect(db.delete).toHaveBeenCalled();
        });
    });
});
