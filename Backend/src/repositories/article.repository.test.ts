import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../db.js";

vi.mock("@portfolio/shared", () => ({
    articlesTable: { id: "id", status: "status", slug: "slug" },
    articleTagsTable: { id: "id", articleId: "articleId", tag: "tag" },
}));

// db mock is in setup.ts

import { articleRepository } from "./article.repository.js";

describe("ArticleRepository", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("findBySlug", () => {
        it("returns article with tags when found", async () => {
            const mockArticle = { id: 1, title: "Test", slug: "test" };
            const mockTags = [{ tag: "javascript" }];

            // Each db.select() call in the repository should get a fresh mock object
            // whose then() implementation resolves to the correct values sequentially.
            // Due to our updated setup.ts, select() returns a fresh copy of mockQuery.
            // But we need to be careful with how we mock it.

            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                then: vi.fn(onFulfilled => {
                    const p = Promise.resolve([mockArticle]);
                    return onFulfilled ? p.then(onFulfilled) : p;
                })
            } as any).mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                then: vi.fn(onFulfilled => {
                    const p = Promise.resolve(mockTags);
                    return onFulfilled ? p.then(onFulfilled) : p;
                })
            } as any);

            const result = await articleRepository.findBySlug("test");
            expect(result).not.toBeNull();
            expect(result!.tags).toEqual(["javascript"]);
        });

        it("returns null when article not found", async () => {
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                then: vi.fn(onFulfilled => {
                    const p = Promise.resolve([]);
                    return onFulfilled ? p.then(onFulfilled) : p;
                })
            } as any);

            const result = await articleRepository.findBySlug("missing");
            expect(result).toBeNull();
        });
    });
});
