import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { emailTemplatesTable, type EmailTemplate, type InsertEmailTemplate } from "../../shared/schema.js";

function transformEmailTemplate(dbTemplate: any): EmailTemplate {
    return {
        id: dbTemplate.id,
        name: dbTemplate.name,
        subject: dbTemplate.subject,
        body: dbTemplate.body,
        createdAt: dbTemplate.createdAt,
    };
}

export class EmailTemplateRepository {
    async getAll(): Promise<EmailTemplate[]> {
        const result = await db.select().from(emailTemplatesTable);
        return result.map(transformEmailTemplate);
    }

    async getById(id: number): Promise<EmailTemplate | null> {
        const [result] = await db
            .select()
            .from(emailTemplatesTable)
            .where(eq(emailTemplatesTable.id, id))
            .limit(1);
        return result ? transformEmailTemplate(result) : null;
    }

    async create(template: InsertEmailTemplate): Promise<EmailTemplate> {
        const [inserted] = await db.insert(emailTemplatesTable).values(template).returning();
        if (!inserted) throw new Error("Failed to create email template");
        return transformEmailTemplate(inserted);
    }

    async update(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
        const [updated] = await db
            .update(emailTemplatesTable)
            .set(template)
            .where(eq(emailTemplatesTable.id, id))
            .returning();
        if (!updated) throw new Error(`Email template ${id} not found after update`);
        return transformEmailTemplate(updated);
    }

    async delete(id: number): Promise<void> {
        await db.delete(emailTemplatesTable).where(eq(emailTemplatesTable.id, id));
    }
}

export const emailTemplateRepository = new EmailTemplateRepository();
