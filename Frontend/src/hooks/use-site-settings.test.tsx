import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSiteSettings, useUpdateSiteSettings } from "./use-site-settings";
import { apiFetch } from "#src/lib/api-helpers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import type { InsertSiteSettings } from "#shared";

// Mock apiFetch
vi.mock("#src/lib/api-helpers", () => ({
    apiFetch: vi.fn(),
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe("useSiteSettings hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("fetches site settings correctly", async () => {
        const mockSettings = { isOpenToWork: true, sectionOrder: ["hero", "projects"] };
        vi.mocked(apiFetch).mockResolvedValueOnce(mockSettings);

        const { result } = renderHook(() => useSiteSettings(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(mockSettings);
        expect(apiFetch).toHaveBeenCalledWith(
            "/api/v1/settings",
            expect.any(Object),
            expect.any(Object)
        );
    });

    it("updates site settings correctly", async () => {
        const mockSettings: InsertSiteSettings = { isOpenToWork: false };
        vi.mocked(apiFetch).mockResolvedValueOnce(mockSettings);

        const { result } = renderHook(() => useUpdateSiteSettings(), {
            wrapper: createWrapper(),
        });

        await result.current.mutateAsync(mockSettings);

        expect(apiFetch).toHaveBeenCalledWith("/api/v1/settings", {
            method: "PATCH",
            body: JSON.stringify(mockSettings),
        });
    });

    it("handles 500 server error when fetching settings", async () => {
        vi.mocked(apiFetch).mockRejectedValueOnce(new Error("Internal Server Error"));

        const { result } = renderHook(() => useSiteSettings(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toBeInstanceOf(Error);
        expect((result.current.error as Error).message).toBe("Internal Server Error");
    });

    it("handles update failure correctly", async () => {
        vi.mocked(apiFetch).mockRejectedValueOnce(new Error("Update failed"));

        const { result } = renderHook(() => useUpdateSiteSettings(), {
            wrapper: createWrapper(),
        });

        await expect(result.current.mutateAsync({ isOpenToWork: false })).rejects.toThrow("Update failed");
    });
});
