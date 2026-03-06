import { eq, inArray, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { db } from "../db.js";
import { skillsTable, type Skill, type InsertSkill } from "../../shared/schema.js";

type DbSkill = InferSelectModel<typeof skillsTable>;
type DbInsertSkill = InferInsertModel<typeof skillsTable>;

export class SkillRepository {
    private transformSkill(skill: DbSkill): Skill {
        // Since we aligned the types in shared/schema.ts, we can safely cast or just return.
        // We ensure status and other fields match the Zod-inferred Skill type.
        return skill as Skill;
    }

    async findAll(): Promise<Skill[]> {
        const results = await db.select().from(skillsTable);
        return results.map(s => this.transformSkill(s));
    }

    async findById(id: number): Promise<Skill | null> {
        const [result] = await db
            .select()
            .from(skillsTable)
            .where(eq(skillsTable.id, id))
            .limit(1);
        return result ? this.transformSkill(result) : null;
    }

    async create(data: InsertSkill): Promise<Skill> {
        const skillData: DbInsertSkill = {
            ...data,
        };

        const [inserted] = await db
            .insert(skillsTable)
            .values(skillData)
            .returning();
        if (!inserted) throw new Error("Failed to create skill");
        return this.transformSkill(inserted);
    }

    async update(id: number, data: Partial<InsertSkill>): Promise<Skill> {
        const skillData: Partial<DbInsertSkill> = {
            ...data,
        };

        const [updated] = await db
            .update(skillsTable)
            .set(skillData)
            .where(eq(skillsTable.id, id))
            .returning();
        if (!updated) throw new Error(`Skill with id ${id} not found`);
        return this.transformSkill(updated);
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
