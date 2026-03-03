import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { skillConnectionsTable, type SkillConnection, type InsertSkillConnection } from "../../shared/schema.js";

export class SkillConnectionRepository {
    async findAll(): Promise<SkillConnection[]> {
        return db.select().from(skillConnectionsTable);
    }

    async findById(id: number): Promise<SkillConnection | null> {
        const [result] = await db
            .select()
            .from(skillConnectionsTable)
            .where(eq(skillConnectionsTable.id, id))
            .limit(1);
        return result || null;
    }

    async create(connection: { fromSkillId: number; toSkillId: number }): Promise<SkillConnection> {
        const [inserted] = await db
            .insert(skillConnectionsTable)
            .values(connection)
            .returning();
        if (!inserted) throw new Error("Failed to create skill connection");
        return inserted;
    }

    async delete(id: number): Promise<void> {
        await db.delete(skillConnectionsTable).where(eq(skillConnectionsTable.id, id));
    }

    async bulkDelete(ids: number[]): Promise<void> {
        if (ids.length === 0) return;
        const { inArray } = await import("drizzle-orm");
        await db.delete(skillConnectionsTable).where(inArray(skillConnectionsTable.id, ids));
    }
}

export const skillConnectionRepository = new SkillConnectionRepository();
