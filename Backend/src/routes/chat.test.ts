import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Hoisted mocks ----
const { mockRedisGet, mockRedisSetex, mockRedis, mockDbFrom } = vi.hoisted(() => {
    const mockRedisGet = vi.fn();
    const mockRedisSetex = vi.fn();
    const mockRedis = { get: mockRedisGet, setex: mockRedisSetex };
    const mockDbFrom = vi.fn();
    return { mockRedisGet, mockRedisSetex, mockRedis, mockDbFrom };
});

vi.mock("@portfolio/shared", () => ({
    articlesTable: "articles",
    projectsTable: "projects",
    skillsTable: "skills",
    experiencesTable: "experiences",
}));

vi.mock("../env.js", () => ({
    env: { OPENROUTER_API_KEY: "test-key" },
}));

vi.mock("express-rate-limit", () => ({
    default: () => (_req: any, _res: any, next: any) => next(),
}));

vi.mock("../middleware/validate.js", () => ({
    validateBody: () => (_req: any, _res: any, next: any) => next(),
}));

const { buildSystemPrompt, CHAT_CACHE_KEY } = await import("./chat.js");
const { db }: any = await import("../db.js");

describe("buildSystemPrompt", () => {
    const sampleSkills = [{ name: "TypeScript" }, { name: "React" }];
    const sampleProjects = [{ title: "Portfolio", description: "A portfolio site" }];
    const sampleExperiences = [{ role: "Engineer", organization: "Acme" }];
    const sampleArticles = [{ title: "Intro to TS" }];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("exports CHAT_CACHE_KEY as 'chat:system-prompt'", () => {
        expect(CHAT_CACHE_KEY).toBe("chat:system-prompt");
    });

    it("returns cached prompt on Redis hit without querying DB", async () => {
        const cachedPrompt = "cached system prompt text";
        mockRedisGet.mockResolvedValue(cachedPrompt);

        const result = await buildSystemPrompt();

        expect(result).toBe(cachedPrompt);
        expect(mockRedisGet).toHaveBeenCalledWith("chat:system-prompt");
        expect(db.select).not.toHaveBeenCalled();
    });

    it("queries DB and caches result on Redis miss", async () => {
        mockRedisGet.mockResolvedValue(null);
        mockRedisSetex.mockResolvedValue("OK");

        const mockQuery = db.select();
        // Since from() returns the same mock object, we can mock its resolve value
        (mockQuery.from as any).mockResolvedValueOnce(sampleArticles)
            .mockResolvedValueOnce(sampleProjects)
            .mockResolvedValueOnce(sampleSkills)
            .mockResolvedValueOnce(sampleExperiences);

        const result = await buildSystemPrompt();

        // Result contains prompt data
        expect(result).toContain("TypeScript");
        expect(result).toContain("Portfolio");
        expect(result).toContain("Engineer at Acme");
        expect(result).toContain("Intro to TS");
        // Cached with 15-min TTL
        expect(mockRedisSetex).toHaveBeenCalledWith("chat:system-prompt", 900, result);
    });

    it("falls back to DB when Redis.get throws", async () => {
        mockRedisGet.mockRejectedValue(new Error("Redis connection lost"));
        mockRedisSetex.mockRejectedValue(new Error("Redis connection lost"));

        const mockQuery = db.select();
        (mockQuery.from as any).mockResolvedValueOnce(sampleArticles)
            .mockResolvedValueOnce(sampleProjects)
            .mockResolvedValueOnce(sampleSkills)
            .mockResolvedValueOnce(sampleExperiences);

        // Should not throw despite Redis being down
        const result = await buildSystemPrompt();

        expect(result).toContain("TypeScript");
    });

    it("truncates long project descriptions to 200 chars", async () => {
        mockRedisGet.mockResolvedValue(null);
        mockRedisSetex.mockResolvedValue("OK");
        const longDesc = "A".repeat(300);

        const mockQuery = db.select();
        (mockQuery.from as any).mockResolvedValueOnce([])
            .mockResolvedValueOnce([{ title: "BigProject", description: longDesc }])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

        const result = await buildSystemPrompt();

        // Description should be truncated at 200 chars + "..."
        expect(result).toContain("BigProject");
        expect(result).not.toContain("A".repeat(300));
        expect(result).toContain("...");
    });
});
