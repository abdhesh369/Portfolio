import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock dependencies ----
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

const { mockCacheGetOrSet, mockCacheInvalidate, mockCacheKey, mockCacheTrack, mockCacheInvalidateTracked } = vi.hoisted(() => ({
    mockCacheGetOrSet: vi.fn(),
    mockCacheInvalidate: vi.fn(),
    mockCacheKey: vi.fn().mockImplementation((f: string, n: string, id?: string | number) =>
        id !== undefined ? `${f}:${n}:${id}` : `${f}:${n}`
    ),
    mockCacheTrack: vi.fn(),
    mockCacheInvalidateTracked: vi.fn(),
}));

vi.mock("../lib/cache.js", () => ({
    CacheService: {
        getOrSet: mockCacheGetOrSet,
        invalidate: mockCacheInvalidate,
        key: mockCacheKey,
        track: mockCacheTrack,
        invalidateTracked: mockCacheInvalidateTracked,
    },
}));

vi.mock("../lib/logger.js", () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../routes/chat.js", () => ({ CHAT_CACHE_KEY: "chat:context" }));

import { ArticleService } from "./article.service.js";
import type { Article } from "@portfolio/shared";

const MOCK_ARTICLE: Article = {
    id: 1,
    title: "Test Article",
    slug: "test-article",
    content: "Content",
    excerpt: "Summary",
    status: "published",
    publishedAt: null,
    readTimeMinutes: 5,
    authorId: 1,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe("ArticleService", () => {
    let service: ArticleService;

    beforeEach(() => {
        service = new ArticleService();
        vi.clearAllMocks();
    });

    describe("getAll", () => {
        it("returns articles from cache and tracks hit", async () => {
            mockCacheGetOrSet.mockResolvedValue([MOCK_ARTICLE]);

            const result = await service.getAll("published");

            expect(result).toEqual([MOCK_ARTICLE]);
            expect(mockCacheGetOrSet).toHaveBeenCalled();
            expect(mockCacheTrack).toHaveBeenCalled();
        });

        it("calls repository when cache misses", async () => {
            mockCacheGetOrSet.mockImplementation(async (_key, _ttl, fetcher) => fetcher());
            mockFindAll.mockResolvedValue([MOCK_ARTICLE]);

            const result = await service.getAll("published");

            expect(mockFindAll).toHaveBeenCalledWith("published");
            expect(result).toEqual([MOCK_ARTICLE]);
        });
    });

    describe("getBySlug", () => {
        it("returns article from cache and tracks hit", async () => {
            mockCacheGetOrSet.mockResolvedValue(MOCK_ARTICLE);

            const result = await service.getBySlug("test-article");

            expect(result).toEqual(MOCK_ARTICLE);
            expect(mockCacheGetOrSet).toHaveBeenCalled();
            expect(mockCacheTrack).toHaveBeenCalled();
        });

        it("calls repository on cache miss", async () => {
            mockCacheGetOrSet.mockImplementation(async (_key, _ttl, fetcher) => fetcher());
            mockFindBySlug.mockResolvedValue(MOCK_ARTICLE);

            const result = await service.getBySlug("test-article");

            expect(mockFindBySlug).toHaveBeenCalledWith("test-article");
            expect(result).toEqual(MOCK_ARTICLE);
        });

        it("returns null when article not found", async () => {
            mockCacheGetOrSet.mockImplementation(async (_key, _ttl, fetcher) => fetcher());
            mockFindBySlug.mockResolvedValue(null);

            const result = await service.getBySlug("nonexistent");

            expect(result).toBeNull();
        });
    });

    describe("create", () => {
        it("creates an article and invalidates cache", async () => {
            mockCreate.mockResolvedValue(MOCK_ARTICLE);

            const data = {
                title: MOCK_ARTICLE.title,
                content: MOCK_ARTICLE.content,
                excerpt: MOCK_ARTICLE.excerpt,
                status: MOCK_ARTICLE.status,
                publishedAt: null as string | null,
                readTimeMinutes: MOCK_ARTICLE.readTimeMinutes,
                authorId: MOCK_ARTICLE.authorId,
                tags: []
            };
            const result = await service.create(data as any);

            expect(mockCreate).toHaveBeenCalled();
            expect(mockCacheInvalidateTracked).toHaveBeenCalled();
            expect(result).toEqual(MOCK_ARTICLE);
        });
    });

    describe("update", () => {
        it("updates matching article and invalidates cache", async () => {
            const updated = { ...MOCK_ARTICLE, title: "Updated" };
            mockFindById.mockResolvedValue(MOCK_ARTICLE);
            mockUpdate.mockResolvedValue(updated);

            const result = await service.update(1, { title: "Updated" });

            expect(mockUpdate).toHaveBeenCalled();
            expect(mockCacheInvalidateTracked).toHaveBeenCalled();
            expect(result.title).toBe("Updated");
        });

        it("throws when article does not exist", async () => {
            mockFindById.mockResolvedValue(null);

            await expect(service.update(999, { title: "X" })).rejects.toThrow(
                "Article with id 999 not found"
            );
        });
    });

    describe("delete", () => {
        it("deletes article and invalidates cache", async () => {
            mockFindById.mockResolvedValue(MOCK_ARTICLE);
            mockDelete.mockResolvedValue(undefined);

            await service.delete(1);

            expect(mockDelete).toHaveBeenCalledWith(1);
            expect(mockCacheInvalidateTracked).toHaveBeenCalled();
            expect(mockCacheInvalidate).toHaveBeenCalledWith(expect.stringContaining("test-article"));
        });
    });

    describe("bulkDelete", () => {
        it("bulk deletes articles and invalidates cache", async () => {
            mockFindByIds.mockResolvedValue([MOCK_ARTICLE]);
            mockBulkDelete.mockResolvedValue(undefined);

            await service.bulkDelete([1]);

            expect(mockBulkDelete).toHaveBeenCalledWith([1]);
            expect(mockCacheInvalidateTracked).toHaveBeenCalled();
            expect(mockCacheInvalidate).toHaveBeenCalled();
        });
    });

    describe("incrementViewCount", () => {
        it("delegates to repository without touching cache", async () => {
            mockIncrementViewCount.mockResolvedValue(undefined);

            await service.incrementViewCount(1);

            expect(mockIncrementViewCount).toHaveBeenCalledWith(1);
            expect(mockCacheInvalidate).not.toHaveBeenCalled();
        });
    });
});
