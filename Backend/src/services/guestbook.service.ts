import { db } from "../db.js";
import { guestbookTable } from "@portfolio/shared";
import { eq, desc, sql } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import { CacheService } from "../lib/cache.js";

const FEATURE = "guestbook";
const LIST_NAMESPACE = "list";
const CACHE_TTL = 3600;

export class GuestbookService {
    async getMessages(onlyApproved = true) {
        const key = CacheService.key(FEATURE, LIST_NAMESPACE, onlyApproved ? "approved" : "all");

        return CacheService.getOrSet(key, CACHE_TTL, async () => {
            try {
                const query = onlyApproved
                    ? db.select().from(guestbookTable).where(eq(guestbookTable.isApproved, true))
                    : db.select().from(guestbookTable);
                return await query.orderBy(desc(guestbookTable.createdAt));
            } catch (error) {
                logger.error({ context: "guestbook-service", error }, "Error fetching guestbook messages");
                throw error;
            }
        });
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

            try {
                await this.invalidateCache();
            } catch (err) {
                logger.error({ err }, "Failed to invalidate guestbook cache");
            }
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

            try {
                await this.invalidateCache();
            } catch (err) {
                logger.error({ err, id }, "Failed to invalidate guestbook cache after approval");
            }
            return approved;
        } catch (error) {
            logger.error({ context: "guestbook-service", error }, "Error approving guestbook message");
            throw error;
        }
    }

    async addReaction(id: number, emoji: string) {
        try {
            // Using SQL for atomic increment of a nested JSONB field
            const [updated] = await db.update(guestbookTable)
                .set({
                    reactions: sql`jsonb_set(
                        reactions, 
                        ARRAY[${emoji}], 
                        (coalesce(reactions->>${emoji}, '0')::int + 1)::text::jsonb
                    )`
                })
                .where(eq(guestbookTable.id, id))
                .returning();

            try {
                await this.invalidateCache();
            } catch (err) {
                logger.error({ err, id }, "Failed to invalidate guestbook cache after reaction");
            }
            return updated;
        } catch (error) {
            logger.error({ context: "guestbook-service", error, id, emoji }, "Error adding reaction to guestbook message");
            throw error;
        }
    }

    async deleteMessage(id: number) {
        try {
            await db.delete(guestbookTable).where(eq(guestbookTable.id, id));
            try {
                await this.invalidateCache();
            } catch (err) {
                logger.error({ err, id }, "Failed to invalidate guestbook cache after deletion");
            }
            return true;
        } catch (error) {
            logger.error({ context: "guestbook-service", error }, "Error deleting guestbook message");
            throw error;
        }
    }

    private async invalidateCache() {
        const keyApproved = CacheService.key(FEATURE, LIST_NAMESPACE, "approved");
        const keyAll = CacheService.key(FEATURE, LIST_NAMESPACE, "all");
        await CacheService.invalidate(keyApproved, keyAll);
    }
}

export const guestbookService = new GuestbookService();
