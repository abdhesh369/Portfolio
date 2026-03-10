import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../db.js";

const {
    mockFindAll, mockFindById, mockCreate, mockUpdate, mockDelete,
} = vi.hoisted(() => ({
    mockFindAll: vi.fn(),
    mockFindById: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
}));

vi.mock("../repositories/experience.repository.js", () => ({
    experienceRepository: {
        findAll: mockFindAll,
        findById: mockFindById,
        create: mockCreate,
        update: mockUpdate,
        delete: mockDelete,
    },
}));

const { mockCacheGetOrSet, mockCacheGet, mockCacheSet, mockCacheInvalidate, mockCacheKey } = vi.hoisted(() => ({
    mockCacheGetOrSet: vi.fn(),
    mockCacheGet: vi.fn(),
    mockCacheSet: vi.fn(),
    mockCacheInvalidate: vi.fn(),
    mockCacheKey: vi.fn().mockImplementation((f: string, n: string, id?: string | number) =>
        id !== undefined ? `${f}:${n}:${id}` : `${f}:${n}`
    ),
}));

vi.mock("../lib/cache.js", () => ({
    CacheService: {
        getOrSet: mockCacheGetOrSet,
        get: mockCacheGet,
        set: mockCacheSet,
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

vi.mock("../routes/chat.js", () => ({ CHAT_CACHE_KEY: "chat:context" }));

import { ExperienceService } from "./experience.service.js";
import type { Experience } from "@portfolio/shared";

const MOCK_EXP: Experience = {
    id: 1,
    organization: "ACME Corp",
    role: "Engineer",
    description: "Built things",
    type: "Full-time",
    startDate: new Date("2022-01-01"),
    endDate: new Date("2024-01-01"),
    techStack: ["TypeScript"],
    displayOrder: 1,
} as any;

describe("ExperienceService", () => {
    let service: ExperienceService;

    beforeEach(() => {
        service = new ExperienceService();
        vi.clearAllMocks();
    });

    describe("getAll", () => {
        it("fetches experiences and caches them on hit", async () => {
            mockCacheGetOrSet.mockResolvedValue([MOCK_EXP]);
            const result = await service.getAll();
            expect(result).toEqual([MOCK_EXP]);
            expect(mockCacheGetOrSet).toHaveBeenCalled();
            expect(db.select).not.toHaveBeenCalled();
        });

        it("queries DB on cache miss", async () => {
            mockCacheGetOrSet.mockImplementation(async (_key: string, _ttl: number, cb: () => any) => {
                return await cb();
            });

            (db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockReturnValue({
                        execute: vi.fn().mockResolvedValueOnce([MOCK_EXP])
                    })
                })
            });

            const result = await service.getAll();
            expect(result).toEqual([MOCK_EXP]);
            expect(db.select).toHaveBeenCalled();
        });
    });

    describe("getById", () => {
        it("returns experience from cache when available", async () => {
            mockCacheGet.mockResolvedValue(MOCK_EXP);
            const result = await service.getById(1);
            expect(result).toEqual(MOCK_EXP);
            expect(mockFindById).not.toHaveBeenCalled();
        });

        it("fetches from repository and caches on cache miss", async () => {
            mockCacheGetOrSet.mockImplementation(async (_key: string, _ttl: number, fallback: any) => fallback());
            mockFindById.mockResolvedValue(MOCK_EXP);
            const result = await service.getById(1);
            expect(mockFindById).toHaveBeenCalledWith(1);
            expect(result).toEqual(MOCK_EXP);
        });

        it("returns null for non-existent id", async () => {
            mockCacheGet.mockResolvedValue(null);
            mockFindById.mockResolvedValue(null);
            const result = await service.getById(999);
            expect(result).toBeNull();
        });
    });

    describe("create", () => {
        it("creates experience and invalidates cache", async () => {
            const input = { organization: "New", role: "Dev", startDate: new Date() } as any;
            mockCreate.mockResolvedValue(MOCK_EXP);
            const result = await service.create(input);
            expect(mockCacheInvalidate).toHaveBeenCalled();
            expect(result).toEqual(MOCK_EXP);
        });
    });

    describe("update", () => {
        it("updates experience and invalidates cache", async () => {
            const updated = { ...MOCK_EXP, role: "Senior Engineer" };
            mockUpdate.mockResolvedValue(updated);
            const result = await service.update(1, { role: "Senior Engineer" });
            expect(mockUpdate).toHaveBeenCalledWith(1, { role: "Senior Engineer" });
            expect(mockCacheInvalidate).toHaveBeenCalled();
            expect(result.role).toBe("Senior Engineer");
        });
    });

    describe("delete", () => {
        it("deletes experience and invalidates cache", async () => {
            mockDelete.mockResolvedValue(undefined);
            await service.delete(1);
            expect(mockDelete).toHaveBeenCalledWith(1);
            expect(mockCacheInvalidate).toHaveBeenCalled();
        });
    });
});
