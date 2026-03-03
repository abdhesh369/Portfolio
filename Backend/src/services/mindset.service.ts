import { mindsetRepository } from "../repositories/mindset.repository.js";
import { redis } from "../lib/redis.js";
import type { Mindset, InsertMindset } from "../../shared/schema.js";

const CACHE_KEY = "mindset";

export class MindsetService {
    async getAll(): Promise<Mindset[]> {
        const cached = redis ? await redis.get(CACHE_KEY) : null;
        if (cached) {
            return JSON.parse(cached);
        }

        const mindset = await mindsetRepository.findAll();
        if (redis) {
            await redis.setex(CACHE_KEY, 3600, JSON.stringify(mindset));
        }
        return mindset;
    }

    async getById(id: number): Promise<Mindset | null> {
        const cacheKey = `${CACHE_KEY}:${id}`;
        const cached = redis ? await redis.get(cacheKey) : null;
        if (cached) {
            return JSON.parse(cached);
        }

        const mindset = await mindsetRepository.findById(id);
        if (mindset && redis) {
            await redis.setex(cacheKey, 3600, JSON.stringify(mindset));
        }
        return mindset;
    }

    async create(data: InsertMindset): Promise<Mindset> {
        const mindset = await mindsetRepository.create(data);
        await this.invalidateCache();
        return mindset;
    }

    async update(id: number, data: Partial<InsertMindset>): Promise<Mindset> {
        const mindset = await mindsetRepository.update(id, data);
        await this.invalidateCache(id);
        return mindset;
    }

    async delete(id: number): Promise<void> {
        await mindsetRepository.delete(id);
        await this.invalidateCache(id);
    }

    private async invalidateCache(id?: number) {
        if (!redis) return;
        await redis.del(CACHE_KEY);
        if (id) {
            await redis.del(`${CACHE_KEY}:${id}`);
        }
    }
}

export const mindsetService = new MindsetService();
