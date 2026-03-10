import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../db.js";
import { createScopeWorker } from "./scope.worker.js";
import { scopeRepository } from "../repositories/scope.repository.js";
import { aiClient } from "../lib/ai.js";
import { Redis } from "ioredis";

vi.mock("../repositories/scope.repository.js", () => ({
    scopeRepository: {
        findById: vi.fn(),
        update: vi.fn(),
    },
}));

vi.mock("../lib/ai.js", () => ({
    aiClient: {
        generateJSON: vi.fn(),
    },
}));

// Mock BullMQ Worker - MUST be a function that can be used as a constructor
vi.mock("bullmq", () => {
    return {
        Worker: vi.fn().mockImplementation(function (this: any, name, processor) {
            this.on = vi.fn();
            this.processor = processor;
        }),
    };
});

// db mock is in setup.ts

describe("ScopeWorker", () => {
    let mockRedis: Redis;

    beforeEach(() => {
        mockRedis = {} as Redis;
        vi.clearAllMocks();
    });

    it("should create a worker and process jobs", async () => {
        const worker: any = createScopeWorker(mockRedis);
        expect(worker).toBeDefined();

        const mockRequest = {
            id: 1,
            name: "Test",
            projectType: "Web",
            description: "Desc",
            features: ["F1"]
        };
        vi.mocked(scopeRepository.findById).mockResolvedValue(mockRequest as any);
        vi.mocked(aiClient.generateJSON).mockResolvedValue({ summary: "Done" });

        // Simulate BullMQ job execution
        const mockJob = { id: "job1", data: { requestId: 1 } };

        await worker.processor(mockJob);

        expect(scopeRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({ status: "processing" }));
        expect(aiClient.generateJSON).toHaveBeenCalled();
        expect(scopeRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
            status: "completed",
            estimation: { summary: "Done" }
        }));
    });

    it("should handle failures", async () => {
        const worker: any = createScopeWorker(mockRedis);
        // Ensure all fields used in constructPrompt/sanitizeForPrompt are present
        const mockRequest = {
            id: 1,
            name: "Test",
            projectType: "Web",
            description: "Desc",
            features: ["F1"]
        };
        vi.mocked(scopeRepository.findById).mockResolvedValue(mockRequest as any);
        vi.mocked(aiClient.generateJSON).mockRejectedValue(new Error("AI error"));

        const mockJob = { id: "job1", data: { requestId: 1 } };
        await expect(worker.processor(mockJob)).rejects.toThrow("AI error");

        expect(scopeRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
            status: "failed",
            error: "AI error"
        }));
    });
});
