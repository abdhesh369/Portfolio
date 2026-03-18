/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
// ---- Mock dependencies ----
const {
    mockFindAll, mockFindById, mockCreate, mockUpdate,
    mockDelete, mockBulkDelete, mockBulkUpdateStatus,
    mockReorder, mockIncrementViewCount,
} = vi.hoisted(() => ({
    mockFindAll: vi.fn(),
    mockFindById: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
    mockBulkDelete: vi.fn(),
    mockBulkUpdateStatus: vi.fn(),
    mockReorder: vi.fn(),
    mockIncrementViewCount: vi.fn(),
}));

vi.mock("../repositories/project.repository.js", () => ({
    projectRepository: {
        findAll: mockFindAll,
        findById: mockFindById,
        create: mockCreate,
        update: mockUpdate,
        delete: mockDelete,
        bulkDelete: mockBulkDelete,
        bulkUpdateStatus: mockBulkUpdateStatus,
        reorder: mockReorder,
        incrementViewCount: mockIncrementViewCount,
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

vi.mock("../lib/redis.js", () => ({ redis: null }));
vi.mock("../routes/chat.js", () => ({ CHAT_CACHE_KEY: "chat:context" }));

import { ProjectService } from "./project.service.js";
import type { Project } from "@portfolio/shared";

const MOCK_PROJECT = {
    id: 1,
    title: "Test Project",
    description: "A test project",
    techStack: ["TypeScript", "React"],
    imageUrl: "https://example.com/img.png",
    category: "web",
    status: "Completed",
    displayOrder: 1,
    githubUrl: null,
    liveUrl: null,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
} as any as Project;

describe("ProjectService", () => {
    let service: ProjectService;

    beforeEach(() => {
        service = new ProjectService();
        vi.clearAllMocks();
    });

    describe("getAll", () => {
        it("returns projects from cache", async () => {
            mockCacheGetOrSet.mockResolvedValue([MOCK_PROJECT]);

            const result = await service.getAll();

            expect(result).toEqual([MOCK_PROJECT]);
            expect(mockCacheGetOrSet).toHaveBeenCalledWith(
                expect.any(String),
                3600,
                expect.any(Function)
            );
        });

        it("calls repository when cache misses", async () => {
            mockCacheGetOrSet.mockImplementation(async (_key: string, _ttl: number, fetcher: () => Promise<unknown>) => fetcher());
            mockFindAll.mockResolvedValue([MOCK_PROJECT]);

            const result = await service.getAll();

            expect(mockFindAll).toHaveBeenCalledOnce();
            expect(result).toEqual([MOCK_PROJECT]);
        });
    });

    describe("getById", () => {
        it("returns project by id", async () => {
            mockFindById.mockResolvedValue(MOCK_PROJECT);

            const result = await service.getById(1);

            expect(mockFindById).toHaveBeenCalledWith(1);
            expect(result).toEqual(MOCK_PROJECT);
        });

        it("returns null when project does not exist", async () => {
            mockFindById.mockResolvedValue(null);

            const result = await service.getById(999);

            expect(result).toBeNull();
        });
    });

    describe("create", () => {
        it("creates a project and invalidates cache", async () => {
            mockCreate.mockResolvedValue(MOCK_PROJECT);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, createdAt: _ca, updatedAt: _ua, viewCount: _vc, ...insertData } = MOCK_PROJECT;
            const result = await service.create(insertData);

            expect(mockCreate).toHaveBeenCalledWith(insertData);
            expect(mockCacheInvalidate).toHaveBeenCalled();
            expect(result).toEqual(MOCK_PROJECT);
        });
    });

    describe("update", () => {
        it("updates a project and invalidates cache", async () => {
            const updated = { ...MOCK_PROJECT, title: "Updated" };
            mockUpdate.mockResolvedValue(updated);

            const result = await service.update(1, { title: "Updated" });

            expect(mockUpdate).toHaveBeenCalledWith(1, { title: "Updated" });
            expect(mockCacheInvalidate).toHaveBeenCalled();
            expect(result.title).toBe("Updated");
        });
    });

    describe("delete", () => {
        it("deletes a project and invalidates cache", async () => {
            mockDelete.mockResolvedValue(undefined);

            await service.delete(1);

            expect(mockDelete).toHaveBeenCalledWith(1);
            expect(mockCacheInvalidate).toHaveBeenCalled();
        });
    });

    describe("bulkDelete", () => {
        it("bulk deletes projects and invalidates cache", async () => {
            mockBulkDelete.mockResolvedValue(undefined);

            await service.bulkDelete([1, 2, 3]);

            expect(mockBulkDelete).toHaveBeenCalledWith([1, 2, 3]);
            expect(mockCacheInvalidate).toHaveBeenCalled();
        });
    });

    describe("bulkUpdateStatus", () => {
        it("bulk updates status and invalidates cache", async () => {
            mockBulkUpdateStatus.mockResolvedValue(undefined);

            await service.bulkUpdateStatus([1, 2], "Completed");

            expect(mockBulkUpdateStatus).toHaveBeenCalledWith([1, 2], "published");
            expect(mockCacheInvalidate).toHaveBeenCalled();
        });
    });

    describe("updateReorder", () => {
        it("reorders projects and invalidates cache", async () => {
            mockReorder.mockResolvedValue(undefined);

            await service.updateReorder([3, 1, 2]);

            expect(mockReorder).toHaveBeenCalledWith([3, 1, 2]);
            expect(mockCacheInvalidate).toHaveBeenCalled();
        });
    });

    describe("incrementViewCount", () => {
        it("increments view count without touching cache", async () => {
            mockIncrementViewCount.mockResolvedValue(undefined);

            await service.incrementViewCount(1);

            expect(mockIncrementViewCount).toHaveBeenCalledWith(1);
            expect(mockCacheInvalidate).not.toHaveBeenCalled();
        });
    });
});
