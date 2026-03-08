import { eq, desc } from "drizzle-orm";
import { db } from "../db.js";
import { whiteboardSessionsTable, type WhiteboardSession } from "@portfolio/shared";

export class WhiteboardRepository {
    async findAll(): Promise<WhiteboardSession[]> {
        const results = await db.select().from(whiteboardSessionsTable).orderBy(desc(whiteboardSessionsTable.createdAt));
        return results as WhiteboardSession[];
    }

    async findActive(): Promise<WhiteboardSession[]> {
        const results = await db.select().from(whiteboardSessionsTable)
            .where(eq(whiteboardSessionsTable.status, "active"))
            .orderBy(desc(whiteboardSessionsTable.createdAt));
        return results as WhiteboardSession[];
    }

    async findById(id: number): Promise<WhiteboardSession | null> {
        const [result] = await db.select().from(whiteboardSessionsTable).where(eq(whiteboardSessionsTable.id, id)).limit(1);
        return (result as WhiteboardSession) ?? null;
    }

    async create(data: { title?: string; createdBy?: string }): Promise<WhiteboardSession> {
        const [inserted] = await db.insert(whiteboardSessionsTable).values(data as any).returning();
        if (!inserted) throw new Error("Failed to create whiteboard session");
        return inserted as WhiteboardSession;
    }

    async updateCanvas(id: number, canvasData: Record<string, unknown>): Promise<WhiteboardSession> {
        const [updated] = await db.update(whiteboardSessionsTable)
            .set({ canvasData, updatedAt: new Date() } as any)
            .where(eq(whiteboardSessionsTable.id, id))
            .returning();
        if (!updated) throw new Error("Session not found");
        return updated as WhiteboardSession;
    }

    async updateStatus(id: number, status: string): Promise<void> {
        await db.update(whiteboardSessionsTable).set({ status, updatedAt: new Date() } as any).where(eq(whiteboardSessionsTable.id, id));
    }

    async delete(id: number): Promise<void> {
        await db.delete(whiteboardSessionsTable).where(eq(whiteboardSessionsTable.id, id));
    }
}

export const whiteboardRepository = new WhiteboardRepository();
