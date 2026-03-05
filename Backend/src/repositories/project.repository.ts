import { eq, asc, inArray, sql } from "drizzle-orm";
import { db } from "../db.js";
import { projectsTable, type Project, type InsertProject } from "../../shared/schema.js";

export class ProjectRepository {
    private transformProject(project: any): Project {
        return {
            ...project,
            techStack: (project.techStack as string[]) || [],
        };
    }

    async findAll(): Promise<Project[]> {
        const results = await db.select().from(projectsTable).orderBy(asc(projectsTable.displayOrder));
        return results.map(p => this.transformProject(p));
    }

    async findById(id: number): Promise<Project | null> {
        const [result] = await db
            .select()
            .from(projectsTable)
            .where(eq(projectsTable.id, id))
            .limit(1);
        return result ? this.transformProject(result) : null;
    }

    async create(project: InsertProject): Promise<Project> {
        const [inserted] = await db
            .insert(projectsTable)
            .values(project)
            .returning();
        if (!inserted) throw new Error("Failed to create project");
        return this.transformProject(inserted);
    }

    async update(id: number, project: Partial<InsertProject>): Promise<Project> {
        const [updated] = await db
            .update(projectsTable)
            .set(project)
            .where(eq(projectsTable.id, id))
            .returning();
        if (!updated) throw new Error(`Project with id ${id} not found`);
        return this.transformProject(updated);
    }

    async delete(id: number): Promise<void> {
        await db.delete(projectsTable).where(eq(projectsTable.id, id));
    }

    async reorder(orderedIds: number[]): Promise<void> {
        await db.transaction(async (tx) => {
            for (let index = 0; index < orderedIds.length; index++) {
                await tx
                    .update(projectsTable)
                    .set({ displayOrder: index })
                    .where(eq(projectsTable.id, orderedIds[index]));
            }
        });
    }

    async bulkDelete(ids: number[]): Promise<void> {
        if (ids.length === 0) return;
        await db.delete(projectsTable).where(inArray(projectsTable.id, ids));
    }

    async bulkUpdateStatus(ids: number[], status: string): Promise<void> {
        if (ids.length === 0) return;
        await db.update(projectsTable).set({ status }).where(inArray(projectsTable.id, ids));
    }

    async incrementViewCount(id: number): Promise<void> {
        await db.update(projectsTable)
            .set({ viewCount: sql`${projectsTable.viewCount} + 1` })
            .where(eq(projectsTable.id, id));
    }
}

export const projectRepository = new ProjectRepository();
