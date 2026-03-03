import { eq, asc } from "drizzle-orm";
import { db } from "../db.js";
import { testimonialsTable, type Testimonial, type InsertTestimonial } from "../../shared/schema.js";

export class TestimonialRepository {
    async findAll(): Promise<Testimonial[]> {
        return db.select().from(testimonialsTable).orderBy(asc(testimonialsTable.displayOrder));
    }

    async findById(id: number): Promise<Testimonial | null> {
        const [result] = await db
            .select()
            .from(testimonialsTable)
            .where(eq(testimonialsTable.id, id))
            .limit(1);
        return result || null;
    }

    async create(testimonial: InsertTestimonial): Promise<Testimonial> {
        const [inserted] = await db
            .insert(testimonialsTable)
            .values(testimonial as any)
            .returning();
        if (!inserted) throw new Error("Failed to create testimonial");
        return inserted;
    }

    async update(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial> {
        const [updated] = await db
            .update(testimonialsTable)
            .set(testimonial as any)
            .where(eq(testimonialsTable.id, id))
            .returning();
        if (!updated) throw new Error(`Testimonial with id ${id} not found`);
        return updated;
    }


    async delete(id: number): Promise<void> {
        await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
    }
}

export const testimonialRepository = new TestimonialRepository();
