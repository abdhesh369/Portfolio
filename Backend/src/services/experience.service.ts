import { experienceRepository } from "../repositories/experience.repository.js";
import { CHAT_CACHE_KEY } from "../routes/chat.js";
import type { Experience, InsertExperience } from "@portfolio/shared";
import { CacheService } from "../lib/cache.js";
import { logger } from "../lib/logger.js";

const FEATURE = "experience";
const LIST_NAMESPACE = "list";
const ITEM_NAMESPACE = "item";
const CACHE_TTL = 3600;

export class ExperienceService {
    /**
     * Retrieves all experience entries, using Redis cache when available.
     * @returns Array of experience objects
     */
    async getAll(): Promise<Experience[]> {
        const key = CacheService.key(FEATURE, LIST_NAMESPACE);
        return CacheService.getOrSet(key, CACHE_TTL, () => experienceRepository.findAll());
    }

    /**
     * Retrieves a single experience entry by its ID, using Redis cache when available.
     * @param id - The experience ID
     * @returns The matching experience or null if not found
     */
    async getById(id: number): Promise<Experience | null> {
        const key = CacheService.key(FEATURE, ITEM_NAMESPACE, id);
        return CacheService.getOrSet(key, CACHE_TTL, () => experienceRepository.findById(id));
    }

    /**
     * Creates a new experience entry and invalidates caches.
     * @param data - The experience data to create
     * @returns The newly created experience
     */
    async create(data: InsertExperience): Promise<Experience> {
        const experience = await experienceRepository.create(data);
        await this.invalidateCache();
        return experience;
    }

    /**
     * Updates an existing experience entry by ID and invalidates caches.
     * @param id - The experience ID to update
     * @param data - Partial experience data to apply
     * @returns The updated experience
     */
    async update(id: number, data: Partial<InsertExperience>): Promise<Experience> {
        const experience = await experienceRepository.update(id, data);
        await this.invalidateCache(id);
        return experience;
    }

    /**
     * Deletes an experience entry by ID and invalidates caches.
     * @param id - The experience ID to delete
     */
    async delete(id: number): Promise<void> {
        await experienceRepository.delete(id);
        await this.invalidateCache(id);
    }

    async bulkDelete(ids: number[]): Promise<void> {
        await experienceRepository.bulkDelete(ids);
        await this.invalidateCache();
    }

    private async invalidateCache(id?: number) {
        try {
            const listKey = CacheService.key(FEATURE, LIST_NAMESPACE);
            const keys = [listKey, CHAT_CACHE_KEY];
            if (id !== undefined) {
                keys.push(CacheService.key(FEATURE, ITEM_NAMESPACE, id));
            }
            await CacheService.invalidate(...keys);
        } catch (err) {
            logger.error({ err, id, feature: FEATURE }, "Failed to invalidate cache");
        }
    }
}

export const experienceService = new ExperienceService();
