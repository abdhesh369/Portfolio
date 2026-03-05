import { db } from "../db.js";
import { guestbookTable } from "../../shared/schema.js";
import { eq, desc } from "drizzle-orm";
import { logger } from "../lib/logger.js";

export class GuestbookService {
    async getMessages(onlyApproved = true) {
        try {
            const query = onlyApproved
                ? db.select().from(guestbookTable).where(eq(guestbookTable.isApproved, true))
                : db.select().from(guestbookTable);
            return await query.orderBy(desc(guestbookTable.createdAt));
        } catch (error) {
            logger.error({ context: "guestbook-service", error }, "Error fetching guestbook messages");
            throw error;
        }
    }

    async addMessage(data: { name: string; content: string; email?: string }) {
        try {
            const [newMessage] = await db.insert(guestbookTable)
                .values({
                    name: data.name,
                    content: data.content,
                    email: data.email,
                    isApproved: false, // Auto-moderate: needs approval
                })
                .returning();

            return newMessage;
        } catch (error) {
            logger.error({ context: "guestbook-service", error }, "Error adding guestbook message");
            throw error;
        }
    }

    async approveMessage(id: number) {
        try {
            const [approved] = await db.update(guestbookTable)
                .set({ isApproved: true })
                .where(eq(guestbookTable.id, id))
                .returning();
            return approved;
        } catch (error) {
            logger.error({ context: "guestbook-service", error }, "Error approving guestbook message");
            throw error;
        }
    }

    async deleteMessage(id: number) {
        try {
            await db.delete(guestbookTable).where(eq(guestbookTable.id, id));
            return true;
        } catch (error) {
            logger.error({ context: "guestbook-service", error }, "Error deleting guestbook message");
            throw error;
        }
    }
}

export const guestbookService = new GuestbookService();
