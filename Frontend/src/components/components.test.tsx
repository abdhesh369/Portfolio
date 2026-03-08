import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClientPortal } from "./ClientPortal";
import { ScopeWizard } from "./ScopeWizard";
import { Sketchpad } from "./Sketchpad";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock providers and hooks
vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual as any,
        useQuery: vi.fn(() => ({ data: null, isLoading: true })),
        useMutation: vi.fn(() => ({ mutate: vi.fn() })),
    };
});

// Mock Framer Motion to avoid issues in test environment
vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    },
    m: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Canvas context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    scale: vi.fn(),
    arc: vi.fn(),
    strokeRect: vi.fn(),
})) as any;

const queryClient = new QueryClient();

describe("Frontend Components Sanity", () => {
    it("should render ClientPortal with key sections", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <ClientPortal />
            </QueryClientProvider>
        );
        expect(screen.getByText(/Client Portal/i)).toBeDefined();
        expect(screen.getByPlaceholderText(/Enter your access token/i)).toBeDefined();
    });

    it("should render ScopeWizard and allow navigation", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <ScopeWizard />
            </QueryClientProvider>
        );
        expect(screen.getByText(/Scope_Analyzer/i)).toBeDefined();
        expect(screen.getByText(/Project Identity/i)).toBeDefined();
    });

    it("should render Sketchpad with toolbar", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Sketchpad />
            </QueryClientProvider>
        );
        expect(screen.getByText(/Sketchpad/i)).toBeDefined();
        expect(screen.getByLabelText(/Drawing tools/i)).toBeDefined();
        expect(screen.getByLabelText(/Pen/i)).toBeDefined();
    });
});
