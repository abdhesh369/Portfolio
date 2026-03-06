import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { db } from "../db.js";
import { seoSettingsTable, type SeoSettings, type InsertSeoSettings } from "@portfolio/shared";

type DbSeoSettings = InferSelectModel<typeof seoSettingsTable>;
type DbInsertSeoSettings = InferInsertModel<typeof seoSettingsTable>;

function transformSeoSettings(dbSettings: DbSeoSettings): SeoSettings {
    return {
        id: dbSettings.id,
        pageSlug: dbSettings.pageSlug,
        metaTitle: dbSettings.metaTitle,
        metaDescription: dbSettings.metaDescription,
        ogTitle: dbSettings.ogTitle,
        ogDescription: dbSettings.ogDescription,
        ogImage: dbSettings.ogImage,
        keywords: dbSettings.keywords,
        canonicalUrl: dbSettings.canonicalUrl,
        noindex: dbSettings.noindex,
        twitterCard: dbSettings.twitterCard,
        createdAt: dbSettings.createdAt,
        updatedAt: dbSettings.updatedAt,
    } as SeoSettings;
}

export class SeoSettingsRepository {
    async getAll(): Promise<SeoSettings[]> {
        const result = await db.select().from(seoSettingsTable);
        return result.map(transformSeoSettings);
    }

    async getBySlug(slug: string): Promise<SeoSettings | null> {
        const [result] = await db
            .select()
            .from(seoSettingsTable)
            .where(eq(seoSettingsTable.pageSlug, slug))
            .limit(1);
        return result ? transformSeoSettings(result) : null;
    }

    async create(data: InsertSeoSettings): Promise<SeoSettings> {
        const settingsData: DbInsertSeoSettings = {
            ...data,
        };

        const [inserted] = await db.insert(seoSettingsTable).values(settingsData).returning();
        if (!inserted) throw new Error("Failed to create SEO settings");
        return transformSeoSettings(inserted);
    }

    async update(id: number, data: Partial<InsertSeoSettings>): Promise<SeoSettings> {
        const settingsData: Partial<DbInsertSeoSettings> = {
            ...data,
            updatedAt: new Date(),
        };

        const [updated] = await db
            .update(seoSettingsTable)
            .set(settingsData)
            .where(eq(seoSettingsTable.id, id))
            .returning();
        if (!updated) throw new Error(`SEO settings ${id} not found after update`);
        return transformSeoSettings(updated);
    }

    async delete(id: number): Promise<void> {
        await db.delete(seoSettingsTable).where(eq(seoSettingsTable.id, id));
    }
}

export const seoSettingsRepository = new SeoSettingsRepository();
