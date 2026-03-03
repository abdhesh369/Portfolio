import { eq, desc, inArray } from "drizzle-orm";
import { db } from "../db.js";
import { messagesTable, type Message, type InsertMessage } from "../../shared/schema.js";

export class MessageRepository {
    private transformMessage(message: any): Message {
        return {
            ...message,
            createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt,
        };
    }

    async findAll(): Promise<Message[]> {
        const results = await db.select().from(messagesTable).orderBy(desc(messagesTable.createdAt));
        return results.map(this.transformMessage);
    }

    async findById(id: number): Promise<Message | null> {
        const [result] = await db
            .select()
            .from(messagesTable)
            .where(eq(messagesTable.id, id))
            .limit(1);
        return result ? this.transformMessage(result) : null;
    }

    async create(message: InsertMessage): Promise<Message> {
        const [inserted] = await db
            .insert(messagesTable)
            .values(message)
            .returning();
        if (!inserted) throw new Error("Failed to create message");
        return this.transformMessage(inserted);
    }

    async delete(id: number): Promise<void> {
        await db.delete(messagesTable).where(eq(messagesTable.id, id));
    }

    async update(id: number, data: Partial<InsertMessage>): Promise<Message> {
        const [updated] = await db
            .update(messagesTable)
            .set(data)
            .where(eq(messagesTable.id, id))
            .returning();
        if (!updated) throw new Error(`Message with id ${id} not found`);
        return this.transformMessage(updated);
    }

    async bulkDelete(ids: number[]): Promise<void> {
        if (ids.length === 0) return;
        await db.delete(messagesTable).where(inArray(messagesTable.id, ids));
    }
}

export const messageRepository = new MessageRepository();
