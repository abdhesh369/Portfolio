import { experienceRepository } from "../repositories/experience.repository.js";
import { redis } from "../lib/redis.js";
import { CHAT_CACHE_KEY } from "../routes/chat.js";
import type { Experience, InsertExperience } from "../../shared/schema.js";

export class ExperienceService {
    async getAll(): Promise<Experience[]> {
        return experienceRepository.findAll();
    }

    async getById(id: number): Promise<Experience | null> {
        return experienceRepository.findById(id);
    }

    async create(data: InsertExperience): Promise<Experience> {
        const experience = await experienceRepository.create(data);
        if (redis) {
            await redis.del(CHAT_CACHE_KEY);
        }
        return experience;
    }

    async update(id: number, data: Partial<InsertExperience>): Promise<Experience> {
        const experience = await experienceRepository.update(id, data);
        if (redis) {
            await redis.del(CHAT_CACHE_KEY);
        }
        return experience;
    }

    async delete(id: number): Promise<void> {
        await experienceRepository.delete(id);
        if (redis) {
            await redis.del(CHAT_CACHE_KEY);
        }
    }
}

export const experienceService = new ExperienceService();
