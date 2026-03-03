import { portfolioServiceRepository } from "../repositories/portfolio-service.repository.js";
import { redis } from "../lib/redis.js";
import type { Service, InsertService } from "../../shared/schema.js";

const CACHE_KEY = "portfolio_services";

export class PortfolioServiceService {
    async getAll(): Promise<Service[]> {
        const cached = redis ? await redis.get(CACHE_KEY) : null;
        if (cached) {
            return JSON.parse(cached);
        }

        const services = await portfolioServiceRepository.findAll();
        if (redis) {
            await redis.setex(CACHE_KEY, 3600, JSON.stringify(services));
        }
        return services;
    }

    async getById(id: number): Promise<Service | null> {
        const cacheKey = `${CACHE_KEY}:${id}`;
        const cached = redis ? await redis.get(cacheKey) : null;
        if (cached) {
            return JSON.parse(cached);
        }

        const service = await portfolioServiceRepository.findById(id);
        if (service && redis) {
            await redis.setex(cacheKey, 3600, JSON.stringify(service));
        }
        return service;
    }

    async create(data: InsertService): Promise<Service> {
        const service = await portfolioServiceRepository.create(data);
        await this.invalidateCache();
        return service;
    }

    async update(id: number, data: Partial<InsertService>): Promise<Service> {
        const service = await portfolioServiceRepository.update(id, data);
        await this.invalidateCache(id);
        return service;
    }

    async delete(id: number): Promise<void> {
        await portfolioServiceRepository.delete(id);
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

export const portfolioServiceService = new PortfolioServiceService();
