import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClientPortal } from "./ClientPortal";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "react-hot-toast";

// Mock toast
vi.mock("react-hot-toast", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock fetch
global.fetch = vi.fn();

describe("ClientPortal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render login screen initially", () => {
        render(<ClientPortal />);
        expect(screen.getByText(/Client Collaboration Portal/i)).toBeDefined();
        expect(screen.getByPlaceholderText(/Enter your secure access token/i)).toBeDefined();
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

        const input = screen.getByPlaceholderText(/Enter your secure access token/i);
        const button = screen.getByText(/Access Portal/i);

        fireEvent.change(input, { target: { value: "valid-token" } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/John Doe/i)).toBeDefined();
            expect(screen.getByText(/Test Project/i)).toBeDefined();
        });
        expect(toast.success).toHaveBeenCalledWith("Successfully logged in");
    });

    it("should show error on invalid token", async () => {
        vi.mocked(global.fetch).mockResolvedValue({
            ok: false,
            status: 401
        } as unknown as Response);

        render(<ClientPortal />);

        fireEvent.change(screen.getByPlaceholderText(/Enter your secure access token/i), { target: { value: "invalid" } });
        fireEvent.click(screen.getByText(/Access Portal/i));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Invalid or expired token");
        });
    });
});
