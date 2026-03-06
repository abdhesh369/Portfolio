import { projectRepository } from "../repositories/project.repository.js";
import { redis } from "../lib/redis.js";
import { CHAT_CACHE_KEY } from "../routes/chat.js";
import type { Project, InsertProject } from "../../shared/schema.js";
import { CacheService } from "../lib/cache.js";

const FEATURE = "project";
const LIST_NAMESPACE = "list";
const CACHE_TTL = 3600;

export class ProjectService {
    /**
     * Retrieves all projects, using Redis cache when available.
     * @returns Array of project objects
     */
    async getAll(): Promise<Project[]> {
        const key = CacheService.key(FEATURE, LIST_NAMESPACE);
        return CacheService.getOrSet(key, CACHE_TTL, () => projectRepository.findAll());
    }

    /**
     * Retrieves a single project by its ID.
     * @param id - The project ID
     * @returns The matching project or null if not found
     */
    async getById(id: number): Promise<Project | null> {
        return await projectRepository.findById(id);
    }

    /**
     * Creates a new project and invalidates related caches.
     * @param data - The project data to create
     * @returns The newly created project
     */
    async create(data: InsertProject): Promise<Project> {
        const project = await projectRepository.create(data);
        await this.invalidateCache();
        return project;
    }

    /**
     * Updates an existing project by ID and invalidates related caches.
     * @param id - The project ID to update
     * @param data - Partial project data to apply
     * @returns The updated project
     */
    async update(id: number, data: Partial<InsertProject>): Promise<Project> {
        const project = await projectRepository.update(id, data);
        await this.invalidateCache();
        return project;
    }

    /**
     * Deletes a project by ID and invalidates related caches.
     * @param id - The project ID to delete
     */
    async delete(id: number): Promise<void> {
        await projectRepository.delete(id);
        await this.invalidateCache();
    }

    /**
     * Deletes multiple projects by their IDs and invalidates related caches.
     * @param ids - Array of project IDs to delete
     */
    async bulkDelete(ids: number[]): Promise<void> {
        await projectRepository.bulkDelete(ids);
        await this.invalidateCache();
    }

    /**
     * Updates the status of multiple projects and invalidates related caches.
     * @param ids - Array of project IDs to update
     * @param status - The new status value to apply
     */
    async bulkUpdateStatus(ids: number[], status: Project["status"]): Promise<void> {
        await projectRepository.bulkUpdateStatus(ids, status);
        await this.invalidateCache();
    }

    /**
     * Reorders projects by the given ID sequence and invalidates related caches.
     * @param ids - Array of project IDs in the desired display order
     */
    async updateReorder(ids: number[]): Promise<void> {
        await projectRepository.reorder(ids);
        await this.invalidateCache();
    }

    private async invalidateCache() {
        const key = CacheService.key(FEATURE, LIST_NAMESPACE);
        await CacheService.invalidate(key, CHAT_CACHE_KEY);
    }

    /**
     * Increments the view count for a project.
     * @param id - The project ID to increment views for
     */
    async incrementViewCount(id: number): Promise<void> {
        await projectRepository.incrementViewCount(id);
    }
}

export const projectService = new ProjectService();
