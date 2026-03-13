import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClientPortal } from "./ClientPortal";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "@/hooks/use-toast";

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
    toast: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe("ClientPortal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render login screen initially", () => {
        render(<ClientPortal />);
        expect(screen.getByText(/Client Portal/i)).toBeDefined();
        expect(screen.getByPlaceholderText(/Paste your token here/i)).toBeDefined();
    });

    it("should authenticate with valid token", async () => {
        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => ({
                success: true,
                data: {
                    client: { name: "John Doe", email: "john@example.com" },
                    projects: [{ id: 1, title: "Test Project", status: "in_progress" }]
                }
            })
        } as unknown as Response);

        render(<ClientPortal />);

        const input = screen.getByPlaceholderText(/Paste your token here/i);
        const button = screen.getByText(/Access Portal/i);

        fireEvent.change(input, { target: { value: "valid-token" } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/John Doe/i)).toBeDefined();
            expect(screen.getByText(/Test Project/i)).toBeDefined();
        });
        expect(toast).toHaveBeenCalledWith({ title: "Successfully logged in" });
    });

    it("should show error on invalid token", async () => {
        vi.mocked(global.fetch).mockResolvedValue({
            ok: false,
            status: 401
        } as unknown as Response);

        render(<ClientPortal />);

        fireEvent.change(screen.getByPlaceholderText(/Paste your token here/i), { target: { value: "invalid" } });
        fireEvent.click(screen.getByText(/Access Portal/i));

        await waitFor(() => {
            expect(toast).toHaveBeenCalledWith({ variant: "destructive", title: "Invalid or expired token" });
        });
    });
});
