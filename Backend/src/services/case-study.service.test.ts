/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CaseStudyService } from "./case-study.service.js";
import { caseStudyRepository } from "../repositories/case-study.repository.js";
import { projectService } from "./project.service.js";

vi.mock("../repositories/case-study.repository.js", () => ({
    caseStudyRepository: {
        findAll: vi.fn(),
        findPublished: vi.fn(),
        findBySlug: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock("./project.service.js", () => ({
    projectService: {
        getById: vi.fn(),
    },
}));

// Mock global fetch for Gemini API
global.fetch = vi.fn();

describe("CaseStudyService", () => {
    let service: CaseStudyService;

    beforeEach(() => {
        service = new CaseStudyService();
        vi.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("getAll", () => {
        it("should call repository.findAll", async () => {
            const mockFindAll = vi.mocked(caseStudyRepository.findAll);
            mockFindAll.mockResolvedValue([]);
            await service.getAll();
            expect(mockFindAll).toHaveBeenCalled();
        });
    });

    describe("generate", () => {
        it("should throw if project not found", async () => {
            vi.mocked(projectService.getById).mockResolvedValue(null);
            await expect(service.generate(1)).rejects.toThrow("Project not found");
        });

        it("should call Gemini API and save result", async () => {
            const mockProject = { id: 1, title: "Test", description: "Desc", techStack: ["React"], category: "Web" } as any;
            vi.mocked(projectService.getById).mockResolvedValue(mockProject);

            vi.mocked(global.fetch).mockResolvedValue({
                ok: true,
                json: async () => ({
                    candidates: [{ content: { parts: [{ text: "Generated content" }] } }]
                })
            } as any);

            await service.generate(1);

            expect(global.fetch).toHaveBeenCalled();
            expect(caseStudyRepository.create).toHaveBeenCalled();
        });
    });
});
