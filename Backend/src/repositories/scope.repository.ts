import { eq, desc, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { db } from "../db.js";
import { scopeRequestsTable, type ScopeRequest, type InsertScopeRequest } from "@portfolio/shared";

type DbScopeRequest = InferSelectModel<typeof scopeRequestsTable>;
type DbInsertScopeRequest = InferInsertModel<typeof scopeRequestsTable>;

export class ScopeRepository {
    private transformScopeRequest(req: DbScopeRequest): ScopeRequest {
        return {
            ...req,
            estimation: req.estimation ? (req.estimation as ScopeRequest["estimation"]) : null,
            error: req.error ?? null,
            completedAt: req.completedAt ?? null,
        };
    }

    async findById(id: number): Promise<ScopeRequest | null> {
        const [result] = await db
            .select()
            .from(scopeRequestsTable)
            .where(eq(scopeRequestsTable.id, id))
            .limit(1);
        return result ? this.transformScopeRequest(result) : null;
    }

    async findByEmail(email: string): Promise<ScopeRequest[]> {
        const results = await db
            .select()
            .from(scopeRequestsTable)
            .where(eq(scopeRequestsTable.email, email))
            .orderBy(desc(scopeRequestsTable.createdAt));
        return results.map(r => this.transformScopeRequest(r));
    }

    async findAll(limit = 50): Promise<ScopeRequest[]> {
        const results = await db
            .select()
            .from(scopeRequestsTable)
            .orderBy(desc(scopeRequestsTable.createdAt))
            .limit(limit);
        return results.map(r => this.transformScopeRequest(r));
    }

    async findRecent(limit = 10): Promise<ScopeRequest[]> {
        return this.findAll(limit);
    }

    async create(data: InsertScopeRequest): Promise<ScopeRequest> {
        const [inserted] = await db
            .insert(scopeRequestsTable)
            .values({
                ...data,
                // Ensure defaults or mapping if necessary
                updatedAt: new Date()
            })
            .returning();
        if (!inserted) throw new Error("Failed to create scope request");
        return this.transformScopeRequest(inserted);
    }

    async update(id: number, data: Partial<DbInsertScopeRequest>): Promise<ScopeRequest> {
        const [updated] = await db
            .update(scopeRequestsTable)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(scopeRequestsTable.id, id))
            .returning();
        if (!updated) throw new Error(`Scope request with id ${id} not found`);
        return this.transformScopeRequest(updated);
    }

    async updateStatus(id: number, status: ScopeRequest["status"], error?: string): Promise<void> {
        await db
            .update(scopeRequestsTable)
            .set({
                status,
                error: error ?? null,
                completedAt: status === "completed" || status === "failed" ? new Date() : null,
                updatedAt: new Date()
            })
            .where(eq(scopeRequestsTable.id, id));
    }

    async updateEstimation(id: number, estimation: any): Promise<void> {
        await db
            .update(scopeRequestsTable)
            .set({
                estimation,
                status: "completed",
                completedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(scopeRequestsTable.id, id));
    }
}

export const scopeRepository = new ScopeRepository();
