import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { db } from "../db.js";
import { articlesTable, articleTagsTable, type Article, type InsertArticle } from "../../shared/schema.js";

export class ArticleRepository {
    async findAll(status?: string): Promise<Article[]> {
        const query = db.select().from(articlesTable);
        if (status) {
            // Error handling for drizzle types
            query.where(eq(articlesTable.status, status as any));
        }
        const results = await query.orderBy(desc(articlesTable.publishedAt), desc(articlesTable.createdAt));

        const articlesWithTags = await Promise.all(results.map(async (article) => {
            const tags = await db.select().from(articleTagsTable).where(eq(articleTagsTable.articleId, article.id));
            return {
                ...article,
                tags: tags.map(t => t.tag)
            } as Article;
        }));

        return articlesWithTags;
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
}

export const articleRepository = new ArticleRepository();
