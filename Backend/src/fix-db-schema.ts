import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    const client = await pool.connect();
    try {
        console.log("Starting DB Schema Fix...");

        const renameColumn = async (table: string, oldCol: string, newCol: string) => {
            try {
                await client.query(`ALTER TABLE "${table}" RENAME COLUMN "${oldCol}" TO "${newCol}"`);
                console.log(`✓ Renamed ${table}.${oldCol} to ${newCol}`);
            } catch (err: any) {
                if (err.message.includes("does not exist")) {
                    console.log(`- ${table}.${oldCol} does not exist (already renamed?)`);
                } else {
                    console.error(`✗ Error renaming ${table}.${oldCol}:`, err.message);
                }
            }
        };

        // seo_settings
        await renameColumn("seo_settings", "page_slug", "pageSlug");
        await renameColumn("seo_settings", "meta_title", "metaTitle");
        await renameColumn("seo_settings", "meta_description", "metaDescription");
        await renameColumn("seo_settings", "og_title", "ogTitle");
        await renameColumn("seo_settings", "og_description", "ogDescription");
        await renameColumn("seo_settings", "og_image", "ogImage");
        await renameColumn("seo_settings", "canonical_url", "canonicalUrl");
        await renameColumn("seo_settings", "twitter_card", "twitterCard");
        await renameColumn("seo_settings", "created_at", "createdAt");
        await renameColumn("seo_settings", "updated_at", "updatedAt");

        // skill_connections
        await renameColumn("skill_connections", "from_skill_id", "fromSkillId");
        await renameColumn("skill_connections", "to_skill_id", "toSkillId");

        // projects
        await renameColumn("projects", "isFlagship", "isflagship");
        await renameColumn("projects", "display_order", "displayOrder");
        await renameColumn("projects", "image_url", "imageUrl");
        await renameColumn("projects", "github_url", "githubUrl");
        await renameColumn("projects", "live_url", "liveUrl");
        await renameColumn("projects", "view_count", "viewCount");
        await renameColumn("projects", "created_at", "createdAt");
        await renameColumn("projects", "updated_at", "updatedAt");

        // articles
        await renameColumn("articles", "featured_image", "featuredImage");
        await renameColumn("articles", "published_at", "publishedAt");
        await renameColumn("articles", "view_count", "viewCount");
        await renameColumn("articles", "read_time_minutes", "readTimeMinutes");
        await renameColumn("articles", "author_id", "authorId");
        await renameColumn("articles", "featured_image_alt", "featuredImageAlt");
        await renameColumn("articles", "created_at", "createdAt");
        await renameColumn("articles", "updated_at", "updatedAt");
        
        // Ensure reactions exists
        try {
            await client.query(`ALTER TABLE "articles" ADD COLUMN "reactions" JSONB DEFAULT '{}'::jsonb NOT NULL`);
            console.log("✓ Added reactions to articles");
        } catch (err: any) {
            if (err.code === '42701') console.log("- articles.reactions already exists");
            else console.error("✗ Error adding articles.reactions:", err.message);
        }

        // site_settings
        await renameColumn("site_settings", "is_open_to_work", "isOpenToWork");
        await renameColumn("site_settings", "updated_at", "updatedAt");

    } finally {
        client.release();
        await pool.end();
    }
}

run().catch(console.error);
