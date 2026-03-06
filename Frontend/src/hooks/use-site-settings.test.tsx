import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSiteSettings, useUpdateSiteSettings } from "./use-site-settings";
import { apiFetch } from "@/lib/api-helpers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock apiFetch
vi.mock("@/lib/api-helpers", () => ({
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
        expect(apiFetch).toHaveBeenCalledWith("/api/v1/settings");
    });

    it("updates site settings correctly", async () => {
        const mockSettings = { isOpenToWork: false };
        vi.mocked(apiFetch).mockResolvedValueOnce(mockSettings);

        const { result } = renderHook(() => useUpdateSiteSettings(), {
            wrapper: createWrapper(),
        });

        await result.current.mutateAsync(mockSettings as any);

        expect(apiFetch).toHaveBeenCalledWith("/api/v1/settings", {
            method: "PATCH",
            body: JSON.stringify(mockSettings),
        });
    });
});
