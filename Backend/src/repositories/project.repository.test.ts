import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock drizzle db ----
vi.mock("../db.js", () => ({
    db: {
        select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            then: vi.fn(function (resolve) {
                return Promise.resolve([]).then(resolve);
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

vi.mock("@portfolio/shared", () => ({
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const selectMock = db.select() as any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vi.spyOn(selectMock, 'then').mockImplementation((resolve: any) => {
                if (resolve) resolve(mockProjects);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return Promise.resolve(mockProjects) as any;
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
            (db.delete as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
                where: vi.fn().mockResolvedValue(undefined),
            });

            await repo.bulkDelete([1, 2]);
            expect(db.delete).toHaveBeenCalled();
        });
    });
});
