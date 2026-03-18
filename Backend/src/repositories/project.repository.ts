import { eq, asc, desc, inArray, sql, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { db } from "../db.js";
import { projectsTable, type Project, type InsertProject } from "@portfolio/shared";

type DbProject = InferSelectModel<typeof projectsTable>;
type DbInsertProject = InferInsertModel<typeof projectsTable>;

export class ProjectRepository {
    private transformProject(project: DbProject): Project {
        return {
            ...project,
            techStack: project.techStack || [],
        } as Project;
    }

    /** Public: returns only visible (non-hidden) projects */
    async findAll(sortBy: 'views' | 'default' = 'default', limit: number = 50, offset: number = 0): Promise<Project[]> {
        const query = db.select().from(projectsTable)
            .where(eq(projectsTable.isHidden, false));

        if (sortBy === 'views') {
            query.orderBy(desc(projectsTable.viewCount));
        } else {
            query.orderBy(asc(projectsTable.displayOrder));
        }

        const results = await query.limit(limit).offset(offset);
        return results.map(p => this.transformProject(p as DbProject));
    }

    /** Admin: returns ALL projects including hidden ones */
    async findAllAdmin(limit: number = 100, offset: number = 0): Promise<Project[]> {
        const results = await db.select().from(projectsTable)
            .orderBy(asc(projectsTable.displayOrder))
            .limit(limit)
            .offset(offset);
        return results.map(p => this.transformProject(p));
    }

    async findById(id: number): Promise<Project | null> {
        const [result] = await db
            .select()
            .from(projectsTable)
            .where(eq(projectsTable.id, id))
            .limit(1);
        return result ? this.transformProject(result as DbProject) : null;
    }

    async findBySlug(slug: string): Promise<Project | null> {
        const [result] = await db
            .select()
            .from(projectsTable)
            .where(eq(projectsTable.slug, slug))
            .limit(1);
        return result ? this.transformProject(result as DbProject) : null;
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
            summary: data.summary ?? null,
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
            ...(data.githubUrl !== undefined && { githubUrl: data.githubUrl }),
            ...(data.liveUrl !== undefined && { liveUrl: data.liveUrl }),
            ...(data.problemStatement !== undefined && { problemStatement: data.problemStatement }),
            ...(data.motivation !== undefined && { motivation: data.motivation }),
            ...(data.systemDesign !== undefined && { systemDesign: data.systemDesign }),
            ...(data.challenges !== undefined && { challenges: data.challenges }),
            ...(data.learnings !== undefined && { learnings: data.learnings }),
            ...(data.impact !== undefined && { impact: data.impact }),
            ...(data.role !== undefined && { role: data.role }),
            ...(data.imageAlt !== undefined && { imageAlt: data.imageAlt }),
            ...(data.summary !== undefined && { summary: data.summary }),
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
