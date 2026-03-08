import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock repository (hoisted) ----
const {
    mockFindAll, mockFindActive, mockFindById,
    mockCreate, mockUpdateCanvas, mockUpdateStatus, mockDelete,
} = vi.hoisted(() => ({
    mockFindAll: vi.fn(),
    mockFindActive: vi.fn(),
    mockFindById: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdateCanvas: vi.fn(),
    mockUpdateStatus: vi.fn(),
    mockDelete: vi.fn(),
}));

vi.mock("../repositories/sketchpad.repository.js", () => ({
    sketchpadRepository: {
        findAll: mockFindAll,
        findActive: mockFindActive,
        findById: mockFindById,
        create: mockCreate,
        updateCanvas: mockUpdateCanvas,
        updateStatus: mockUpdateStatus,
        delete: mockDelete,
    },
}));

import { SketchpadService } from "./sketchpad.service.js";

const MOCK_SESSION = {
    id: 1,
    title: "Sketch 1",
    canvasData: null,
    status: "active" as const,
    createdBy: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe("SketchpadService", () => {
    let service: SketchpadService;

    beforeEach(() => {
        service = new SketchpadService();
        vi.clearAllMocks();
    });

    describe("getAll", () => {
        it("returns all sessions from repository", async () => {
            mockFindAll.mockResolvedValue([MOCK_SESSION]);
            const result = await service.getAll();
            expect(mockFindAll).toHaveBeenCalled();
            expect(result).toEqual([MOCK_SESSION]);
        });
    });

    describe("getActive", () => {
        it("returns only active sessions", async () => {
            mockFindActive.mockResolvedValue([MOCK_SESSION]);
            const result = await service.getActive();
            expect(mockFindActive).toHaveBeenCalled();
            expect(result).toEqual([MOCK_SESSION]);
        });
    });

    describe("getById", () => {
        it("returns a session by ID", async () => {
            mockFindById.mockResolvedValue(MOCK_SESSION);
            const result = await service.getById(1);
            expect(mockFindById).toHaveBeenCalledWith(1);
            expect(result).toEqual(MOCK_SESSION);
        });

        it("returns null for non-existent ID", async () => {
            mockFindById.mockResolvedValue(null);
            const result = await service.getById(999);
            expect(result).toBeNull();
        });
    });

    describe("create", () => {
        it("creates a new session with title and createdBy", async () => {
            const data = { title: "New Sketch", createdBy: "user123" };
            mockCreate.mockResolvedValue({ ...MOCK_SESSION, ...data });
            const result = await service.create(data);
            expect(mockCreate).toHaveBeenCalledWith(data);
            expect(result.title).toBe("New Sketch");
        });

        it("creates a session with defaults when no data provided", async () => {
            mockCreate.mockResolvedValue(MOCK_SESSION);
            const result = await service.create({});
            expect(mockCreate).toHaveBeenCalledWith({});
            expect(result).toEqual(MOCK_SESSION);
        });
    });

    describe("saveCanvas", () => {
        it("saves canvas data for a session", async () => {
            const canvasData = { objects: [{ type: "rect", x: 0, y: 0 }] };
            const updated = { ...MOCK_SESSION, canvasData };
            mockUpdateCanvas.mockResolvedValue(updated);
            const result = await service.saveCanvas(1, canvasData);
            expect(mockUpdateCanvas).toHaveBeenCalledWith(1, canvasData);
            expect(result.canvasData).toEqual(canvasData);
        });
    });

    describe("archive", () => {
        it("sets status to archived", async () => {
            mockUpdateStatus.mockResolvedValue(undefined);
            await service.archive(1);
            expect(mockUpdateStatus).toHaveBeenCalledWith(1, "archived");
        });
    });

    describe("delete", () => {
        it("deletes a session by ID", async () => {
            mockDelete.mockResolvedValue(undefined);
            await service.delete(1);
            expect(mockDelete).toHaveBeenCalledWith(1);
        });
    });
});
