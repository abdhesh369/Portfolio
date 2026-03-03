import { emailTemplateRepository } from "../repositories/email-template.repository.js";
import type { InsertEmailTemplate, EmailTemplate } from "../../shared/schema.js";
import { redis } from "../lib/redis.js";

const CACHE_KEY = "email_templates";

export class EmailTemplateService {
    async getAll(): Promise<EmailTemplate[]> {
        const cached = await redis?.get(CACHE_KEY);
        if (cached) return JSON.parse(cached);

        const templates = await emailTemplateRepository.getAll();
        await redis?.set(CACHE_KEY, JSON.stringify(templates), "EX", 3600); // 1 hour
        return templates;
    }

    async getById(id: number): Promise<EmailTemplate | null> {
        const templates = await this.getAll();
        const template = templates.find((t) => t.id === id);
        if (template) return template;

        return emailTemplateRepository.getById(id);
    }

    async create(template: InsertEmailTemplate): Promise<EmailTemplate> {
        const created = await emailTemplateRepository.create(template);
        await this.invalidateCache();
        return created;
    }

    async update(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
        const updated = await emailTemplateRepository.update(id, template);
        await this.invalidateCache();
        return updated;
    }

    async delete(id: number): Promise<void> {
        await emailTemplateRepository.delete(id);
        await this.invalidateCache();
    }

    private async invalidateCache() {
        try {
            await redis?.del(CACHE_KEY);
        } catch (error) {
            console.warn("Failed to invalidate email template cache:", error);
        }
    }
}

export const emailTemplateService = new EmailTemplateService();
