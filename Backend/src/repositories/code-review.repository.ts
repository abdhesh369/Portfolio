import { eq, desc } from "drizzle-orm";
import { db } from "../db.js";
import { codeReviewsTable, type CodeReview } from "@portfolio/shared";

export class CodeReviewRepository {
    async findByProjectId(projectId: number): Promise<CodeReview | null> {
        const [result] = await db.select().from(codeReviewsTable)
            .where(eq(codeReviewsTable.projectId, projectId))
            .orderBy(desc(codeReviewsTable.createdAt))
            .limit(1);
        return (result as CodeReview) ?? null;
    }

    async create(data: { projectId: number; content: string; badges: string[]; status: string }): Promise<CodeReview> {
        const [inserted] = await db.insert(codeReviewsTable).values(data as any).returning();
        if (!inserted) throw new Error("Failed to create code review");
        return inserted as CodeReview;
    }

    async updateStatus(id: number, status: string, content?: string, badges?: string[], error?: string): Promise<void> {
        const updates: Record<string, unknown> = { status };
        if (content !== undefined) updates.content = content;
        if (badges !== undefined) updates.badges = badges;
        if (error !== undefined) updates.error = error;
        await db.update(codeReviewsTable).set(updates as any).where(eq(codeReviewsTable.id, id));
    }
}

export const codeReviewRepository = new CodeReviewRepository();
