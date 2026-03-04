import { skillConnectionRepository } from "../repositories/skill-connection.repository.js";
import { redis } from "../lib/redis.js";
import type { SkillConnection } from "../../shared/schema.js";

const CACHE_KEY = "skill_connections";

export class SkillConnectionService {
    /**
     * Retrieves all skill connections, using Redis cache when available.
     * @returns Array of skill connection objects
     */
    async getAll(): Promise<SkillConnection[]> {
        const cached = redis ? await redis.get(CACHE_KEY) : null;
        if (cached) {
            return JSON.parse(cached);
        }

        const connections = await skillConnectionRepository.findAll();
        if (redis) {
            await redis.setex(CACHE_KEY, 3600, JSON.stringify(connections));
        }
        return connections;
    }

    /**
     * Creates a new skill connection between two skills and invalidates cache.
     * @param fromSkillId - The source skill ID
     * @param toSkillId - The target skill ID
     * @returns The newly created skill connection
     */
    async create(fromSkillId: number, toSkillId: number): Promise<SkillConnection> {
        const connection = await skillConnectionRepository.create({ fromSkillId, toSkillId });
        await this.invalidateCache();
        return connection;
    }

    /**
     * Deletes a skill connection by ID and invalidates cache.
     * @param id - The skill connection ID to delete
     */
    async delete(id: number): Promise<void> {
        await skillConnectionRepository.delete(id);
        await this.invalidateCache();
    }

    private async invalidateCache() {
        if (redis) {
            await redis.del(CACHE_KEY);
        }
    }
}

export const skillConnectionService = new SkillConnectionService();
