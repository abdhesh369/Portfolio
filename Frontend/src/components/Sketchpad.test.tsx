/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { Sketchpad } from "./Sketchpad";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock canvas methods
const mockContext = {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    arc: vi.fn(),
    scale: vi.fn(),
};

describe("Sketchpad", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock getContext
        HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockContext);
    });

    it("should render controls and canvas", () => {
        render(<Sketchpad />);
        expect(screen.getByLabelText(/Pen/i)).toBeDefined();
        expect(screen.getByLabelText(/Eraser/i)).toBeDefined();
        expect(screen.getByRole("img", { hidden: true })).toBeDefined(); // Canvas usually doesn't have a role unless assigned
    });

    it("should switch tools", () => {
        render(<Sketchpad />);
        const eraserBtn = screen.getByLabelText(/Eraser/i);
        fireEvent.click(eraserBtn);
        // Tool state is internal, but we can check if it active style is applied if we have it
    });

    it("should clear elements on Reset", () => {
        render(<Sketchpad />);
        const resetBtn = screen.getByLabelText(/Reset Canvas/i);
        fireEvent.click(resetBtn);
        expect(mockContext.clearRect).toHaveBeenCalled();
    });
});
