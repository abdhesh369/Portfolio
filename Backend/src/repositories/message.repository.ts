import { eq, desc, inArray, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { db } from "../db.js";
import { messagesTable, type Message, type InsertMessage } from "../../shared/schema.js";

type DbMessage = InferSelectModel<typeof messagesTable>;
type DbInsertMessage = InferInsertModel<typeof messagesTable>;

export class MessageRepository {
    private transformMessage(message: DbMessage): Message {
        return {
            ...message,
            createdAt: message.createdAt ? message.createdAt.toISOString() : null,
        } as Message;
    }

    async findAll(): Promise<Message[]> {
        const results = await db.select().from(messagesTable).orderBy(desc(messagesTable.createdAt));
        return results.map(m => this.transformMessage(m));
    }

    async findById(id: number): Promise<Message | null> {
        const [result] = await db
            .select()
            .from(messagesTable)
            .where(eq(messagesTable.id, id))
            .limit(1);
        return result ? this.transformMessage(result) : null;
    }

    async create(data: InsertMessage): Promise<Message> {
        const messageData: DbInsertMessage = {
            ...data,
        };

        const [inserted] = await db
            .insert(messagesTable)
            .values(messageData)
            .returning();
        if (!inserted) throw new Error("Failed to create message");
        return this.transformMessage(inserted);
    }

    async delete(id: number): Promise<boolean> {
        const result = await db.delete(messagesTable).where(eq(messagesTable.id, id)).returning();
        return result.length > 0;
    }

    async update(id: number, data: Partial<InsertMessage>): Promise<Message> {
        const messageData: Partial<DbInsertMessage> = {
            ...data,
        };

        const [updated] = await db
            .update(messagesTable)
            .set(messageData)
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
