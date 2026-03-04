import { articleRepository } from "../src/repositories/article.repository.js";
import { db } from "../src/db.js";
import { articlesTable } from "../shared/schema.js";

async function verify() {
    console.log("--- Drizzle ORM Fix Verification ---");

    try {
        const all = await articleRepository.findAll();
        const published = await articleRepository.findAll('published');
        const drafts = await articleRepository.findAll('draft');

        console.log(`Total articles: ${all.length}`);
        console.log(`Published articles: ${published.length}`);
        console.log(`Draft articles: ${drafts.length}`);

        const draftCountInPublished = published.filter(a => a.status === 'draft').length;
        const publishedCountInDrafts = drafts.filter(a => a.status === 'published').length;

        if (draftCountInPublished > 0) {
            console.error("FAIL: Published list contains drafts!");
        } else if (publishedCountInDrafts > 0) {
            console.error("FAIL: Drafts list contains published articles!");
        } else if (status && published.length + drafts.length !== all.length) {
            // Note: this assumes all articles are either 'published' or 'draft'
            console.log("Note: published + drafts count differs from total. Check if other statuses exist.");
        } else {
            console.log("SUCCESS: Article filtering works as expected.");
        }
    } catch (error) {
        console.error("Verification failed with error:", error);
    } finally {
        process.exit(0);
    }
}

verify();
