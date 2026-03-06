import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { db } from "../db.js";
import { siteSettingsTable, type SiteSettings, type InsertSiteSettings } from "@portfolio/shared";

type DbSiteSettings = InferSelectModel<typeof siteSettingsTable>;
type DbInsertSiteSettings = InferInsertModel<typeof siteSettingsTable>;

export class SettingsRepository {
    async getSettings(): Promise<SiteSettings | null> {
        const [result] = await db
            .select()
            .from(siteSettingsTable)
            .limit(1);
        return (result as SiteSettings) || null;
    }

    async updateSettings(data: InsertSiteSettings): Promise<SiteSettings> {
        const existing = await this.getSettings();

        if (existing) {
            const updateData: Partial<DbInsertSiteSettings> = {
                ...data,
                updatedAt: new Date(),
            };

            const [updated] = await db
                .update(siteSettingsTable)
                .set(updateData)
                .where(eq(siteSettingsTable.id, existing.id))
                .returning();
            return updated as SiteSettings;
        } else {
            const insertData: DbInsertSiteSettings = {
                ...data,
                isOpenToWork: data.isOpenToWork ?? true,
            };

            const [inserted] = await db
                .insert(siteSettingsTable)
                .values(insertData)
                .returning();
            return inserted as SiteSettings;
        }
    }
}

export const settingsRepository = new SettingsRepository();
