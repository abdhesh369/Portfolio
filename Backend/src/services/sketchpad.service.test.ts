import { describe, it, expect, vi, beforeEach } from "vitest";
import { SketchpadService } from "./sketchpad.service.js";
import { sketchpadRepository } from "../repositories/sketchpad.repository.js";

vi.mock("../repositories/sketchpad.repository.js", () => ({
    sketchpadRepository: {
        findAll: vi.fn(),
        findActive: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        updateCanvas: vi.fn(),
        updateStatus: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("SketchpadService", () => {
    let service: SketchpadService;

    beforeEach(() => {
        service = new SketchpadService();
        vi.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("getAll", () => {
        it("should call repository.findAll", async () => {
            await service.getAll();
            expect(sketchpadRepository.findAll).toHaveBeenCalled();
        });
    });

    describe("saveCanvas", () => {
        it("should call repository.updateCanvas", async () => {
            const data = { objects: [] };
            await service.saveCanvas(1, data);
            expect(sketchpadRepository.updateCanvas).toHaveBeenCalledWith(1, data);
        });
    });

    describe("archive", () => {
        it("should update status to archived", async () => {
            await service.archive(1);
            expect(sketchpadRepository.updateStatus).toHaveBeenCalledWith(1, "archived");
        });
    });
});
