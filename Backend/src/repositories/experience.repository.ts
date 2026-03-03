import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { experiencesTable, type Experience, type InsertExperience } from "../../shared/schema.js";

export class ExperienceRepository {
    async findAll(): Promise<Experience[]> {
        return db.select().from(experiencesTable);
    }

    async findById(id: number): Promise<Experience | null> {
        const [result] = await db
            .select()
            .from(experiencesTable)
            .where(eq(experiencesTable.id, id))
            .limit(1);
        return result || null;
    }

    async create(experience: InsertExperience): Promise<Experience> {
        const [inserted] = await db
            .insert(experiencesTable)
            .values(experience as any)
            .returning();
        if (!inserted) throw new Error("Failed to create experience");
        return inserted;
    }

    async update(id: number, experience: Partial<InsertExperience>): Promise<Experience> {
        const [updated] = await db
            .update(experiencesTable)
            .set(experience as any)
            .where(eq(experiencesTable.id, id))
            .returning();
        if (!updated) throw new Error(`Experience with id ${id} not found`);
        return updated;
    }

    async delete(id: number): Promise<void> {
        await db.delete(experiencesTable).where(eq(experiencesTable.id, id));
    }
}

export const experienceRepository = new ExperienceRepository();
