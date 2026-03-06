import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock dependencies ----
const {
    mockGetSettings, mockUpdateSettings,
} = vi.hoisted(() => ({
    mockGetSettings: vi.fn(),
    mockUpdateSettings: vi.fn(),
}));

vi.mock("../repositories/settings.repository.js", () => ({
    settingsRepository: {
        getSettings: mockGetSettings,
        updateSettings: mockUpdateSettings,
    },
}));

const {
    mockCacheGetOrSet, mockCacheInvalidate, mockCacheKey,
} = vi.hoisted(() => ({
    mockCacheGetOrSet: vi.fn(),
    mockCacheInvalidate: vi.fn(),
    mockCacheKey: vi.fn().mockImplementation((f, n) => `${f}:${n}`),
}));

vi.mock("../lib/cache.js", () => ({
    CacheService: {
        getOrSet: mockCacheGetOrSet,
        invalidate: mockCacheInvalidate,
        key: mockCacheKey,
    },
}));

import { SettingsService } from "./settings.service.js";

describe("SettingsService", () => {
    let service: SettingsService;

    beforeEach(() => {
        service = new SettingsService();
        vi.clearAllMocks();
    });

    describe("getSettings", () => {
        it("returns settings from cache", async () => {
            const mockSettings = { id: 1, isOpenToWork: true };
            mockCacheGetOrSet.mockResolvedValue(mockSettings);

            const result = await service.getSettings();

            expect(result).toEqual(mockSettings);
            expect(mockCacheGetOrSet).toHaveBeenCalled();
        });

        it("initializes with defaults if no settings found in DB", async () => {
            mockCacheGetOrSet.mockImplementation(async (key, ttl, fetcher) => {
                return await fetcher();
            });
            mockGetSettings.mockResolvedValue(null);
            mockUpdateSettings.mockResolvedValue({ id: 1, isOpenToWork: true });

            const result = await service.getSettings();

            expect(mockGetSettings).toHaveBeenCalled();
            expect(mockUpdateSettings).toHaveBeenCalledWith({ isOpenToWork: true });
            expect(result).toEqual({ id: 1, isOpenToWork: true });
        });
    });

    describe("updateSettings", () => {
        it("updates settings and invalidates cache", async () => {
            const data = { isOpenToWork: false };
            const updated = { id: 1, ...data };
            mockUpdateSettings.mockResolvedValue(updated);

            const result = await service.updateSettings(data as unknown as Parameters<typeof service.updateSettings>[0]);

            expect(result).toEqual(updated);
            expect(mockUpdateSettings).toHaveBeenCalledWith(data);
            expect(mockCacheInvalidate).toHaveBeenCalledWith("site:settings");
        });
    });
});
