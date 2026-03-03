import { skillConnectionRepository } from "../repositories/skill-connection.repository.js";
import { redis } from "../lib/redis.js";
import type { SkillConnection } from "../../shared/schema.js";

const CACHE_KEY = "skill_connections";

export class SkillConnectionService {
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

    async create(fromSkillId: number, toSkillId: number): Promise<SkillConnection> {
        const connection = await skillConnectionRepository.create({ fromSkillId, toSkillId });
        await this.invalidateCache();
        return connection;
    }

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
