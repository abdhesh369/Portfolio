import { sketchpadRepository } from "../repositories/sketchpad.repository.js";
import type { SketchpadSession } from "@portfolio/shared";

export class SketchpadService {
    async getAll(): Promise<SketchpadSession[]> {
        return sketchpadRepository.findAll();
    }

    async getActive(): Promise<SketchpadSession[]> {
        return sketchpadRepository.findActive();
    }

    async getById(id: number): Promise<SketchpadSession | null> {
        return sketchpadRepository.findById(id);
    }

    async create(data: { title?: string; createdBy?: string }): Promise<SketchpadSession> {
        return sketchpadRepository.create(data);
    }

    async saveCanvas(id: number, canvasData: Record<string, unknown>): Promise<SketchpadSession> {
        return sketchpadRepository.updateCanvas(id, canvasData);
    }

    async archive(id: number): Promise<void> {
        return sketchpadRepository.updateStatus(id, "archived");
    }

    async delete(id: number): Promise<void> {
        return sketchpadRepository.delete(id);
    }
}

export const sketchpadService = new SketchpadService();
