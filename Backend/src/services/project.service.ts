import { projectRepository } from "../repositories/project.repository.js";
import { redis } from "../lib/redis.js";
import { CHAT_CACHE_KEY } from "../routes/chat.js";
import type { Project, InsertProject } from "../../shared/schema.js";

export class ProjectService {
    private readonly CACHE_KEY_LIST = "projects:list";
    private readonly CACHE_TTL = 3600;

    async getAll(): Promise<Project[]> {
        const cached = await redis?.get(this.CACHE_KEY_LIST);
        if (cached) return JSON.parse(cached);

        const projects = await projectRepository.findAll();
        if (redis) {
            await redis.setex(this.CACHE_KEY_LIST, this.CACHE_TTL, JSON.stringify(projects));
        }
        return projects;
    }

    async getById(id: number): Promise<Project | null> {
        return await projectRepository.findById(id);
    }

    async create(data: InsertProject): Promise<Project> {
        const project = await projectRepository.create(data);
        if (redis) {
            await redis.del(this.CACHE_KEY_LIST, CHAT_CACHE_KEY);
        }
        return project;
    }

    async update(id: number, data: Partial<InsertProject>): Promise<Project> {
        const project = await projectRepository.update(id, data);
        if (redis) {
            await redis.del(this.CACHE_KEY_LIST, CHAT_CACHE_KEY);
        }
        return project;
    }

    async delete(id: number): Promise<void> {
        await projectRepository.delete(id);
        if (redis) {
            await redis.del(this.CACHE_KEY_LIST, CHAT_CACHE_KEY);
        }
    }

    async bulkDelete(ids: number[]): Promise<void> {
        await projectRepository.bulkDelete(ids);
        if (redis) {
            await redis.del(this.CACHE_KEY_LIST, CHAT_CACHE_KEY);
        }
    }

    async bulkUpdateStatus(ids: number[], status: string): Promise<void> {
        await projectRepository.bulkUpdateStatus(ids, status);
        if (redis) {
            await redis.del(this.CACHE_KEY_LIST, CHAT_CACHE_KEY);
        }
    }

    async updateReorder(ids: number[]): Promise<void> {
        await projectRepository.reorder(ids);
        if (redis) {
            await redis.del(this.CACHE_KEY_LIST, CHAT_CACHE_KEY);
        }
    }
}

export const projectService = new ProjectService();
