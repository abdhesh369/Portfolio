import { skillRepository } from "../repositories/skill.repository.js";
import { CHAT_CACHE_KEY } from "../routes/chat.js";
import type { Skill, InsertSkill } from "@portfolio/shared";
import { CacheService } from "../lib/cache.js";
import { logger } from "../lib/logger.js";

const FEATURE = "skill";
const LIST_NAMESPACE = "list";
const ITEM_NAMESPACE = "item";
const CACHE_TTL = 3600;

export class SkillService {
    /**
     * Retrieves all skills, using Redis cache when available.
     * @returns Array of skill objects
     */
    async getAll(): Promise<Skill[]> {
        const key = CacheService.key(FEATURE, LIST_NAMESPACE);
        return CacheService.getOrSet(key, CACHE_TTL, () => skillRepository.findAll());
    }

    /**
     * Retrieves a single skill by its ID, using Redis cache when available.
     * @param id - The skill ID
     * @returns The matching skill or null if not found
     */
    async getById(id: number): Promise<Skill | null> {
        const key = CacheService.key(FEATURE, ITEM_NAMESPACE, id);
        return CacheService.getOrSet(key, CACHE_TTL, () => skillRepository.findById(id));
    }

    /**
     * Creates a new skill and invalidates related caches.
     * @param data - The skill data to create
     * @returns The newly created skill
     */
    async create(data: InsertSkill): Promise<Skill> {
        const skill = await skillRepository.create(data);
        await this.invalidateCache();
        return skill;
    }

    /**
     * Updates an existing skill by ID and invalidates related caches.
     * @param id - The skill ID to update
     * @param data - Partial skill data to apply
     * @returns The updated skill
     */
    async update(id: number, data: Partial<InsertSkill>): Promise<Skill> {
        const skill = await skillRepository.update(id, data);
        await this.invalidateCache(id);
        return skill;
    }

    /**
     * Deletes a skill by ID and invalidates related caches.
     * @param id - The skill ID to delete
     */
    async delete(id: number): Promise<void> {
        await skillRepository.delete(id);
        await this.invalidateCache(id);
    }

    /**
     * Deletes multiple skills by their IDs and invalidates related caches.
     * @param ids - Array of skill IDs to delete
     */
    async bulkDelete(ids: number[]): Promise<void> {
        await skillRepository.bulkDelete(ids);
        await this.invalidateCache();
        // Invalidate individual item caches
        try {
            const keys = ids.map(id => CacheService.key(FEATURE, ITEM_NAMESPACE, id));
            await CacheService.invalidate(...keys);
        } catch (err) {
            logger.error({ err, ids, feature: FEATURE }, "Failed to invalidate item caches after bulk delete");
        }
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

export const skillService = new SkillService();
