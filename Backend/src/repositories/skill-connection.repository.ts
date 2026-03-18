import { eq, inArray } from "drizzle-orm";
import { db } from "../db.js";
import { skillConnectionsTable, type SkillConnection, type InsertSkillConnection } from "@portfolio/shared";

// Types moved to @portfolio/shared

export class SkillConnectionRepository {
    async findAll(): Promise<SkillConnection[]> {
        return db.select().from(skillConnectionsTable) as Promise<SkillConnection[]>;
    }

    async findById(id: number): Promise<SkillConnection | null> {
        const [result] = await db
            .select()
            .from(skillConnectionsTable)
            .where(eq(skillConnectionsTable.id, id))
            .limit(1);
        return (result as SkillConnection) || null;
    }

    async create(data: { fromSkillId: number; toSkillId: number }): Promise<SkillConnection> {
        const connectionData: InsertSkillConnection = {
            ...data,
        };

        const [inserted] = await db
            .insert(skillConnectionsTable)
            .values(connectionData)
            .returning();
        if (!inserted) throw new Error("Failed to create skill connection");
        return inserted as SkillConnection;
    }

    async delete(id: number): Promise<void> {
        await db.delete(skillConnectionsTable).where(eq(skillConnectionsTable.id, id));
    }

    async bulkDelete(ids: number[]): Promise<void> {
        if (ids.length === 0) return;
        await db.delete(skillConnectionsTable).where(inArray(skillConnectionsTable.id, ids));
    }
}

export const skillConnectionRepository = new SkillConnectionRepository();
