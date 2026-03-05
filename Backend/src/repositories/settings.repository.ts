import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { siteSettingsTable, type SiteSettings, type InsertSiteSettings } from "../../shared/schema.js";

export class SettingsRepository {
    async getSettings(): Promise<SiteSettings | null> {
        const [result] = await db
            .select()
            .from(siteSettingsTable)
            .limit(1);
        return result || null;
    }

    async updateSettings(data: InsertSiteSettings): Promise<SiteSettings> {
        const existing = await this.getSettings();

        if (existing) {
            const [updated] = await db
                .update(siteSettingsTable)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(eq(siteSettingsTable.id, existing.id))
                .returning();
            return updated;
        } else {
            const [inserted] = await db
                .insert(siteSettingsTable)
                .values({
                    isOpenToWork: data.isOpenToWork ?? true,
                })
                .returning();
            return inserted;
        }
    }
}

export const settingsRepository = new SettingsRepository();
