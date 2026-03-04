import { emailTemplateRepository } from "../repositories/email-template.repository.js";
import type { InsertEmailTemplate, EmailTemplate } from "../../shared/schema.js";
import { redis } from "../lib/redis.js";
import { logger } from "../lib/logger.js";

const CACHE_KEY = "email_templates";

export class EmailTemplateService {
    /**
     * Retrieves all email templates, using Redis cache when available.
     * @returns Array of email template objects
     */
    async getAll(): Promise<EmailTemplate[]> {
        const cached = await redis?.get(CACHE_KEY);
        if (cached) return JSON.parse(cached);

        const templates = await emailTemplateRepository.getAll();
        await redis?.set(CACHE_KEY, JSON.stringify(templates), "EX", 3600); // 1 hour
        return templates;
    }

    /**
     * Retrieves a single email template by its ID.
     * @param id - The email template ID
     * @returns The matching email template or null if not found
     */
    async getById(id: number): Promise<EmailTemplate | null> {
        const templates = await this.getAll();
        const template = templates.find((t) => t.id === id);
        if (template) return template;

        return emailTemplateRepository.getById(id);
    }

    /**
     * Creates a new email template.
     * @param template - The email template data to create
     * @returns The newly created email template
     */
    async create(template: InsertEmailTemplate): Promise<EmailTemplate> {
        const created = await emailTemplateRepository.create(template);
        await this.invalidateCache();
        return created;
    }

    /**
     * Updates an existing email template by ID.
     * @param id - The email template ID to update
     * @param template - Partial email template data to apply
     * @returns The updated email template
     */
    async update(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
        const updated = await emailTemplateRepository.update(id, template);
        await this.invalidateCache();
        return updated;
    }

    /**
     * Deletes an email template by ID and invalidates cache.
     * @param id - The email template ID to delete
     */
    async delete(id: number): Promise<void> {
        await emailTemplateRepository.delete(id);
        await this.invalidateCache();
    }

    private async invalidateCache() {
        try {
            await redis?.del(CACHE_KEY);
        } catch (error) {
            logger.warn({ context: "cache", service: "email-template", error }, "Failed to invalidate email template cache");
        }
    }
}

export const emailTemplateService = new EmailTemplateService();
