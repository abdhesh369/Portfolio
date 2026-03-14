import { db } from "../db.js";
import { subscribersTable } from "@portfolio/shared/schema";
import { eq } from "drizzle-orm";
import type { Subscriber, InsertSubscriber } from "@portfolio/shared/schema";

export class SubscriberRepository {
    async create(data: InsertSubscriber): Promise<Subscriber> {
        const [subscriber] = await db
            .insert(subscribersTable)
            .values({
                ...data,
                status: "active",
            })
            .returning();
        return subscriber;
    }

    async findByEmail(email: string): Promise<Subscriber | undefined> {
        const [subscriber] = await db
            .select()
            .from(subscribersTable)
            .where(eq(subscribersTable.email, email.toLowerCase()));
        return subscriber;
    }

    async updateStatus(email: string, status: "active" | "unsubscribed"): Promise<void> {
        await db
            .update(subscribersTable)
            .set({ status })
            .where(eq(subscribersTable.email, email.toLowerCase()));
    }

    async list(): Promise<Subscriber[]> {
        return await db.select().from(subscribersTable);
    }

    async findActive(): Promise<Subscriber[]> {
        return await db.select().from(subscribersTable).where(eq(subscribersTable.status, "active"));
    }
}
