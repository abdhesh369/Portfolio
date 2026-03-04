import { articleRepository } from "../src/repositories/article.repository.js";
import { db } from "../src/db.js";
import { articlesTable, articleTagsTable } from "../shared/schema.js";
import { eq } from "drizzle-orm";

async function verifyRelated() {
    console.log("--- Related Articles Fix Verification ---");
    try {
        // 1. Cleanup & Setup
        await db.delete(articleTagsTable);
        await db.delete(articlesTable);

        const [a1] = await db.insert(articlesTable).values({
            title: "Article 1",
            slug: "article-1",
            content: "Content 1",
            status: "published",
        }).returning();

        const [a2] = await db.insert(articlesTable).values({
            title: "Article 2",
            slug: "article-2",
            content: "Content 2",
            status: "published",
        }).returning();

        const [a3] = await db.insert(articlesTable).values({
            title: "Article 3",
            slug: "article-3",
            content: "Content 3",
            status: "published",
        }).returning();

        // Add shared tags
        await db.insert(articleTagsTable).values([
            { articleId: a1.id, tag: "tech" },
            { articleId: a2.id, tag: "tech" },
            { articleId: a1.id, tag: "web" },
            { articleId: a3.id, tag: "web" },
        ]);

        console.log("Setup complete. Fetching related for Article 1...");

        const related = await articleRepository.findRelated(a1.id, 5);

        console.log(`Found ${related.length} related articles.`);
        related.forEach(r => console.log(`- ${r.title} (ID: ${r.id})`));

        if (related.length === 2 && related.some(r => r.id === a2.id) && related.some(r => r.id === a3.id)) {
            console.log("SUCCESS: findRelated query works correctly with camelCase columns.");
        } else {
            console.error("FAILURE: findRelated did not return expected articles.");
        }

    } catch (error: any) {
        console.error("Verification failed:", error.message);
    } finally {
        process.exit(0);
    }
}

verifyRelated();
