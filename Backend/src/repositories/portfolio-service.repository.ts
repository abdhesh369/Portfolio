import { eq, asc } from "drizzle-orm";
import { db } from "../db.js";
import { servicesTable, type Service, type InsertService } from "../../shared/schema.js";

export class PortfolioServiceRepository {
    private transformService(service: any): Service {
        return {
            ...service,
            tags: (service.tags as string[]) || [],
        };
    }

    async findAll(): Promise<Service[]> {
        const results = await db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder));
        return results.map(s => this.transformService(s));
    }

    async findById(id: number): Promise<Service | null> {
        const [result] = await db
            .select()
            .from(servicesTable)
            .where(eq(servicesTable.id, id))
            .limit(1);
        return result ? this.transformService(result) : null;
    }

    async create(service: InsertService): Promise<Service> {
        const [inserted] = await db
            .insert(servicesTable)
            .values(service as any)
            .returning();
        if (!inserted) throw new Error("Failed to create portfolio service");
        return this.transformService(inserted);
    }

    async update(id: number, service: Partial<InsertService>): Promise<Service> {
        const [updated] = await db
            .update(servicesTable)
            .set(service as any)
            .where(eq(servicesTable.id, id))
            .returning();
        if (!updated) throw new Error(`Portfolio service with id ${id} not found`);
        return this.transformService(updated);
    }

    async delete(id: number): Promise<void> {
        await db.delete(servicesTable).where(eq(servicesTable.id, id));
    }
}

export const portfolioServiceRepository = new PortfolioServiceRepository();
