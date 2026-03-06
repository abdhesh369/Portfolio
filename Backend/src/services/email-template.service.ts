import { emailTemplateRepository } from "../repositories/email-template.repository.js";
import type { InsertEmailTemplate, EmailTemplate } from "@portfolio/shared";
import { CacheService } from "../lib/cache.js";

const FEATURE = "email";
const NAMESPACE = "templates";
const CACHE_TTL = 3600;

export class EmailTemplateService {
    /**
     * Retrieves all email templates, using Redis cache when available.
     * @returns Array of email template objects
     */
    async getAll(): Promise<EmailTemplate[]> {
        const key = CacheService.key(FEATURE, NAMESPACE);
        return CacheService.getOrSet(key, CACHE_TTL, () => emailTemplateRepository.getAll());
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
        const key = CacheService.key(FEATURE, NAMESPACE);
        await CacheService.invalidate(key);
    }
}

export const emailTemplateService = new EmailTemplateService();
