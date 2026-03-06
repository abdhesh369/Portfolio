import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { db } from "../db.js";
import { experiencesTable, type Experience, type InsertExperience } from "../../shared/schema.js";

type DbExperience = InferSelectModel<typeof experiencesTable>;
type DbInsertExperience = InferInsertModel<typeof experiencesTable>;

export class ExperienceRepository {
    private transformExperience(exp: DbExperience): Experience {
        return {
            ...exp,
            period: exp.period ?? undefined,
            endDate: exp.endDate ?? undefined,
        };
    }

    async findAll(): Promise<Experience[]> {
        const results = await db.select().from(experiencesTable);
        return results.map(exp => this.transformExperience(exp));
    }

    async findById(id: number): Promise<Experience | null> {
        const [result] = await db
            .select()
            .from(experiencesTable)
            .where(eq(experiencesTable.id, id))
            .limit(1);
        return result ? this.transformExperience(result) : null;
    }

    async create(data: InsertExperience): Promise<Experience> {
        const experienceData: DbInsertExperience = {
            ...data,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            period: data.period ?? null,
        };

        const [inserted] = await db
            .insert(experiencesTable)
            .values(experienceData)
            .returning();
        if (!inserted) throw new Error("Failed to create experience");
        return this.transformExperience(inserted);
    }

    async update(id: number, data: Partial<InsertExperience>): Promise<Experience> {
        const experienceData: Partial<DbInsertExperience> = {
            ...(data as any), // Base copy
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate === null ? null : (data.endDate ? new Date(data.endDate) : undefined),
            period: data.period ?? undefined,
        };

        const [updated] = await db
            .update(experiencesTable)
            .set(experienceData)
            .where(eq(experiencesTable.id, id))
            .returning();
        if (!updated) throw new Error(`Experience with id ${id} not found`);
        return this.transformExperience(updated);
    }

    async delete(id: number): Promise<void> {
        await db.delete(experiencesTable).where(eq(experiencesTable.id, id));
    }
}

export const experienceRepository = new ExperienceRepository();
