import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock drizzle db ----
vi.mock("../db.js", () => ({
    db: {
        select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue([]),
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([]),
                }),
            }),
        }),
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([]),
            }),
        }),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([]),
                }),
            }),
        }),
        delete: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
        }),
    },
}));

vi.mock("../../shared/schema.js", () => ({
    projectsTable: { id: "id", displayOrder: "displayOrder", status: "status" },
}));

vi.mock("drizzle-orm", () => ({
    eq: vi.fn((col, val) => ({ col, val })),
    desc: vi.fn((col) => ({ col })),
    asc: vi.fn((col) => ({ col })),
    inArray: vi.fn((col, vals) => ({ col, vals })),
    sql: Object.assign(vi.fn(), { raw: vi.fn() }),
}));

import { ProjectRepository } from "../repositories/project.repository.js";

describe("ProjectRepository", () => {
    let repo: ProjectRepository;

    beforeEach(() => {
        repo = new ProjectRepository();
        vi.clearAllMocks();
    });

    describe("findAll", () => {
        it("returns transformed projects", async () => {
            const mockProjects = [
                { id: 1, title: "Project 1", techStack: '["React"]', displayOrder: 0 },
            ];

            const { db } = await import("../db.js");
            (db.select as any).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockResolvedValue(mockProjects),
                    }),
                }),
            });

            const result = await repo.findAll();
            expect(result).toHaveLength(1);
        });
    });

    describe("bulkDelete", () => {
        it("does nothing with empty ids array", async () => {
            const { db } = await import("../db.js");
            await repo.bulkDelete([]);
            expect(db.delete).not.toHaveBeenCalled();
        });

        it("calls delete for given ids", async () => {
            const { db } = await import("../db.js");
            (db.delete as any).mockReturnValueOnce({
                where: vi.fn().mockResolvedValue(undefined),
            });

            await repo.bulkDelete([1, 2]);
            expect(db.delete).toHaveBeenCalled();
        });
    });
});
