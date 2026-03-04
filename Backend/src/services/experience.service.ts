import { experienceRepository } from "../repositories/experience.repository.js";
import { redis } from "../lib/redis.js";
import { CHAT_CACHE_KEY } from "../routes/chat.js";
import type { Experience, InsertExperience } from "../../shared/schema.js";

export class ExperienceService {
    /**
     * Retrieves all experience entries.
     * @returns Array of experience objects
     */
    async getAll(): Promise<Experience[]> {
        return experienceRepository.findAll();
    }

    /**
     * Retrieves a single experience entry by its ID.
     * @param id - The experience ID
     * @returns The matching experience or null if not found
     */
    async getById(id: number): Promise<Experience | null> {
        return experienceRepository.findById(id);
    }

    /**
     * Creates a new experience entry and invalidates chat cache.
     * @param data - The experience data to create
     * @returns The newly created experience
     */
    async create(data: InsertExperience): Promise<Experience> {
        const experience = await experienceRepository.create(data);
        if (redis) {
            await redis.del(CHAT_CACHE_KEY);
        }
        return experience;
    }

    /**
     * Updates an existing experience entry by ID and invalidates chat cache.
     * @param id - The experience ID to update
     * @param data - Partial experience data to apply
     * @returns The updated experience
     */
    async update(id: number, data: Partial<InsertExperience>): Promise<Experience> {
        const experience = await experienceRepository.update(id, data);
        if (redis) {
            await redis.del(CHAT_CACHE_KEY);
        }
        return experience;
    }

    /**
     * Deletes an experience entry by ID and invalidates chat cache.
     * @param id - The experience ID to delete
     */
    async delete(id: number): Promise<void> {
        await experienceRepository.delete(id);
        if (redis) {
            await redis.del(CHAT_CACHE_KEY);
        }
    }
}

export const experienceService = new ExperienceService();
