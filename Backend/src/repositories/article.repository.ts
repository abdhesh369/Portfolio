import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { db } from "../db.js";
import { articlesTable, articleTagsTable, type Article, type InsertArticle } from "../../shared/schema.js";

export class ArticleRepository {
    async findAll(status?: string): Promise<Article[]> {
        const baseQuery = status
            ? db.select().from(articlesTable).where(eq(articlesTable.status, status as any))
            : db.select().from(articlesTable);
        const results = await baseQuery.orderBy(desc(articlesTable.publishedAt), desc(articlesTable.createdAt));
        if (results.length === 0) return [];

        // Batch fetch all tags for the articles
        const allTags = await db.select()
            .from(articleTagsTable)
            .where(inArray(articleTagsTable.articleId, results.map(a => a.id)));

        const tagsMap = new Map<number, string[]>();
        for (const t of allTags) {
            if (!tagsMap.has(t.articleId)) tagsMap.set(t.articleId, []);
            tagsMap.get(t.articleId)!.push(t.tag);
        }

        return results.map(a => ({
            ...a,
            tags: tagsMap.get(a.id) ?? []
        })) as Article[];
    }

    async findBySlug(slug: string): Promise<Article | null> {
        const [article] = await db.select().from(articlesTable).where(eq(articlesTable.slug, slug)).limit(1);
        if (!article) return null;

        const tags = await db.select().from(articleTagsTable).where(eq(articleTagsTable.articleId, article.id));
        return {
            ...article,
            tags: tags.map(t => t.tag)
        } as Article;
    }

    async findById(id: number): Promise<Article | null> {
        const [article] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
        if (!article) return null;

        const tags = await db.select().from(articleTagsTable).where(eq(articleTagsTable.articleId, article.id));
        return {
            ...article,
            tags: tags.map(t => t.tag)
        } as Article;
    }

    async findByIds(ids: number[]): Promise<Article[]> {
        if (ids.length === 0) return [];

        const results = await db.select().from(articlesTable).where(inArray(articlesTable.id, ids));
        if (results.length === 0) return [];

        // Batch fetch all tags for these articles
        const allTags = await db.select()
            .from(articleTagsTable)
            .where(inArray(articleTagsTable.articleId, ids));

        const tagsMap = new Map<number, string[]>();
        for (const t of allTags) {
            if (!tagsMap.has(t.articleId)) tagsMap.set(t.articleId, []);
            tagsMap.get(t.articleId)!.push(t.tag);
        }

        return results.map(a => ({
            ...a,
            tags: tagsMap.get(a.id) ?? []
        })) as Article[];
    }

    async create(data: InsertArticle & { tags?: string[] }): Promise<Article> {
        const { tags, ...articleData } = data;

        return await db.transaction(async (tx) => {
            const [inserted] = await tx.insert(articlesTable).values(articleData as any).returning();
            if (!inserted) throw new Error("Failed to create article");

            if (tags && tags.length > 0) {
                await tx.insert(articleTagsTable).values(
                    tags.map(tag => ({ articleId: inserted.id, tag }))
                );
            }

            return { ...inserted, tags: tags || [] } as Article;
        });
    }

    async update(id: number, data: Partial<InsertArticle> & { tags?: string[] }): Promise<Article> {
        const { tags, ...articleData } = data;

        return await db.transaction(async (tx) => {
            const [updated] = await tx.update(articlesTable).set(articleData as any).where(eq(articlesTable.id, id)).returning();
            if (!updated) throw new Error(`Article with id ${id} not found`);

            if (tags !== undefined) {
                await tx.delete(articleTagsTable).where(eq(articleTagsTable.articleId, id));
                if (tags.length > 0) {
                    await tx.insert(articleTagsTable).values(
                        tags.map(tag => ({ articleId: id, tag }))
                    );
                }
            }

            const currentTags = await tx.select().from(articleTagsTable).where(eq(articleTagsTable.articleId, id));
            return { ...updated, tags: currentTags.map(t => t.tag) } as Article;
        });
    }

    async delete(id: number): Promise<void> {
        await db.delete(articlesTable).where(eq(articlesTable.id, id));
    }

    async bulkDelete(ids: number[]): Promise<void> {
        if (ids.length === 0) return;
        await db.delete(articlesTable).where(inArray(articlesTable.id, ids));
    }

    async incrementViewCount(id: number): Promise<void> {
        await db.update(articlesTable)
            .set({ viewCount: sql`${articlesTable.viewCount} + 1` })
            .where(eq(articlesTable.id, id));
    }

    async search(query: string, limit: number = 10): Promise<Article[]> {
        const tsQuery = query.trim().split(/\s+/).join(' & ');

        const results = await db.execute(sql`
            SELECT a.*, ts_rank(a.search_vector, to_tsquery('english', ${tsQuery})) AS rank
            FROM articles a
            WHERE a.status = 'published'
              AND a.search_vector @@ to_tsquery('english', ${tsQuery})
            ORDER BY rank DESC
            LIMIT ${limit}
        `);

        if (!results.rows || results.rows.length === 0) return [];

        const articles = results.rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            content: r.content,
            excerpt: r.excerpt,
            featuredImage: r.featuredImage,
            status: r.status,
            publishedAt: r.publishedAt ? new Date(r.publishedAt) : null,
            viewCount: r.viewCount,
            readTimeMinutes: r.readTimeMinutes,
            metaTitle: r.metaTitle,
            metaDescription: r.metaDescription,
            authorId: r.authorId,
            featuredImageAlt: r.featuredImageAlt,
            createdAt: new Date(r.createdAt),
            updatedAt: new Date(r.updatedAt),
        })) as Article[];

        // Fetch tags for results
        const ids = articles.map(a => a.id);
        if (ids.length > 0) {
            const allTags = await db.select().from(articleTagsTable).where(inArray(articleTagsTable.articleId, ids));
            const tagsMap = new Map<number, string[]>();
            for (const t of allTags) {
                if (!tagsMap.has(t.articleId)) tagsMap.set(t.articleId, []);
                tagsMap.get(t.articleId)!.push(t.tag);
            }
            return articles.map(a => ({ ...a, tags: tagsMap.get(a.id) ?? [] }));
        }

        return articles;
    }

    async findRelated(articleId: number, limit: number = 3): Promise<Article[]> {
        // Query to find articles with overlapping tags using a specialized SQL join
        // Using sql.raw carefully or structured sql template
        const relatedResults = await db.execute(sql`
            SELECT a.*, COUNT(at2.tag) as score
            FROM articles a
            JOIN article_tags at1 ON at1."articleId" = ${articleId}
            JOIN article_tags at2 ON at2."articleId" = a.id AND at2.tag = at1.tag
            WHERE a.id != ${articleId} AND a.status = 'published'
            GROUP BY a.id, a.title, a.slug, a.content, a.excerpt, a."featuredImage", a.status, a."publishedAt", a."viewCount", a."readTimeMinutes", a."metaTitle", a."metaDescription", a."authorId", a."featuredImageAlt", a."createdAt", a."updatedAt"
            ORDER BY score DESC, a."publishedAt" DESC
            LIMIT ${limit}
        `);

        if (!relatedResults.rows || relatedResults.rows.length === 0) return [];

        // Map results if column names differ from schema (snake_case to camelCase)
        // Drizzle usually handles this but execute() returns raw rows
        const results = relatedResults.rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            content: r.content,
            excerpt: r.excerpt,
            featuredImage: r.featuredImage,
            status: r.status,
            publishedAt: r.publishedAt ? new Date(r.publishedAt) : null,
            viewCount: r.viewCount,
            readTimeMinutes: r.readTimeMinutes,
            metaTitle: r.metaTitle,
            metaDescription: r.metaDescription,
            authorId: r.authorId,
            featuredImageAlt: r.featuredImageAlt,
            createdAt: new Date(r.createdAt),
            updatedAt: new Date(r.updatedAt),
        })) as Article[];

        // Fetch tags for results
        const ids = results.map(r => r.id);
        const allTags = await db.select().from(articleTagsTable).where(inArray(articleTagsTable.articleId, ids));

        const tagsMap = new Map<number, string[]>();
        for (const t of allTags) {
            if (!tagsMap.has(t.articleId)) tagsMap.set(t.articleId, []);
            tagsMap.get(t.articleId)!.push(t.tag);
        }

        return results.map(r => ({ ...r, tags: tagsMap.get(r.id) ?? [] }));
    }
}

export const articleRepository = new ArticleRepository();
