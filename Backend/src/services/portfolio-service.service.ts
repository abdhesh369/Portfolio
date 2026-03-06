import { portfolioServiceRepository } from "../repositories/portfolio-service.repository.js";
import { redis } from "../lib/redis.js";
import type { Service, InsertService } from "../../shared/schema.js";
import { CacheService } from "../lib/cache.js";

const FEATURE = "portfolio_service";
const LIST_NAMESPACE = "list";
const ITEM_NAMESPACE = "item";
const CACHE_TTL = 3600;

export class PortfolioServiceService {
    /**
     * Retrieves all portfolio services, using Redis cache when available.
     * @returns Array of service objects
     */
    async getAll(): Promise<Service[]> {
        const key = CacheService.key(FEATURE, LIST_NAMESPACE);
        return CacheService.getOrSet(key, CACHE_TTL, () => portfolioServiceRepository.findAll());
    }

    /**
     * Retrieves a single portfolio service by its ID, using Redis cache when available.
     * @param id - The service ID
     * @returns The matching service or null if not found
     */
    async getById(id: number): Promise<Service | null> {
        const key = CacheService.key(FEATURE, ITEM_NAMESPACE, id);
        return CacheService.getOrSet(key, CACHE_TTL, () => portfolioServiceRepository.findById(id));
    }

    /**
     * Creates a new portfolio service entry and invalidates cache.
     * @param data - The service data to create
     * @returns The newly created service
     */
    async create(data: InsertService): Promise<Service> {
        const service = await portfolioServiceRepository.create(data);
        try {
            await this.invalidateCache();
        } catch (err) {
            console.error("Failed to invalidate portfolio service cache after create:", err);
        }
        return service;
    }

    /**
     * Updates an existing portfolio service by ID and invalidates cache.
     * @param id - The service ID to update
     * @param data - Partial service data to apply
     * @returns The updated service
     */
    async update(id: number, data: Partial<InsertService>): Promise<Service> {
        const service = await portfolioServiceRepository.update(id, data);
        try {
            await this.invalidateCache(id);
        } catch (err) {
            console.error("Failed to invalidate portfolio service cache after update:", err);
        }
        return service;
    }

    /**
     * Deletes a portfolio service by ID and invalidates cache.
     * @param id - The service ID to delete
     */
    async delete(id: number): Promise<void> {
        await portfolioServiceRepository.delete(id);
        try {
            await this.invalidateCache(id);
        } catch (err) {
            console.error("Failed to invalidate portfolio service cache after delete:", err);
        }
    }

    private async invalidateCache(id?: number) {
        const listKey = CacheService.key(FEATURE, LIST_NAMESPACE);
        const keys = [listKey];
        if (id !== undefined && id !== null) {
            keys.push(CacheService.key(FEATURE, ITEM_NAMESPACE, id));
        }
        await CacheService.invalidate(...keys);
    }
}

export const portfolioServiceService = new PortfolioServiceService();
