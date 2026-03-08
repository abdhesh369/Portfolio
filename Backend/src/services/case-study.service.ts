import { caseStudyRepository } from "../repositories/case-study.repository.js";
import { projectService } from "./project.service.js";
import { logger } from "../lib/logger.js";
import { env } from "../env.js";
import type { CaseStudy } from "@portfolio/shared";

export class CaseStudyService {
    async getAll(): Promise<CaseStudy[]> {
        return caseStudyRepository.findAll();
    }

    async getPublished(): Promise<CaseStudy[]> {
        return caseStudyRepository.findPublished();
    }

    async getBySlug(slug: string): Promise<CaseStudy | null> {
        return caseStudyRepository.findBySlug(slug);
    }

    async generate(projectId: number): Promise<CaseStudy> {
        const project = await projectService.getById(projectId);
        if (!project) throw new Error("Project not found");

        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API key not configured");

        const prompt = `Generate a detailed case study for the following project. Write in first person as the developer.

## Project: ${project.title}
**Description:** ${project.description}
**Tech Stack:** ${project.techStack.join(", ")}
**Category:** ${project.category}
${project.problemStatement ? `**Problem:** ${project.problemStatement}` : ""}
${project.challenges ? `**Challenges:** ${project.challenges}` : ""}
${project.learnings ? `**Learnings:** ${project.learnings}` : ""}

Generate a comprehensive case study with these sections in markdown:
## Overview
## The Challenge
## My Approach
## Technical Implementation
## Key Learnings
## Results & Impact`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
            }),
        });

        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

        const data = await response.json() as any;
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No case study generated.";

        const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

        return caseStudyRepository.create({
            projectId,
            title: `Case Study: ${project.title}`,
            slug: `${slug}-${Date.now()}`,
            content,
            status: "draft",
            generatedAt: new Date(),
        });
    }

    async update(id: number, data: Partial<{ title: string; content: string; status: string }>): Promise<CaseStudy> {
        return caseStudyRepository.update(id, data);
    }

    async delete(id: number): Promise<void> {
        return caseStudyRepository.delete(id);
    }
}

export const caseStudyService = new CaseStudyService();
