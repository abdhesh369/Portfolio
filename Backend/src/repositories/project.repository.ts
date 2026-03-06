import { eq, asc, inArray, sql, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { db } from "../db.js";
import { projectsTable, type Project, type InsertProject } from "../../shared/schema.js";

type DbProject = InferSelectModel<typeof projectsTable>;
type DbInsertProject = InferInsertModel<typeof projectsTable>;

export class ProjectRepository {
    private transformProject(project: DbProject): Project {
        return {
            ...project,
            techStack: (project.techStack as string[]) || [],
            githubUrl: project.githubUrl ?? null,
            liveUrl: project.liveUrl ?? null,
            problemStatement: project.problemStatement ?? null,
            motivation: project.motivation ?? null,
            systemDesign: project.systemDesign ?? null,
            challenges: project.challenges ?? null,
            learnings: project.learnings ?? null,
            impact: project.impact ?? null,
            role: project.role ?? null,
            imageAlt: project.imageAlt ?? null,
        };
    }

    /** Public: returns only visible (non-hidden) projects */
    async findAll(): Promise<Project[]> {
        const results = await db.select().from(projectsTable)
            .where(eq(projectsTable.isHidden, false))
            .orderBy(asc(projectsTable.displayOrder));
        return results.map(p => this.transformProject(p));
    }

    /** Admin: returns ALL projects including hidden ones */
    async findAllAdmin(): Promise<Project[]> {
        const results = await db.select().from(projectsTable)
            .orderBy(asc(projectsTable.displayOrder));
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

    async create(data: InsertProject): Promise<Project> {
        const articleData: DbInsertProject = {
            ...data,
            githubUrl: data.githubUrl ?? null,
            liveUrl: data.liveUrl ?? null,
            problemStatement: data.problemStatement ?? null,
            motivation: data.motivation ?? null,
            systemDesign: data.systemDesign ?? null,
            challenges: data.challenges ?? null,
            learnings: data.learnings ?? null,
            impact: data.impact ?? null,
            role: data.role ?? null,
            imageAlt: data.imageAlt ?? null,
        };

        const [inserted] = await db
            .insert(projectsTable)
            .values(articleData)
            .returning();
        if (!inserted) throw new Error("Failed to create project");
        return this.transformProject(inserted);
    }

    async update(id: number, data: Partial<InsertProject>): Promise<Project> {
        const articleData: Partial<DbInsertProject> = {
            ...data,
            githubUrl: data.githubUrl ?? undefined,
            liveUrl: data.liveUrl ?? undefined,
            problemStatement: data.problemStatement ?? undefined,
            motivation: data.motivation ?? undefined,
            systemDesign: data.systemDesign ?? undefined,
            challenges: data.challenges ?? undefined,
            learnings: data.learnings ?? undefined,
            impact: data.impact ?? undefined,
            role: data.role ?? undefined,
            imageAlt: data.imageAlt ?? undefined,
        };

        const [updated] = await db
            .update(projectsTable)
            .set(articleData)
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

    async bulkUpdateStatus(ids: number[], status: DbProject["status"]): Promise<void> {
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
