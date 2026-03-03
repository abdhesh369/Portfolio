import { experienceRepository } from "../repositories/experience.repository.js";
import type { Experience, InsertExperience } from "../../shared/schema.js";

export class ExperienceService {
    async getAll(): Promise<Experience[]> {
        return experienceRepository.findAll();
    }

    async getById(id: number): Promise<Experience | null> {
        return experienceRepository.findById(id);
    }

    async create(data: InsertExperience): Promise<Experience> {
        return experienceRepository.create(data);
    }

    async update(id: number, data: Partial<InsertExperience>): Promise<Experience> {
        return experienceRepository.update(id, data);
    }

    async delete(id: number): Promise<void> {
        await experienceRepository.delete(id);
    }
}

export const experienceService = new ExperienceService();
