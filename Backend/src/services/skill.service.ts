import { skillRepository } from "../repositories/skill.repository.js";
import { redis } from "../lib/redis.js";
import type { Skill, InsertSkill } from "../../shared/schema.js";

export class SkillService {
    private readonly CACHE_KEY = "skills:list";
    private readonly CACHE_TTL = 3600;

    async getAll(): Promise<Skill[]> {
        const cached = await redis?.get(this.CACHE_KEY);
        if (cached) return JSON.parse(cached);

        const skills = await skillRepository.findAll();
        if (redis) {
            await redis.setex(this.CACHE_KEY, this.CACHE_TTL, JSON.stringify(skills));
        }
        return skills;
    }

    async getById(id: number): Promise<Skill | null> {
        return await skillRepository.findById(id);
    }

    async create(data: InsertSkill): Promise<Skill> {
        const skill = await skillRepository.create(data);
        if (redis) {
            await redis.del(this.CACHE_KEY);
        }
        return skill;
    }

    async update(id: number, data: Partial<InsertSkill>): Promise<Skill> {
        const skill = await skillRepository.update(id, data);
        if (redis) {
            await redis.del(this.CACHE_KEY);
        }
        return skill;
    }

    async delete(id: number): Promise<void> {
        await skillRepository.delete(id);
        if (redis) {
            await redis.del(this.CACHE_KEY);
        }
    }

    async bulkDelete(ids: number[]): Promise<void> {
        await skillRepository.bulkDelete(ids);
        if (redis) {
            await redis.del(this.CACHE_KEY);
        }
    }
}

export const skillService = new SkillService();
