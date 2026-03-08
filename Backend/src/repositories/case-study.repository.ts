import { eq, desc } from "drizzle-orm";
import { db } from "../db.js";
import { caseStudiesTable, type CaseStudy } from "@portfolio/shared";

export class CaseStudyRepository {
    async findAll(): Promise<CaseStudy[]> {
        const results = await db.select().from(caseStudiesTable).orderBy(desc(caseStudiesTable.createdAt));
        return results as CaseStudy[];
    }

    async findPublished(): Promise<CaseStudy[]> {
        const results = await db.select().from(caseStudiesTable)
            .where(eq(caseStudiesTable.status, "published"))
            .orderBy(desc(caseStudiesTable.createdAt));
        return results as CaseStudy[];
    }

    async findBySlug(slug: string): Promise<CaseStudy | null> {
        const [result] = await db.select().from(caseStudiesTable)
            .where(eq(caseStudiesTable.slug, slug))
            .limit(1);
        return (result as CaseStudy) ?? null;
    }

    async create(data: { projectId: number; title: string; slug: string; content: string; status?: string; generatedAt?: Date }): Promise<CaseStudy> {
        const [inserted] = await db.insert(caseStudiesTable).values(data as any).returning();
        if (!inserted) throw new Error("Failed to create case study");
        return inserted as CaseStudy;
    }

    async update(id: number, data: Partial<{ title: string; content: string; status: string }>): Promise<CaseStudy> {
        const [updated] = await db.update(caseStudiesTable).set({ ...data, updatedAt: new Date() } as any).where(eq(caseStudiesTable.id, id)).returning();
        if (!updated) throw new Error("Case study not found");
        return updated as CaseStudy;
    }

    async delete(id: number): Promise<void> {
        await db.delete(caseStudiesTable).where(eq(caseStudiesTable.id, id));
    }
}

export const caseStudyRepository = new CaseStudyRepository();
