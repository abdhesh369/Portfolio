import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { seoSettingsTable, type SeoSettings, type InsertSeoSettings } from "../../shared/schema.js";

function transformSeoSettings(dbSettings: any): SeoSettings {
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
    };
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

    async create(settings: InsertSeoSettings): Promise<SeoSettings> {
        const [inserted] = await db.insert(seoSettingsTable).values(settings).returning();
        if (!inserted) throw new Error("Failed to create SEO settings");
        return transformSeoSettings(inserted);
    }

    async update(id: number, settings: Partial<InsertSeoSettings>): Promise<SeoSettings> {
        const [updated] = await db
            .update(seoSettingsTable)
            .set({ ...settings, updatedAt: new Date() })
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
