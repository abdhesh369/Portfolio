import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CustomizationTab } from "./CustomizationTab";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/use-site-settings";
import React from "react";
import { UseQueryResult, UseMutationResult, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { SiteSettings, InsertSiteSettings } from "@portfolio/shared";
import { fireEvent, waitFor } from "@testing-library/react";

// Mock hooks
vi.mock("@/hooks/use-site-settings", () => ({
    useSiteSettings: vi.fn(),
    useUpdateSiteSettings: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
    useToast: vi.fn(() => ({ toast: vi.fn() })),
}));

// Mock sub-components to keep test focused on CustomizationTab logic
vi.mock("../customization/CustomizationHeader", () => ({
    CustomizationHeader: () => <div data-testid="header">Header</div>,
}));
vi.mock("../customization/PersonalBrandingSection", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PersonalBrandingSection: ({ register }: any) => (
        <div data-testid="personal">
            <input {...register("personalName")} data-testid="name-input" />
        </div>
    ),
}));
vi.mock("../customization/SocialPresenceSection", () => ({
    SocialPresenceSection: () => <div data-testid="social">Social</div>,
}));
vi.mock("../customization/HeroSection", () => ({
    HeroSection: () => <div data-testid="hero">Hero</div>,
}));
vi.mock("../customization/HeroCTASection", () => ({
    HeroCTASection: () => <div data-testid="ctas">CTAs</div>,
}));
vi.mock("../customization/NavbarSection", () => ({
    NavbarSection: () => <div data-testid="navbar">Navbar</div>,
}));
vi.mock("../customization/ThemeSection", () => ({
    ThemeSection: () => <div data-testid="theme">Theme</div>,
}));
vi.mock("../customization/FooterSection", () => ({
    FooterSection: () => <div data-testid="footer">Footer</div>,
}));
vi.mock("../customization/SectionLayoutSection", () => ({
    SectionLayoutSection: () => <div data-testid="sections">Sections</div>,
}));
vi.mock("../customization/ActiveFeaturesSection", () => ({
    ActiveFeaturesSection: () => <div data-testid="features">Features</div>,
}));
vi.mock("../customization/StickyFormFooter", () => ({
    StickyFormFooter: ({ isDirty }: { isDirty: boolean }) => (
        <div data-testid="sticky-footer">
            <button type="submit" disabled={!isDirty}>Save Changes</button>
        </div>
    ),
}));
vi.mock("@/components/admin/AdminShared", () => ({
    LoadingSkeleton: () => <div data-testid="loading">Loading...</div>,
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe("CustomizationTab", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading state", () => {
        vi.mocked(useSiteSettings).mockReturnValue({
            isLoading: true,
            isFetching: true,
        } as unknown as UseQueryResult<SiteSettings>);
        vi.mocked(useUpdateSiteSettings).mockReturnValue({
            mutateAsync: vi.fn(),
        } as unknown as UseMutationResult<SiteSettings, Error, InsertSiteSettings>);

        render(<CustomizationTab />, { wrapper: createWrapper() });
        expect(screen.getByTestId("loading")).toBeDefined();
    });

    it("renders form content when data is loaded", async () => {
        vi.mocked(useSiteSettings).mockReturnValue({
            isLoading: false,
            data: {
                isOpenToWork: true,
                personalName: "Test User",
                personalTitle: "Developer",
                sectionOrder: ["hero"],
                sectionVisibility: { hero: true },
            },
            isSuccess: true,
        } as unknown as UseQueryResult<SiteSettings>);
        vi.mocked(useUpdateSiteSettings).mockReturnValue({
            mutateAsync: vi.fn(),
        } as unknown as UseMutationResult<SiteSettings, Error, InsertSiteSettings>);

        render(<CustomizationTab />, { wrapper: createWrapper() });

        expect(screen.getByTestId("header")).toBeDefined();
        expect(screen.getByTestId("personal")).toBeDefined();
        expect(screen.getByTestId("sticky-footer")).toBeDefined();
    });

    it("handles form submission", async () => {
        const mutateAsync = vi.fn().mockResolvedValue({});
        vi.mocked(useSiteSettings).mockReturnValue({
            isLoading: false,
            data: {
                isOpenToWork: true,
                personalName: "Test User",
                sectionOrder: ["hero"],
                sectionVisibility: { hero: true },
            },
            isSuccess: true,
        } as unknown as UseQueryResult<SiteSettings>);
        vi.mocked(useUpdateSiteSettings).mockReturnValue({
            mutateAsync,
        } as unknown as UseMutationResult<SiteSettings, Error, InsertSiteSettings>);

        render(<CustomizationTab />, { wrapper: createWrapper() });

        // Dirty the form
        const input = screen.getByTestId("name-input");
        fireEvent.change(input, { target: { value: "New Name" } });

        // Simulate save
        const saveButton = screen.getByText(/Save Changes/i);
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalled();
        });
    });
});
