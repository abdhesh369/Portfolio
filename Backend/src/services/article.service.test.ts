import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock dependencies (vi.hoisted ensures availability during vi.mock hoisting) ----
const {
    mockFindAll, mockFindBySlug, mockFindById, mockFindByIds,
    mockCreate, mockUpdate, mockDelete, mockBulkDelete,
    mockFindRelated, mockIncrementViewCount,
} = vi.hoisted(() => ({
    mockFindAll: vi.fn(),
    mockFindBySlug: vi.fn(),
    mockFindById: vi.fn(),
    mockFindByIds: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
    mockBulkDelete: vi.fn(),
    mockFindRelated: vi.fn(),
    mockIncrementViewCount: vi.fn(),
}));

vi.mock("../repositories/article.repository.js", () => ({
    articleRepository: {
        findAll: mockFindAll,
        findBySlug: mockFindBySlug,
        findById: mockFindById,
        findByIds: mockFindByIds,
        create: mockCreate,
        update: mockUpdate,
        delete: mockDelete,
        bulkDelete: mockBulkDelete,
        findRelated: mockFindRelated,
        incrementViewCount: mockIncrementViewCount,
    },
}));

// Mock Redis
const {
    mockRedisGet, mockRedisSetex, mockRedisDel, mockRedisSadd, mockRedisSmembers,
} = vi.hoisted(() => ({
    mockRedisGet: vi.fn(),
    mockRedisSetex: vi.fn(),
    mockRedisDel: vi.fn(),
    mockRedisSadd: vi.fn(),
    mockRedisSmembers: vi.fn(),
}));

vi.mock("../lib/redis.js", () => ({
    redis: {
        get: mockRedisGet,
        setex: mockRedisSetex,
        del: mockRedisDel,
        sadd: mockRedisSadd,
        smembers: mockRedisSmembers,
    },
}));

import { ArticleService } from "../services/article.service.js";

describe("ArticleService", () => {
    let service: ArticleService;

    beforeEach(() => {
        service = new ArticleService();
        vi.clearAllMocks();
    });

    describe("getAll", () => {
        it("returns cached articles on cache hit", async () => {
            const cachedArticles = [{ id: 1, title: "Cached" }];
            mockRedisGet.mockResolvedValue(JSON.stringify(cachedArticles));

            const result = await service.getAll("published");

            expect(result).toEqual(cachedArticles);
            expect(mockFindAll).not.toHaveBeenCalled();
            expect(mockRedisGet).toHaveBeenCalledWith("articles:status:published");
        });

        it("fetches from DB and caches on cache miss", async () => {
            const dbArticles = [{ id: 1, title: "From DB" }];
            mockRedisGet.mockResolvedValue(null);
            mockFindAll.mockResolvedValue(dbArticles);
            mockRedisSetex.mockResolvedValue("OK");
            mockRedisSadd.mockResolvedValue(1);

            const result = await service.getAll("published");

            expect(result).toEqual(dbArticles);
            expect(mockFindAll).toHaveBeenCalledWith("published");
            expect(mockRedisSetex).toHaveBeenCalledWith(
                "articles:status:published",
                3600,
                JSON.stringify(dbArticles)
            );
        });

        it("uses correct cache key when no status provided", async () => {
            mockRedisGet.mockResolvedValue(null);
            mockFindAll.mockResolvedValue([]);
            mockRedisSetex.mockResolvedValue("OK");
            mockRedisSadd.mockResolvedValue(1);

            await service.getAll();

            expect(mockRedisGet).toHaveBeenCalledWith("articles");
            expect(mockFindAll).toHaveBeenCalledWith(undefined);
        });
    });

    describe("getBySlug", () => {
        it("returns cached article on cache hit", async () => {
            const cached = { id: 1, title: "Cached", slug: "test" };
            mockRedisGet.mockResolvedValue(JSON.stringify(cached));

            const result = await service.getBySlug("test");

            expect(result).toEqual(cached);
            expect(mockFindBySlug).not.toHaveBeenCalled();
        });

        it("fetches from DB on cache miss", async () => {
            const article = { id: 1, title: "From DB", slug: "test" };
            mockRedisGet.mockResolvedValue(null);
            mockFindBySlug.mockResolvedValue(article);
            mockRedisSetex.mockResolvedValue("OK");
            mockRedisSadd.mockResolvedValue(1);

            const result = await service.getBySlug("test");

            expect(result).toEqual(article);
            expect(mockFindBySlug).toHaveBeenCalledWith("test");
        });

        it("returns null and does not cache when article not found", async () => {
            mockRedisGet.mockResolvedValue(null);
            mockFindBySlug.mockResolvedValue(null);

            const result = await service.getBySlug("nonexistent");

            expect(result).toBeNull();
            expect(mockRedisSetex).not.toHaveBeenCalled();
        });
    });

    describe("create", () => {
        it("creates article and invalidates cache", async () => {
            const created = { id: 1, title: "New", slug: "new", content: "Some content here" };
            mockCreate.mockResolvedValue(created);
            mockRedisSmembers.mockResolvedValue(["articles", "articles:status:published"]);
            mockRedisDel.mockResolvedValue(2);

            const result = await service.create({
                title: "New",
                content: "Some content here",
                status: "draft" as const,
                readTimeMinutes: 1,
                tags: ["tag1"],
            });

            expect(result).toEqual(created);
            expect(mockCreate).toHaveBeenCalled();
            expect(mockRedisDel).toHaveBeenCalled(); // Cache invalidated
        });
    });

    describe("update", () => {
        it("updates article and invalidates cache", async () => {
            const existing = { id: 1, title: "Old", slug: "old", status: "draft" };
            const updated = { id: 1, title: "Updated", slug: "old", status: "draft" };
            mockFindById.mockResolvedValue(existing);
            mockUpdate.mockResolvedValue(updated);
            mockRedisSmembers.mockResolvedValue([]);
            mockRedisDel.mockResolvedValue(1);

            const result = await service.update(1, { title: "Updated" });

            expect(result).toEqual(updated);
            expect(mockUpdate).toHaveBeenCalled();
        });

        it("throws when article not found", async () => {
            mockFindById.mockResolvedValue(null);

            await expect(service.update(999, { title: "X" })).rejects.toThrow(
                "Article with id 999 not found"
            );
        });
    });

    describe("delete", () => {
        it("deletes article and invalidates cache", async () => {
            const article = { id: 1, slug: "to-delete" };
            mockFindById.mockResolvedValue(article);
            mockDelete.mockResolvedValue(undefined);
            mockRedisSmembers.mockResolvedValue([]);
            mockRedisDel.mockResolvedValue(1);

            await service.delete(1);

            expect(mockDelete).toHaveBeenCalledWith(1);
            expect(mockRedisDel).toHaveBeenCalled();
        });
    });

    describe("incrementViewCount", () => {
        it("delegates to repository", async () => {
            mockIncrementViewCount.mockResolvedValue(undefined);

            await service.incrementViewCount(1);

            expect(mockIncrementViewCount).toHaveBeenCalledWith(1);
        });
    });
});
