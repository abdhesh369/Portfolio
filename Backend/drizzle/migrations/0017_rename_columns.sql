ALTER TABLE "audit_log" RENAME COLUMN "entity_id" TO "entityId";
ALTER TABLE "audit_log" RENAME COLUMN "old_values" TO "oldValues";
ALTER TABLE "audit_log" RENAME COLUMN "new_values" TO "newValues";
ALTER TABLE "audit_log" RENAME COLUMN "created_at" TO "createdAt";

ALTER TABLE "seo_settings" RENAME COLUMN "page_slug" TO "pageSlug";
ALTER TABLE "seo_settings" RENAME COLUMN "meta_title" TO "metaTitle";
ALTER TABLE "seo_settings" RENAME COLUMN "meta_description" TO "metaDescription";
ALTER TABLE "seo_settings" RENAME COLUMN "og_title" TO "ogTitle";
ALTER TABLE "seo_settings" RENAME COLUMN "og_description" TO "ogDescription";
ALTER TABLE "seo_settings" RENAME COLUMN "og_image" TO "ogImage";
ALTER TABLE "seo_settings" RENAME COLUMN "canonical_url" TO "canonicalUrl";
ALTER TABLE "seo_settings" RENAME COLUMN "twitter_card" TO "twitterCard";
ALTER TABLE "seo_settings" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "seo_settings" RENAME COLUMN "updated_at" TO "updatedAt";

ALTER TABLE "skill_connections" RENAME COLUMN "from_skill_id" TO "fromSkillId";
ALTER TABLE "skill_connections" RENAME COLUMN "to_skill_id" TO "toSkillId";
