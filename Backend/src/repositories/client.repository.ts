import { eq, desc } from "drizzle-orm";
import { db } from "../db.js";
import { clientsTable, clientProjectsTable, clientFeedbackTable, type Client, type ClientProject, type ClientFeedback } from "@portfolio/shared";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export class ClientRepository {
    async findAll(): Promise<Client[]> {
        const results = await db.select().from(clientsTable).orderBy(desc(clientsTable.createdAt));
        return results as Client[];
    }

    async findById(id: number): Promise<Client | null> {
        const [result] = await db.select().from(clientsTable).where(eq(clientsTable.id, id)).limit(1);
        return (result as Client) ?? null;
    }

    async findByToken(token: string): Promise<Client | null> {
        // Since tokens are hashed, we can't query by token directly.
        // For a small number of clients (portfolio scale), we fetch active ones and verify.
        const activeClients = await db.select().from(clientsTable).where(eq(clientsTable.status, "active"));

        for (const client of activeClients) {
            if (!client.token) continue;

            // Support both hashed (new) and plain text (legacy) tokens
            const isMatch = client.token.startsWith("$2")
                ? await bcrypt.compare(token, client.token)
                : client.token === token;

            if (isMatch) return client as Client;
        }
        return null;
    }

    async create(data: { name: string; email: string; company?: string }): Promise<Client & { rawToken: string }> {
        const rawToken = crypto.randomUUID();
        const salt = await bcrypt.genSalt(10);
        const hashedToken = await bcrypt.hash(rawToken, salt);

        const [inserted] = await db.insert(clientsTable).values({ ...data, token: hashedToken }).returning();
        if (!inserted) throw new Error("Failed to create client");

        return { ...(inserted as Client), rawToken };
    }

    async update(id: number, data: Partial<{ name: string; email: string; company: string; status: "active" | "inactive" }>): Promise<Client> {
        const [updated] = await db.update(clientsTable).set(data).where(eq(clientsTable.id, id)).returning();
        if (!updated) throw new Error("Client not found");
        return updated;
    }

    async delete(id: number): Promise<void> {
        await db.delete(clientsTable).where(eq(clientsTable.id, id));
    }

    // Client Projects
    async findProjectsByClientId(clientId: number): Promise<ClientProject[]> {
        const results = await db.select().from(clientProjectsTable)
            .where(eq(clientProjectsTable.clientId, clientId))
            .orderBy(desc(clientProjectsTable.createdAt));
        return results as ClientProject[];
    }

    async createProject(data: { clientId: number; title: string; status?: "not_started" | "in_progress" | "review" | "completed"; deadline?: Date; notes?: string }): Promise<ClientProject> {
        const [inserted] = await db.insert(clientProjectsTable).values(data as any).returning();
        if (!inserted) throw new Error("Failed to create client project");
        return inserted as ClientProject;
    }

    async updateProject(id: number, data: Partial<{ title: string; status: "not_started" | "in_progress" | "review" | "completed"; deadline: Date; notes: string }>): Promise<ClientProject> {
        const [updated] = await db.update(clientProjectsTable).set({ ...data, updatedAt: new Date() } as any).where(eq(clientProjectsTable.id, id)).returning();
        if (!updated) throw new Error("Client project not found");
        return updated as ClientProject;
    }

    // Client Feedback
    async findFeedbackByProjectId(clientProjectId: number): Promise<ClientFeedback[]> {
        const results = await db.select().from(clientFeedbackTable)
            .where(eq(clientFeedbackTable.clientProjectId, clientProjectId))
            .orderBy(desc(clientFeedbackTable.createdAt));
        return results.map(r => ({
            ...r,
            attachments: r.attachments || []
        })) as ClientFeedback[];
    }

    async createFeedback(data: { clientProjectId: number; clientId: number; message: string }): Promise<ClientFeedback> {
        const [inserted] = await db.insert(clientFeedbackTable).values(data).returning();
        if (!inserted) throw new Error("Failed to create feedback");
        return inserted as ClientFeedback;
    }
}

export const clientRepository = new ClientRepository();
