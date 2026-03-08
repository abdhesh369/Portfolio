import { describe, it, expect, vi, beforeEach } from "vitest";
import { CaseStudyService } from "./case-study.service.js";
import { caseStudyRepository } from "../repositories/case-study.repository.js";
import { projectService } from "./project.service.js";

// Mock dependencies
const mockCaseStudyRepo = vi.hoisted(() => ({
    findAll: vi.fn(),
    findPublished: vi.fn(),
    findBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}));

const mockProjectService = vi.hoisted(() => ({
    getById: vi.fn(),
}));

vi.mock("../repositories/case-study.repository.js", () => ({
    caseStudyRepository: mockCaseStudyRepo,
}));

vi.mock("./project.service.js", () => ({
    projectService: mockProjectService,
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("CaseStudyService", () => {
    let service: CaseStudyService;

    beforeEach(() => {
        service = new CaseStudyService();
        vi.clearAllMocks();
    });

    describe("getAll", () => {
        it("should return all case studies", async () => {
            const mockStudies = [{ id: 1, title: "Study 1" }];
            mockCaseStudyRepo.findAll.mockResolvedValue(mockStudies);
            const result = await service.getAll();
            expect(result).toEqual(mockStudies);
            expect(mockCaseStudyRepo.findAll).toHaveBeenCalled();
        });
    });

    describe("generate", () => {
        const mockProject = {
            id: 1,
            title: "Test Project",
            description: "A <script>alert(1)</script> project",
            techStack: ["React"],
            category: "Web",
        };

        it("should throw error if project not found", async () => {
            mockProjectService.getById.mockResolvedValue(null);
            await expect(service.generate(1)).rejects.toThrow("Project not found");
        });

        it("should generate a case study using Gemini API", async () => {
            mockProjectService.getById.mockResolvedValue(mockProject);
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    candidates: [{
                        content: { parts: [{ text: "Generated content" }] }
                    }]
                }),
            });
            mockCaseStudyRepo.create.mockImplementation((data) => ({ id: 1, ...data }));

            const result = await service.generate(1);

            expect(result.content).toBe("Generated content");
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("generativelanguage.googleapis.com"),
                expect.objectContaining({
                    method: "POST",
                    body: expect.stringContaining("Test Project"),
                })
            );
            // Verify sanitization
            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(body.contents[0].parts[0].text).not.toContain("<script>");
        });

        it("should handle Gemini API error", async () => {
            mockProjectService.getById.mockResolvedValue(mockProject);
            mockFetch.mockResolvedValue({ ok: false, status: 500 });

            await expect(service.generate(1)).rejects.toThrow("Gemini API error: 500");
        });
    });

    describe("CRUD", () => {
        it("should update a case study", async () => {
            mockCaseStudyRepo.update.mockResolvedValue({ id: 1, title: "Updated" });
            const result = await service.update(1, { title: "Updated" });
            expect(result.title).toBe("Updated");
            expect(mockCaseStudyRepo.update).toHaveBeenCalledWith(1, { title: "Updated" });
        });

        it("should delete a case study", async () => {
            mockCaseStudyRepo.delete.mockResolvedValue(undefined);
            await service.delete(1);
            expect(mockCaseStudyRepo.delete).toHaveBeenCalledWith(1);
        });
    });
});
