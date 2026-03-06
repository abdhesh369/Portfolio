import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { db } from "../db.js";
import { emailTemplatesTable, type EmailTemplate, type InsertEmailTemplate } from "../../shared/schema.js";

type DbEmailTemplate = InferSelectModel<typeof emailTemplatesTable>;
type DbInsertEmailTemplate = InferInsertModel<typeof emailTemplatesTable>;

function transformEmailTemplate(dbTemplate: DbEmailTemplate): EmailTemplate {
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

    async create(data: InsertEmailTemplate): Promise<EmailTemplate> {
        const templateData: DbInsertEmailTemplate = {
            ...data,
        };

        const [inserted] = await db.insert(emailTemplatesTable).values(templateData).returning();
        if (!inserted) throw new Error("Failed to create email template");
        return transformEmailTemplate(inserted);
    }

    async update(id: number, data: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
        const templateData: Partial<DbInsertEmailTemplate> = {
            ...data,
        };

        const [updated] = await db
            .update(emailTemplatesTable)
            .set(templateData)
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
