import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { mindsetTable, type Mindset, type InsertMindset } from "../../shared/schema.js";

export class MindsetRepository {
    private transformMindset(mindset: any): Mindset {
        return {
            ...mindset,
            tags: (mindset.tags as string[]) || [],
        };
    }

    async findAll(): Promise<Mindset[]> {
        const results = await db.select().from(mindsetTable);
        return results.map(this.transformMindset);
    }

    async findById(id: number): Promise<Mindset | null> {
        const [result] = await db
            .select()
            .from(mindsetTable)
            .where(eq(mindsetTable.id, id))
            .limit(1);
        return result ? this.transformMindset(result) : null;
    }

    async create(mindset: InsertMindset): Promise<Mindset> {
        const [inserted] = await db
            .insert(mindsetTable)
            .values(mindset as any)
            .returning();
        if (!inserted) throw new Error("Failed to create mindset entry");
        return this.transformMindset(inserted);
    }

    async update(id: number, mindset: Partial<InsertMindset>): Promise<Mindset> {
        const [updated] = await db
            .update(mindsetTable)
            .set(mindset as any)
            .where(eq(mindsetTable.id, id))
            .returning();
        if (!updated) throw new Error(`Mindset principle with id ${id} not found`);
        return this.transformMindset(updated);
    }

    async delete(id: number): Promise<void> {
        await db.delete(mindsetTable).where(eq(mindsetTable.id, id));
    }
}

export const mindsetRepository = new MindsetRepository();
