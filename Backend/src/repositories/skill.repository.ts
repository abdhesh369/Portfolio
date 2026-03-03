import { eq, inArray } from "drizzle-orm";
import { db } from "../db.js";
import { skillsTable, type Skill, type InsertSkill } from "../../shared/schema.js";

export class SkillRepository {
    async findAll(): Promise<Skill[]> {
        return await db.select().from(skillsTable);
    }

    async findById(id: number): Promise<Skill | null> {
        const [result] = await db
            .select()
            .from(skillsTable)
            .where(eq(skillsTable.id, id))
            .limit(1);
        return result || null;
    }

    async create(skill: InsertSkill): Promise<Skill> {
        const [inserted] = await db
            .insert(skillsTable)
            .values(skill)
            .returning();
        if (!inserted) throw new Error("Failed to create skill");
        return inserted;
    }

    async update(id: number, skill: Partial<InsertSkill>): Promise<Skill> {
        const [updated] = await db
            .update(skillsTable)
            .set(skill)
            .where(eq(skillsTable.id, id))
            .returning();
        if (!updated) throw new Error(`Skill with id ${id} not found`);
        return updated;
    }

    async delete(id: number): Promise<void> {
        await db.delete(skillsTable).where(eq(skillsTable.id, id));
    }

    async bulkDelete(ids: number[]): Promise<void> {
        if (ids.length === 0) return;
        await db.delete(skillsTable).where(inArray(skillsTable.id, ids));
    }
}

export const skillRepository = new SkillRepository();
