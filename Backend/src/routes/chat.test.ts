import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../db.js";

// ---- Hoisted mocks ----
// We'll rely on global setup.ts but carefully override where needed

vi.mock("@portfolio/shared", () => ({
    articlesTable: "articles",
    projectsTable: "projects",
    skillsTable: "skills",
    experiencesTable: "experiences",
    siteSettingsTable: { personalName: "personalName" },
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

// Mock redis
const mockRedisGet = vi.fn();
const mockRedisSetex = vi.fn();
vi.mock("../lib/redis.js", () => ({
    redis: { get: (k: string) => mockRedisGet(k), setex: (k: string, t: number, v: string) => mockRedisSetex(k, t, v) }
}));

import { buildSystemPrompt, CHAT_CACHE_KEY } from "./chat.js";

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
        mockRedisGet.mockResolvedValue("cached system prompt text");

        const result = await buildSystemPrompt();

        expect(result).toBe("cached system prompt text");
        expect(mockRedisGet).toHaveBeenCalledWith("chat:system-prompt");
    });

    it("queries DB and caches result on Redis miss", async () => {
        mockRedisGet.mockResolvedValue(null);
        mockRedisSetex.mockResolvedValue("OK");

        vi.mocked(db.select)
            .mockReturnValueOnce({ from: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve(sampleArticles).then(f) } as any)
            .mockReturnValueOnce({ from: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve(sampleProjects).then(f) } as any)
            .mockReturnValueOnce({ from: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve(sampleSkills).then(f) } as any)
            .mockReturnValueOnce({ from: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve(sampleExperiences).then(f) } as any)
            .mockReturnValueOnce({ from: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve([{ personalName: "Abdhesh" }]).then(f) } as any);

        const result = await buildSystemPrompt();

        expect(result).toContain("TypeScript");
        expect(result).toContain("Portfolio");
        expect(result).toContain("Engineer at Acme");
        expect(result).toContain("Intro to TS");
        expect(mockRedisSetex).toHaveBeenCalledWith("chat:system-prompt", 900, result);
    });

    it("truncates long project descriptions to 200 chars", async () => {
        mockRedisGet.mockResolvedValue(null);
        const longDesc = "A".repeat(300);

        vi.mocked(db.select)
            .mockReturnValueOnce({ from: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve([]).then(f) } as any)
            .mockReturnValueOnce({ from: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve([{ title: "BigProject", description: longDesc }]).then(f) } as any)
            .mockReturnValueOnce({ from: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve([]).then(f) } as any)
            .mockReturnValueOnce({ from: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve([]).then(f) } as any)
            .mockReturnValueOnce({ from: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), then: (f: any) => Promise.resolve([{ personalName: "Abdhesh" }]).then(f) } as any);

        const result = await buildSystemPrompt();

        expect(result).toContain("BigProject");
        expect(result).not.toContain("A".repeat(300));
        expect(result).toContain("...");
    });
});
