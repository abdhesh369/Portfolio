import { testimonialRepository } from "../repositories/testimonial.repository.js";
import { redis } from "../lib/redis.js";
import type { Testimonial, InsertTestimonial } from "../../shared/schema.js";

const CACHE_KEY = "testimonials";

export class TestimonialService {
    async getAll(): Promise<Testimonial[]> {
        const cached = redis ? await redis.get(CACHE_KEY) : null;
        if (cached) {
            return JSON.parse(cached);
        }

        const testimonials = await testimonialRepository.findAll();
        if (redis) {
            await redis.setex(CACHE_KEY, 3600, JSON.stringify(testimonials));
        }
        return testimonials;
    }

    async getById(id: number): Promise<Testimonial | null> {
        const cacheKey = `${CACHE_KEY}:${id}`;
        const cached = redis ? await redis.get(cacheKey) : null;
        if (cached) {
            return JSON.parse(cached);
        }

        const testimonial = await testimonialRepository.findById(id);
        if (testimonial && redis) {
            await redis.setex(cacheKey, 3600, JSON.stringify(testimonial));
        }
        return testimonial;
    }

    async create(data: InsertTestimonial): Promise<Testimonial> {
        const testimonial = await testimonialRepository.create(data);
        await this.invalidateCache();
        return testimonial;
    }

    async update(id: number, data: Partial<InsertTestimonial>): Promise<Testimonial> {
        const testimonial = await testimonialRepository.update(id, data);
        await this.invalidateCache(id);
        return testimonial;
    }

    async delete(id: number): Promise<void> {
        await testimonialRepository.delete(id);
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

export const testimonialService = new TestimonialService();
