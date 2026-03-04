import { skillRepository } from "../repositories/skill.repository.js";
import { redis } from "../lib/redis.js";
import { CHAT_CACHE_KEY } from "../routes/chat.js";
import type { Skill, InsertSkill } from "../../shared/schema.js";

export class SkillService {
    private readonly CACHE_KEY = "skills:list";
    private readonly CACHE_TTL = 3600;

    /**
     * Retrieves all skills, using Redis cache when available.
     * @returns Array of skill objects
     */
    async getAll(): Promise<Skill[]> {
        const cached = await redis?.get(this.CACHE_KEY);
        if (cached) return JSON.parse(cached);

        const skills = await skillRepository.findAll();
        if (redis) {
            await redis.setex(this.CACHE_KEY, this.CACHE_TTL, JSON.stringify(skills));
        }
        return skills;
    }

    /**
     * Retrieves a single skill by its ID.
     * @param id - The skill ID
     * @returns The matching skill or null if not found
     */
    async getById(id: number): Promise<Skill | null> {
        return await skillRepository.findById(id);
    }

    /**
     * Creates a new skill and invalidates related caches.
     * @param data - The skill data to create
     * @returns The newly created skill
     */
    async create(data: InsertSkill): Promise<Skill> {
        const skill = await skillRepository.create(data);
        if (redis) {
            await redis.del(this.CACHE_KEY, CHAT_CACHE_KEY);
        }
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
        if (redis) {
            await redis.del(this.CACHE_KEY, CHAT_CACHE_KEY);
        }
        return skill;
    }

    /**
     * Deletes a skill by ID and invalidates related caches.
     * @param id - The skill ID to delete
     */
    async delete(id: number): Promise<void> {
        await skillRepository.delete(id);
        if (redis) {
            await redis.del(this.CACHE_KEY, CHAT_CACHE_KEY);
        }
    }

    /**
     * Deletes multiple skills by their IDs and invalidates related caches.
     * @param ids - Array of skill IDs to delete
     */
    async bulkDelete(ids: number[]): Promise<void> {
        await skillRepository.bulkDelete(ids);
        if (redis) {
            await redis.del(this.CACHE_KEY, CHAT_CACHE_KEY);
        }
    }
}

export const skillService = new SkillService();
