import { eq, desc } from "drizzle-orm";
import { db } from "../db.js";
import { sketchpadSessionsTable, type SketchpadSession } from "@portfolio/shared";

export class SketchpadRepository {
    async findAll(): Promise<SketchpadSession[]> {
        const results = await db.select().from(sketchpadSessionsTable).orderBy(desc(sketchpadSessionsTable.createdAt));
        return results as SketchpadSession[];
    }

    async findActive(): Promise<SketchpadSession[]> {
        const results = await db.select().from(sketchpadSessionsTable)
            .where(eq(sketchpadSessionsTable.status, "active"))
            .orderBy(desc(sketchpadSessionsTable.createdAt));
        return results as SketchpadSession[];
    }

    async findById(id: number): Promise<SketchpadSession | null> {
        const [result] = await db.select().from(sketchpadSessionsTable).where(eq(sketchpadSessionsTable.id, id)).limit(1);
        return (result as SketchpadSession) ?? null;
    }

    async create(data: { title?: string; createdBy?: string }): Promise<SketchpadSession> {
        const [inserted] = await db.insert(sketchpadSessionsTable).values(data).returning();
        if (!inserted) throw new Error("Failed to create sketchpad session");
        return inserted as SketchpadSession;
    }

    async updateCanvas(id: number, canvasData: Record<string, unknown>): Promise<SketchpadSession> {
        const [updated] = await db.update(sketchpadSessionsTable)
            .set({ canvasData, updatedAt: new Date() })
            .where(eq(sketchpadSessionsTable.id, id))
            .returning();
        if (!updated) throw new Error("Session not found");
        return updated as SketchpadSession;
    }

    async updateStatus(id: number, status: "active" | "archived"): Promise<void> {
        await db.update(sketchpadSessionsTable).set({ status, updatedAt: new Date() }).where(eq(sketchpadSessionsTable.id, id));
    }

    async delete(id: number): Promise<void> {
        await db.delete(sketchpadSessionsTable).where(eq(sketchpadSessionsTable.id, id));
    }
}

export const sketchpadRepository = new SketchpadRepository();
