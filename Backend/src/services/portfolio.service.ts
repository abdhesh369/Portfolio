import { serviceRepository } from "../repositories/service.repository.js";
import { redis } from "../lib/redis.js";
import type { Service, InsertService } from "../../shared/schema.js";

export class PortfolioService {
    private readonly CACHE_KEY = "services:list";
    private readonly CACHE_TTL = 3600;

    async getAll(): Promise<Service[]> {
        const cached = await redis?.get(this.CACHE_KEY);
        if (cached) return JSON.parse(cached);

        const services = await serviceRepository.findAll();
        if (redis) {
            await redis.setex(this.CACHE_KEY, this.CACHE_TTL, JSON.stringify(services));
        }
        return services;
    }

    async findById(id: number): Promise<Service | null> {
        return await serviceRepository.findById(id);
    }

    async create(data: InsertService): Promise<Service> {
        const service = await serviceRepository.create(data);
        if (redis) {
            await redis.del(this.CACHE_KEY);
        }
        return service;
    }

    async update(id: number, data: Partial<InsertService>): Promise<Service> {
        const service = await serviceRepository.update(id, data);
        if (redis) {
            await redis.del(this.CACHE_KEY);
        }
        return service;
    }

    async delete(id: number): Promise<void> {
        await serviceRepository.delete(id);
        if (redis) {
            await redis.del(this.CACHE_KEY);
        }
    }
}

export const portfolioService = new PortfolioService();
