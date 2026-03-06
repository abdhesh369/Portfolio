import { skillConnectionRepository } from "../repositories/skill-connection.repository.js";
import type { SkillConnection } from "../../shared/schema.js";
import { CacheService } from "../lib/cache.js";

const FEATURE = "skill";
const NAMESPACE = "connections";
const CACHE_TTL = 3600;

export class SkillConnectionService {
    /**
     * Retrieves all skill connections, using Redis cache when available.
     * @returns Array of skill connection objects
     */
    async getAll(): Promise<SkillConnection[]> {
        const key = CacheService.key(FEATURE, NAMESPACE);
        return CacheService.getOrSet(key, CACHE_TTL, () => skillConnectionRepository.findAll());
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
        const key = CacheService.key(FEATURE, NAMESPACE);
        await CacheService.invalidate(key);
    }
}

export const skillConnectionService = new SkillConnectionService();
