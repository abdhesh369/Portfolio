import { eq, desc, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { db } from "../db.js";
import { chatConversationsTable } from "@portfolio/shared";

type DbChatConversation = InferSelectModel<typeof chatConversationsTable>;
type DbInsertChatConversation = InferInsertModel<typeof chatConversationsTable>;

export class ChatRepository {
    async findAll(limit = 100): Promise<DbChatConversation[]> {
        return db.select()
            .from(chatConversationsTable)
            .orderBy(desc(chatConversationsTable.createdAt))
            .limit(limit);
    }

    async findById(id: number): Promise<DbChatConversation | null> {
        const [result] = await db
            .select()
            .from(chatConversationsTable)
            .where(eq(chatConversationsTable.id, id))
            .limit(1);
        return result || null;
    }

    async create(data: DbInsertChatConversation): Promise<DbChatConversation> {
        const [inserted] = await db
            .insert(chatConversationsTable)
            .values(data)
            .returning();
        if (!inserted) throw new Error("Failed to create chat conversation log");
        return inserted;
    }
}

export const chatRepository = new ChatRepository();
