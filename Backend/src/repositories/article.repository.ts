import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { db } from "../db.js";
import { articlesTable, articleTagsTable, type Article, type InsertArticle } from "../../shared/schema.js";
import type { InferInsertModel } from "drizzle-orm";

type DbInsertArticle = InferInsertModel<typeof articlesTable>;

export class ArticleRepository {
    async findAll(status?: Article["status"]): Promise<Article[]> {
        const baseQuery = status
            ? db.select().from(articlesTable).where(eq(articlesTable.status, status))
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
        const { tags, ...apiData } = data;

        // Map API data to DB data
        const articleData: DbInsertArticle = {
            ...apiData,
            slug: apiData.slug!, // Ensure slug is present, or it will fail at DB level anyway
            publishedAt: apiData.publishedAt ? new Date(apiData.publishedAt) : null,
        };

        return await db.transaction(async (tx) => {
            const [inserted] = await tx.insert(articlesTable).values(articleData).returning();
            if (!inserted) throw new Error("Failed to create article");

            if (tags && tags.length > 0) {
                await tx.insert(articleTagsTable).values(
                    tags.map(tag => ({ articleId: inserted.id, tag }))
                );
            }

            return {
                ...inserted,
                tags: tags || [],
                authorId: inserted.authorId ?? undefined,
                featuredImage: inserted.featuredImage ?? undefined,
                featuredImageAlt: inserted.featuredImageAlt ?? undefined,
                excerpt: inserted.excerpt ?? undefined,
                metaTitle: inserted.metaTitle ?? undefined,
                metaDescription: inserted.metaDescription ?? undefined,
            };
        });
    }

    async update(id: number, data: Partial<InsertArticle> & { tags?: string[] }): Promise<Article> {
        const { tags, ...apiData } = data;

        // Map API data to DB data for updates
        const articleData: Partial<DbInsertArticle> = {
            ...apiData,
            publishedAt: apiData.publishedAt ? new Date(apiData.publishedAt) : apiData.publishedAt === null ? null : undefined,
        };

        return await db.transaction(async (tx) => {
            const [updated] = await tx.update(articlesTable).set(articleData).where(eq(articlesTable.id, id)).returning();
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
            return {
                ...updated,
                tags: currentTags.map(t => t.tag),
                authorId: updated.authorId ?? undefined,
                featuredImage: updated.featuredImage ?? undefined,
                featuredImageAlt: updated.featuredImageAlt ?? undefined,
                excerpt: updated.excerpt ?? undefined,
                metaTitle: updated.metaTitle ?? undefined,
                metaDescription: updated.metaDescription ?? undefined,
            };
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
        interface RawArticleRow {
            id: number;
            title: string;
            slug: string;
            content: string;
            excerpt: string | null;
            featuredImage: string | null;
            status: Article["status"];
            publishedAt: string | Date | null;
            viewCount: number;
            readTimeMinutes: number;
            metaTitle: string | null;
            metaDescription: string | null;
            authorId: number | null;
            featuredImageAlt: string | null;
            createdAt: string | Date;
            updatedAt: string | Date;
            rank: number;
        }

        const results = await db.execute(sql`
            SELECT a.*, ts_rank(a.search_vector, plainto_tsquery('english', ${query})) AS rank
            FROM articles a
            WHERE a.status = 'published'
              AND a.search_vector @@ plainto_tsquery('english', ${query})
            ORDER BY rank DESC
            LIMIT ${limit}
        `);

        if (!results.rows || results.rows.length === 0) return [];

        const articles = (results.rows as unknown as RawArticleRow[]).map((r) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            content: r.content,
            excerpt: r.excerpt ?? undefined,
            featuredImage: r.featuredImage ?? undefined,
            status: r.status,
            publishedAt: r.publishedAt ? new Date(r.publishedAt) : null,
            viewCount: r.viewCount,
            readTimeMinutes: r.readTimeMinutes,
            metaTitle: r.metaTitle ?? undefined,
            metaDescription: r.metaDescription ?? undefined,
            authorId: r.authorId ?? undefined,
            featuredImageAlt: r.featuredImageAlt ?? undefined,
            createdAt: new Date(r.createdAt),
            updatedAt: new Date(r.updatedAt),
        }));

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
        interface RelatedArticleRow {
            id: number;
            title: string;
            slug: string;
            content: string;
            excerpt: string | null;
            featuredImage: string | null;
            status: Article["status"];
            publishedAt: string | Date | null;
            viewCount: number;
            readTimeMinutes: number;
            metaTitle: string | null;
            metaDescription: string | null;
            authorId: number | null;
            featuredImageAlt: string | null;
            createdAt: string | Date;
            updatedAt: string | Date;
            score: number;
        }

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

        const results = (relatedResults.rows as unknown as RelatedArticleRow[]).map((r) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            content: r.content,
            excerpt: r.excerpt ?? undefined,
            featuredImage: r.featuredImage ?? undefined,
            status: r.status,
            publishedAt: r.publishedAt ? new Date(r.publishedAt) : null,
            viewCount: r.viewCount,
            readTimeMinutes: r.readTimeMinutes,
            metaTitle: r.metaTitle ?? undefined,
            metaDescription: r.metaDescription ?? undefined,
            authorId: r.authorId ?? undefined,
            featuredImageAlt: r.featuredImageAlt ?? undefined,
            createdAt: new Date(r.createdAt),
            updatedAt: new Date(r.updatedAt),
        }));

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
