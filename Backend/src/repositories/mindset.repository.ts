import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { db } from "../db.js";
import { mindsetTable, type Mindset, type InsertMindset } from "@portfolio/shared";

type DbMindset = InferSelectModel<typeof mindsetTable>;
type DbInsertMindset = InferInsertModel<typeof mindsetTable>;

export class MindsetRepository {
    private transformMindset(mindset: DbMindset): Mindset {
        return {
            ...mindset,
            tags: (mindset.tags as string[]) || [],
        };
    }

    async findAll(): Promise<Mindset[]> {
        const results = await db.select().from(mindsetTable);
        return results.map(m => this.transformMindset(m));
    }

    async findById(id: number): Promise<Mindset | null> {
        const [result] = await db
            .select()
            .from(mindsetTable)
            .where(eq(mindsetTable.id, id))
            .limit(1);
        return result ? this.transformMindset(result) : null;
    }

    async create(data: InsertMindset): Promise<Mindset> {
        const mindsetData: DbInsertMindset = {
            ...data,
        };

        const [inserted] = await db
            .insert(mindsetTable)
            .values(mindsetData)
            .returning();
        if (!inserted) throw new Error("Failed to create mindset entry");
        return this.transformMindset(inserted);
    }

    async update(id: number, data: Partial<InsertMindset>): Promise<Mindset> {
        const mindsetData: Partial<DbInsertMindset> = {
            ...data,
        };

        const [updated] = await db
            .update(mindsetTable)
            .set(mindsetData)
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
