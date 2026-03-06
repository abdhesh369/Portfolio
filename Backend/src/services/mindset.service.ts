import { mindsetRepository } from "../repositories/mindset.repository.js";
import { redis } from "../lib/redis.js";
import type { Mindset, InsertMindset } from "@portfolio/shared";
import { CacheService } from "../lib/cache.js";

const FEATURE = "mindset";
const LIST_NAMESPACE = "list";
const ITEM_NAMESPACE = "item";
const CACHE_TTL = 3600;

export class MindsetService {
    /**
     * Retrieves all mindset entries, using Redis cache when available.
     * @returns Array of mindset objects
     */
    async getAll(): Promise<Mindset[]> {
        const key = CacheService.key(FEATURE, LIST_NAMESPACE);
        return CacheService.getOrSet(key, CACHE_TTL, () => mindsetRepository.findAll());
    }

    /**
     * Retrieves a single mindset entry by its ID, using Redis cache when available.
     * @param id - The mindset ID
     * @returns The matching mindset or null if not found
     */
    async getById(id: number): Promise<Mindset | null> {
        const key = CacheService.key(FEATURE, ITEM_NAMESPACE, id);
        return CacheService.getOrSet(key, CACHE_TTL, () => mindsetRepository.findById(id));
    }

    /**
     * Creates a new mindset entry and invalidates cache.
     * @param data - The mindset data to create
     * @returns The newly created mindset
     */
    async create(data: InsertMindset): Promise<Mindset> {
        const mindset = await mindsetRepository.create(data);
        await this.invalidateCache();
        return mindset;
    }

    /**
     * Updates an existing mindset entry by ID and invalidates cache.
     * @param id - The mindset ID to update
     * @param data - Partial mindset data to apply
     * @returns The updated mindset
     */
    async update(id: number, data: Partial<InsertMindset>): Promise<Mindset> {
        const mindset = await mindsetRepository.update(id, data);
        await this.invalidateCache(id);
        return mindset;
    }

    /**
     * Deletes a mindset entry by ID and invalidates cache.
     * @param id - The mindset ID to delete
     */
    async delete(id: number): Promise<void> {
        await mindsetRepository.delete(id);
        await this.invalidateCache(id);
    }

    private async invalidateCache(id?: number) {
        const listKey = CacheService.key(FEATURE, LIST_NAMESPACE);
        const keys = [listKey];
        if (id !== undefined) {
            keys.push(CacheService.key(FEATURE, ITEM_NAMESPACE, id));
        }
        await CacheService.invalidate(...keys);
    }
}

export const mindsetService = new MindsetService();
