import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../db.js";

// ---- Mock drizzle db (vi.hoisted ensures availability during vi.mock hoisting) ----
const {
    mockSelect, mockInsert, mockUpdate, mockDeleteFrom, mockTransaction, mockExecute,
} = vi.hoisted(() => ({
    mockSelect: vi.fn(),
    mockInsert: vi.fn(),
    mockUpdate: vi.fn(),
    mockDeleteFrom: vi.fn(),
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

vi.mock("../db.js");

import { articleRepository } from "./article.repository.js";

describe("ArticleRepository", () => {
    let repo: typeof articleRepository;

    beforeEach(() => {
        repo = articleRepository;
        vi.clearAllMocks();
    });

    describe("findAll", () => {
        it("returns all articles when no status filter provided", async () => {
            const mockArticles = [
                { id: 1, title: "Article 1", status: "published" },
                { id: 2, title: "Article 2", status: "draft" },
            ];

            mockSelect.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockResolvedValueOnce(mockArticles),
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockResolvedValueOnce([{ articleId: 1, tag: "test" }])
                    })
                })
            });

            const result = await repo.findAll();

            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty("tags");
        });

        it("filters by published status when status='published'", async () => {
            const mockArticles = [{ id: 1, title: "Published", status: "published" }];

            mockSelect.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockResolvedValueOnce(mockArticles)
                    }),
                    orderBy: vi.fn().mockResolvedValueOnce([{ articleId: 1, tag: "test" }])
                })
            });

            const result = await repo.findAll("published");

            expect(result).toHaveLength(1);
            expect(result[0].tags).toEqual(["test"]);
        });
    });

    describe("findBySlug", () => {
        it("returns article with tags when found", async () => {
            const mockArticle = { id: 1, title: "Test", slug: "test", status: "published" };

            mockSelect.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValueOnce([mockArticle])
                    }),
                    orderBy: vi.fn().mockResolvedValueOnce([{ articleId: 1, tag: "javascript" }])
                })
            });

            const result = await repo.findBySlug("test");
            expect(result).not.toBeNull();
            expect(result!.tags).toEqual(["javascript"]);
        });
    });

    describe("incrementViewCount", () => {
        it("increments view count by 1", async () => {
            mockUpdate.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValueOnce(undefined)
                })
            });

            await repo.incrementViewCount(1);
            expect(mockUpdate).toHaveBeenCalled();
        });
    });
});
