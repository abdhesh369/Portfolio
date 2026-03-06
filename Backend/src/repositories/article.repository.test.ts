import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock drizzle db (vi.hoisted ensures availability during vi.mock hoisting) ----
const {
    mockSelect, mockInsert, mockUpdate, mockDeleteFrom, mockTransaction, mockExecute,
} = vi.hoisted(() => ({
    mockSelect: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ orderBy: vi.fn().mockResolvedValue([]) }) }),
    mockInsert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }),
    mockUpdate: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }) }),
    mockDeleteFrom: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    mockTransaction: vi.fn(),
    mockExecute: vi.fn(),
}));

vi.mock("../db.js", () => ({
    db: {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDeleteFrom,
        transaction: mockTransaction,
        execute: mockExecute,
    },
}));

vi.mock("@portfolio/shared", () => ({
    articlesTable: { id: "id", status: "status", slug: "slug", publishedAt: "publishedAt", createdAt: "createdAt", viewCount: "viewCount" },
    articleTagsTable: { id: "id", articleId: "articleId", tag: "tag" },
}));

vi.mock("drizzle-orm", () => ({
    eq: vi.fn((col, val) => ({ col, val, type: "eq" })),
    desc: vi.fn((col) => ({ col, type: "desc" })),
    and: vi.fn((...args: any[]) => ({ args, type: "and" })),
    sql: vi.fn(),
    inArray: vi.fn((col, vals) => ({ col, vals, type: "inArray" })),
}));

import { ArticleRepository } from "../repositories/article.repository.js";

describe("ArticleRepository", () => {
    let repo: ArticleRepository;

    beforeEach(() => {
        repo = new ArticleRepository();
        vi.clearAllMocks();
    });

    describe("findAll", () => {
        it("returns all articles when no status filter provided", async () => {
            const mockArticles = [
                { id: 1, title: "Article 1", status: "published" },
                { id: 2, title: "Article 2", status: "draft" },
            ];
            // Mock the query chain for no-status path
            const mockOrderByFn = vi.fn().mockResolvedValue(mockArticles);
            const mockFromFn = vi.fn().mockReturnValue({ orderBy: mockOrderByFn });
            mockSelect.mockReturnValueOnce({ from: mockFromFn });

            // Mock tag fetch (returns empty)
            const mockTagWhere = vi.fn().mockResolvedValue([]);
            const mockTagFrom = vi.fn().mockReturnValue({ where: mockTagWhere });
            mockSelect.mockReturnValueOnce({ from: mockTagFrom });

            const result = await repo.findAll();

            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty("tags");
        });

        it("filters by published status when status='published'", async () => {
            const mockArticles = [{ id: 1, title: "Published", status: "published" }];

            // Mock the query chain for status path (with .where)
            const mockOrderByFn = vi.fn().mockResolvedValue(mockArticles);
            const mockWhereFn = vi.fn().mockReturnValue({ orderBy: mockOrderByFn });
            const mockFromFn = vi.fn().mockReturnValue({ where: mockWhereFn });
            mockSelect.mockReturnValueOnce({ from: mockFromFn });

            // Mock tag fetch
            const mockTagWhere = vi.fn().mockResolvedValue([{ articleId: 1, tag: "test" }]);
            const mockTagFrom = vi.fn().mockReturnValue({ where: mockTagWhere });
            mockSelect.mockReturnValueOnce({ from: mockTagFrom });

            const result = await repo.findAll("published");

            expect(mockWhereFn).toHaveBeenCalled();
            expect(result).toHaveLength(1);
            expect(result[0].tags).toEqual(["test"]);
        });

        it("filters by draft status when status='draft'", async () => {
            const mockArticles = [{ id: 2, title: "Draft", status: "draft" }];

            const mockOrderByFn = vi.fn().mockResolvedValue(mockArticles);
            const mockWhereFn = vi.fn().mockReturnValue({ orderBy: mockOrderByFn });
            const mockFromFn = vi.fn().mockReturnValue({ where: mockWhereFn });
            mockSelect.mockReturnValueOnce({ from: mockFromFn });

            // No tags
            const mockTagWhere = vi.fn().mockResolvedValue([]);
            const mockTagFrom = vi.fn().mockReturnValue({ where: mockTagWhere });
            mockSelect.mockReturnValueOnce({ from: mockTagFrom });

            const result = await repo.findAll("draft");

            expect(mockWhereFn).toHaveBeenCalled();
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty("tags");
        });

        it("returns empty array when no articles found", async () => {
            const mockOrderByFn = vi.fn().mockResolvedValue([]);
            const mockFromFn = vi.fn().mockReturnValue({ orderBy: mockOrderByFn });
            mockSelect.mockReturnValueOnce({ from: mockFromFn });

            const result = await repo.findAll();
            expect(result).toEqual([]);
        });
    });

    describe("findBySlug", () => {
        it("returns null when article not found", async () => {
            const mockLimitFn = vi.fn().mockResolvedValue([]);
            const mockWhereFn = vi.fn().mockReturnValue({ limit: mockLimitFn });
            const mockFromFn = vi.fn().mockReturnValue({ where: mockWhereFn });
            mockSelect.mockReturnValueOnce({ from: mockFromFn });

            const result = await repo.findBySlug("nonexistent");
            expect(result).toBeNull();
        });

        it("returns article with tags when found", async () => {
            const mockArticle = { id: 1, title: "Test", slug: "test", status: "published" };

            const mockLimitFn = vi.fn().mockResolvedValue([mockArticle]);
            const mockWhereFn = vi.fn().mockReturnValue({ limit: mockLimitFn });
            const mockFromFn = vi.fn().mockReturnValue({ where: mockWhereFn });
            mockSelect.mockReturnValueOnce({ from: mockFromFn });

            // Tags query
            const mockTagWhere = vi.fn().mockResolvedValue([{ articleId: 1, tag: "javascript" }]);
            const mockTagFrom = vi.fn().mockReturnValue({ where: mockTagWhere });
            mockSelect.mockReturnValueOnce({ from: mockTagFrom });

            const result = await repo.findBySlug("test");
            expect(result).not.toBeNull();
            expect(result!.tags).toEqual(["javascript"]);
        });
    });

    describe("create", () => {
        it("creates an article with tags in a transaction", async () => {
            const mockTxInsertArticle = vi.fn().mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 1, title: "New Article" }]),
                }),
            });
            const mockTxInsertTags = vi.fn().mockReturnValue({
                values: vi.fn().mockResolvedValue(undefined),
            });

            mockTransaction.mockImplementation(async (fn: any) => {
                const tx = { insert: mockTxInsertArticle };
                // Call with different tables
                mockTxInsertArticle
                    .mockReturnValueOnce({
                        values: vi.fn().mockReturnValue({
                            returning: vi.fn().mockResolvedValue([{ id: 1, title: "New Article" }]),
                        }),
                    })
                    .mockReturnValueOnce({
                        values: vi.fn().mockResolvedValue(undefined),
                    });
                return fn(tx);
            });

            const result = await repo.create({
                title: "New Article",
                content: "Content here",
                status: "draft",
                readTimeMinutes: 3,
                tags: ["tag1", "tag2"],
            });

            expect(result).toBeDefined();
            expect(mockTransaction).toHaveBeenCalled();
        });
    });

    describe("incrementViewCount", () => {
        it("increments view count by 1", async () => {
            const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
            const mockUpdateSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
            mockUpdate.mockReturnValueOnce({ set: mockUpdateSet });

            await repo.incrementViewCount(1);

            expect(mockUpdate).toHaveBeenCalled();
            expect(mockUpdateSet).toHaveBeenCalled();
        });
    });
});
