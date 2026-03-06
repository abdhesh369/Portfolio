import { eq, asc, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { db } from "../db.js";
import { testimonialsTable, type Testimonial, type InsertTestimonial } from "@portfolio/shared";

type DbTestimonial = InferSelectModel<typeof testimonialsTable>;
type DbInsertTestimonial = InferInsertModel<typeof testimonialsTable>;

export class TestimonialRepository {
    private transformTestimonial(t: DbTestimonial): Testimonial {
        return {
            ...t,
            avatarUrl: t.avatarUrl ?? null,
            linkedinUrl: t.linkedinUrl ?? null,
        };
    }

    async findAll(): Promise<Testimonial[]> {
        const results = await db.select().from(testimonialsTable).orderBy(asc(testimonialsTable.displayOrder));
        return results.map(t => this.transformTestimonial(t));
    }

    async findById(id: number): Promise<Testimonial | null> {
        const [result] = await db
            .select()
            .from(testimonialsTable)
            .where(eq(testimonialsTable.id, id))
            .limit(1);
        return result ? this.transformTestimonial(result) : null;
    }

    async create(data: InsertTestimonial): Promise<Testimonial> {
        const testimonialData: DbInsertTestimonial = {
            ...data,
            avatarUrl: data.avatarUrl ?? null,
            linkedinUrl: data.linkedinUrl ?? null,
        };

        const [inserted] = await db
            .insert(testimonialsTable)
            .values(testimonialData)
            .returning();
        if (!inserted) throw new Error("Failed to create testimonial");
        return this.transformTestimonial(inserted);
    }

    async update(id: number, data: Partial<InsertTestimonial>): Promise<Testimonial> {
        const testimonialData: Partial<DbInsertTestimonial> = {
            ...data,
            avatarUrl: data.avatarUrl ?? undefined,
            linkedinUrl: data.linkedinUrl ?? undefined,
        };

        const [updated] = await db
            .update(testimonialsTable)
            .set(testimonialData)
            .where(eq(testimonialsTable.id, id))
            .returning();
        if (!updated) throw new Error(`Testimonial with id ${id} not found`);
        return this.transformTestimonial(updated);
    }

    async delete(id: number): Promise<void> {
        await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
    }
}

export const testimonialRepository = new TestimonialRepository();
