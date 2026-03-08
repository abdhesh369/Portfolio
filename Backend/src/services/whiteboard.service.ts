import { whiteboardRepository } from "../repositories/whiteboard.repository.js";
import type { WhiteboardSession } from "@portfolio/shared";

export class WhiteboardService {
    async getAll(): Promise<WhiteboardSession[]> {
        return whiteboardRepository.findAll();
    }

    async getActive(): Promise<WhiteboardSession[]> {
        return whiteboardRepository.findActive();
    }

    async getById(id: number): Promise<WhiteboardSession | null> {
        return whiteboardRepository.findById(id);
    }

    async create(data: { title?: string; createdBy?: string }): Promise<WhiteboardSession> {
        return whiteboardRepository.create(data);
    }

    async saveCanvas(id: number, canvasData: Record<string, unknown>): Promise<WhiteboardSession> {
        return whiteboardRepository.updateCanvas(id, canvasData);
    }

    async archive(id: number): Promise<void> {
        return whiteboardRepository.updateStatus(id, "archived");
    }

    async delete(id: number): Promise<void> {
        return whiteboardRepository.delete(id);
    }
}

export const whiteboardService = new WhiteboardService();
