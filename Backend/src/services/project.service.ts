import { projectRepository } from "../repositories/project.repository.js";
import { CHAT_CACHE_KEY } from "../routes/chat.js";
import type { Project, InsertProject } from "@portfolio/shared";
import { CacheService } from "../lib/cache.js";
import { logger } from "../lib/logger.js";
import { aiClient } from "../lib/ai.js";

const FEATURE = "project";
const LIST_NAMESPACE = "list";
const ITEM_NAMESPACE = "item";
const CACHE_TTL = 3600;

export class ProjectService {
    /**
     * Retrieves all projects, using Redis cache when available.
     * @param sortBy - How to sort the results ('views' | 'default')
     * @returns Array of project objects
     */
    async getAll(sortBy: 'views' | 'default' = 'default'): Promise<Project[]> {
        const key = CacheService.key(FEATURE, LIST_NAMESPACE, sortBy);
        return CacheService.getOrSet(key, CACHE_TTL, () => projectRepository.findAll(sortBy));
    }

    /**
     * Retrieves a single project by its ID.
     * @param id - The project ID
     * @returns The matching project or null if not found
     */
    async getById(id: number): Promise<Project | null> {
        const key = CacheService.key(FEATURE, ITEM_NAMESPACE, id);
        return CacheService.getOrSet(key, CACHE_TTL, () => projectRepository.findById(id));
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
        await this.invalidateCache(id);
        return project;
    }

    /**
     * Deletes a project by ID and invalidates related caches.
     * @param id - The project ID to delete
     */
    async delete(id: number): Promise<void> {
        await projectRepository.delete(id);
        await this.invalidateCache(id);
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

    private async invalidateCache(id?: number) {
        try {
            const listKey = CacheService.key(FEATURE, LIST_NAMESPACE);
            const keys = [listKey, CHAT_CACHE_KEY];
            if (id !== undefined) {
                keys.push(CacheService.key(FEATURE, ITEM_NAMESPACE, id));
            }
            await CacheService.invalidate(...keys);
        } catch (err) {
            logger.error({ err, id, feature: FEATURE }, "Failed to invalidate cache");
        }
    }

    /**
     * Increments the view count for a project.
     * @param id - The project ID to increment views for
     */
    async incrementViewCount(id: number): Promise<void> {
        await projectRepository.incrementViewCount(id);
    }

    /**
     * Generates an AI summary for a project.
     * @param id - The project ID to generate summary for
     * @returns The generated summary
     */
    async generateSummary(id: number): Promise<string> {
        const project = await this.getById(id);
        if (!project) {
            throw new Error("Project not found");
        }

        const prompt = `
            Summarize the following project in exactly two impactful sentences.
            Focus on the "what" and the "impact".
            
            Project Title: ${project.title}
            Full Description: ${project.description}
            Tech Stack: ${project.techStack.join(", ")}
            ${project.problemStatement ? `Problem Statement: ${project.problemStatement}` : ""}
            ${project.impact ? `Impact: ${project.impact}` : ""}
            
            Summary:
        `;

        const summary = await aiClient.generateContent(prompt);
        await this.update(id, { summary });
        return summary;
    }
}

export const projectService = new ProjectService();
