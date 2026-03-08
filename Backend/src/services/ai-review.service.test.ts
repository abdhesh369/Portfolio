import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIReviewService } from "./ai-review.service.js";

// ---- Mock dependencies ----
const {
    mockFindByProjectId, mockCreate, mockUpdateStatus
} = vi.hoisted(() => ({
    mockFindByProjectId: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdateStatus: vi.fn(),
}));

vi.mock("../repositories/code-review.repository.js", () => ({
    codeReviewRepository: {
        findByProjectId: mockFindByProjectId,
        create: mockCreate,
        updateStatus: mockUpdateStatus,
    },
}));

const { mockGetProjectById } = vi.hoisted(() => ({
    mockGetProjectById: vi.fn(),
}));

vi.mock("./project.service.js", () => ({
    projectService: {
        getById: mockGetProjectById,
    },
}));

vi.mock("../env.js", () => ({
    env: {
        GEMINI_API_KEY: "test-api-key",
    },
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("AIReviewService", () => {
    let service: AIReviewService;

    beforeEach(() => {
        service = new AIReviewService();
        vi.clearAllMocks();
    });

    describe("triggerReview", () => {
        it("creates pending review and returns it", async () => {
            const mockProject = { id: 1, title: "Test", description: "Desc", techStack: ["TS"], githubUrl: null };
            mockGetProjectById.mockResolvedValue(mockProject);
            const mockReview = { id: 123, projectId: 1, status: "processing", content: "", badges: [] };
            mockCreate.mockResolvedValue(mockReview);

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    candidates: [{
                        content: {
                            parts: [{ text: "Good project." }]
                        }
                    }]
                })
            });

            const result = await service.triggerReview(1);

            expect(mockGetProjectById).toHaveBeenCalledWith(1);
            expect(mockCreate).toHaveBeenCalledWith({
                projectId: 1,
                content: "",
                badges: [],
                status: "processing",
            });
            expect(result).toEqual(mockReview);
        });

        it("throws error if project not found", async () => {
            mockGetProjectById.mockResolvedValue(null);
            await expect(service.triggerReview(999)).rejects.toThrow("Project not found");
        });
    });

    it("eventually updates review status to completed", async () => {
        const mockProject = { id: 1, title: "Test", description: "Desc", techStack: ["TS"], githubUrl: null };
        mockGetProjectById.mockResolvedValue(mockProject);
        const mockReview = { id: 123, projectId: 1, status: "processing" };
        mockCreate.mockResolvedValue(mockReview);

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                candidates: [{
                    content: {
                        parts: [{ text: "Security and performance are great." }]
                    }
                }]
            })
        });

        await service.triggerReview(1);

        await vi.waitUntil(() => mockUpdateStatus.mock.calls.length > 0, { timeout: 1000 });

        expect(mockUpdateStatus).toHaveBeenCalledWith(
            123,
            "completed",
            expect.stringContaining("Security"),
            expect.arrayContaining(["security", "performance"])
        );
    });

    it("updates review status to failed if API fails", async () => {
        const mockProject = { id: 1, title: "Test", description: "Desc", techStack: ["TS"], githubUrl: null };
        mockGetProjectById.mockResolvedValue(mockProject);
        const mockReview = { id: 123, projectId: 1, status: "processing" };
        mockCreate.mockResolvedValue(mockReview);

        mockFetch.mockResolvedValue({
            ok: false,
            status: 500
        });

        await service.triggerReview(1);

        await vi.waitUntil(() => mockUpdateStatus.mock.calls.length > 0, { timeout: 1000 });

        expect(mockUpdateStatus).toHaveBeenCalledWith(
            123,
            "failed",
            undefined,
            undefined,
            expect.stringContaining("500")
        );
    });
});
