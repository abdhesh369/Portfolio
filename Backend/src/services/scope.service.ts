import { scopeRepository } from "../repositories/scope.repository.js";
import { scopeQueue } from "../lib/queue.js";
import type { ScopeRequest, InsertScopeRequest } from "@portfolio/shared";
import { logger } from "../lib/logger.js";

export class ScopeService {
    /**
     * Submits a new project scope request.
     * Persists the request to the database and enqueues a background job for AI estimation.
     */
    async submitRequest(data: InsertScopeRequest): Promise<ScopeRequest> {
        // 1. Save to database with 'pending' status
        const request = await scopeRepository.create(data);

        // 2. Enqueue background job for Gemini estimation
        if (!scopeQueue) {
            logger.warn({ requestId: request.id }, "Scope estimation job skipped: Queue not available");
            return request;
        }

        try {
            await scopeQueue.add("estimate", { requestId: request.id });
            logger.info({ requestId: request.id }, "Scope estimation job enqueued");
        } catch (error) {
            logger.error({ error, requestId: request.id }, "Failed to enqueue scope estimation job");
            // We still return the request; the user can see it's pending.
            // Ideally we'd have a retry mechanism or manual trigger.
        }

        return request;
    }

    /**
     * Retrieves a scope request by ID.
     */
    async getById(id: number): Promise<ScopeRequest | null> {
        return scopeRepository.findById(id);
    }

    /**
     * Updates a scope request's status or estimation results.
     */
    async updateRequest(id: number, data: Partial<ScopeRequest>): Promise<ScopeRequest> {
        return scopeRepository.update(id, data);
    }

    /**
     * Lists recent scope requests (admin use usually, or for the user via session).
     */
    async listRecent(limit = 10): Promise<ScopeRequest[]> {
        return scopeRepository.findRecent(limit);
    }
}

export const scopeService = new ScopeService();
