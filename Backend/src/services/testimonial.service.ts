import { testimonialRepository } from "../repositories/testimonial.repository.js";
import { type Testimonial, type InsertTestimonial } from "@portfolio/shared";
import { CacheService } from "../lib/cache.js";

const FEATURE = "testimonial";
const LIST_NAMESPACE = "list";
const ITEM_NAMESPACE = "item";
const CACHE_TTL = 3600;

export class TestimonialService {
    /**
     * Retrieves all testimonials, using Redis cache when available.
     * @returns Array of testimonial objects
     */
    async getAll(): Promise<Testimonial[]> {
        const key = CacheService.key(FEATURE, LIST_NAMESPACE);
        return CacheService.getOrSet(key, CACHE_TTL, () => testimonialRepository.findAll());
    }

    /**
     * Retrieves a single testimonial by its ID, using Redis cache when available.
     * @param id - The testimonial ID
     * @returns The matching testimonial or null if not found
     */
    async getById(id: number): Promise<Testimonial | null> {
        const key = CacheService.key(FEATURE, ITEM_NAMESPACE, id);
        return CacheService.getOrSet(key, CACHE_TTL, () => testimonialRepository.findById(id));
    }

    /**
     * Creates a new testimonial and invalidates cache.
     * @param data - The testimonial data to create
     * @returns The newly created testimonial
     */
    async create(data: InsertTestimonial): Promise<Testimonial> {
        const testimonial = await testimonialRepository.create(data);
        await this.invalidateCache();
        return testimonial;
    }

    /**
     * Updates an existing testimonial by ID and invalidates cache.
     * @param id - The testimonial ID to update
     * @param data - Partial testimonial data to apply
     * @returns The updated testimonial
     */
    async update(id: number, data: Partial<InsertTestimonial>): Promise<Testimonial> {
        const testimonial = await testimonialRepository.update(id, data);
        await this.invalidateCache(id);
        return testimonial;
    }

    /**
     * Deletes a testimonial by ID and invalidates cache.
     * @param id - The testimonial ID to delete
     */
    async delete(id: number): Promise<void> {
        await testimonialRepository.delete(id);
        await this.invalidateCache(id);
    }

    private async invalidateCache(id?: number) {
        const listKey = CacheService.key(FEATURE, LIST_NAMESPACE);
        const keys = [listKey];
        if (id) {
            keys.push(CacheService.key(FEATURE, ITEM_NAMESPACE, id));
        }
        await CacheService.invalidate(...keys);
    }
}

export const testimonialService = new TestimonialService();
