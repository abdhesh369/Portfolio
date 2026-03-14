import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock dependencies ----
const mockArticleRepository = {
    findAll: vi.fn(),
    findBySlug: vi.fn(),
    findById: vi.fn(),
    findByIds: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    bulkDelete: vi.fn(),
    findRelated: vi.fn(),
    incrementViewCount: vi.fn(),
    addReaction: vi.fn(),
    search: vi.fn(),
};

vi.mock("../repositories/article.repository.js", () => ({
    articleRepository: mockArticleRepository,
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
            mockArticleRepository.findAll.mockResolvedValue([MOCK_ARTICLE]);

            const result = await service.getAll("published");

            expect(mockArticleRepository.findAll).toHaveBeenCalledWith("published");
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
            mockArticleRepository.findBySlug.mockResolvedValue(MOCK_ARTICLE);

            const result = await service.getBySlug("test-article");

            expect(mockArticleRepository.findBySlug).toHaveBeenCalledWith("test-article");
            expect(result).toEqual(MOCK_ARTICLE);
        });

        it("returns null when article not found", async () => {
            mockCacheGetOrSet.mockImplementation(async (_key, _ttl, fetcher) => fetcher());
            mockArticleRepository.findBySlug.mockResolvedValue(null);

            const result = await service.getBySlug("nonexistent");

            expect(result).toBeNull();
        });
    });

    describe("create", () => {
        it("creates an article and invalidates cache", async () => {
            mockArticleRepository.create.mockResolvedValue(MOCK_ARTICLE);

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

            expect(mockArticleRepository.create).toHaveBeenCalled();
            expect(mockCacheInvalidateTracked).toHaveBeenCalled();
            expect(result).toEqual(MOCK_ARTICLE);
        });
    });

    describe("update", () => {
        it("updates matching article and invalidates cache", async () => {
            const updated = { ...MOCK_ARTICLE, title: "Updated" };
            mockArticleRepository.findById.mockResolvedValue(MOCK_ARTICLE);
            mockArticleRepository.update.mockResolvedValue(updated);

            const result = await service.update(1, { title: "Updated" });

            expect(mockArticleRepository.update).toHaveBeenCalled();
            expect(mockCacheInvalidateTracked).toHaveBeenCalled();
            expect(result.title).toBe("Updated");
        });

        it("throws when article does not exist", async () => {
            mockArticleRepository.findById.mockResolvedValue(null);

            await expect(service.update(999, { title: "X" })).rejects.toThrow(
                "Article with id 999 not found"
            );
        });
    });

    describe("delete", () => {
        it("deletes article and invalidates cache", async () => {
            mockArticleRepository.findById.mockResolvedValue(MOCK_ARTICLE);
            mockArticleRepository.delete.mockResolvedValue(undefined);

            await service.delete(1);

            expect(mockArticleRepository.delete).toHaveBeenCalledWith(1);
            expect(mockCacheInvalidateTracked).toHaveBeenCalled();
            expect(mockCacheInvalidate).toHaveBeenCalledWith(expect.stringContaining("test-article"));
        });
    });

    describe("bulkDelete", () => {
        it("bulk deletes articles and invalidates cache", async () => {
            mockArticleRepository.findByIds.mockResolvedValue([MOCK_ARTICLE]);
            mockArticleRepository.bulkDelete.mockResolvedValue(undefined);

            await service.bulkDelete([1]);

            expect(mockArticleRepository.bulkDelete).toHaveBeenCalledWith([1]);
            expect(mockCacheInvalidateTracked).toHaveBeenCalled();
            expect(mockCacheInvalidate).toHaveBeenCalled();
        });
    });

    describe("incrementViewCount", () => {
        it("delegates to repository without touching cache", async () => {
            mockArticleRepository.incrementViewCount.mockResolvedValue(undefined);

            await service.incrementViewCount(1);

            expect(mockArticleRepository.incrementViewCount).toHaveBeenCalledWith(1);
            expect(mockCacheInvalidate).not.toHaveBeenCalled();
        });
    });
});
