import { codeReviewRepository } from "../repositories/code-review.repository.js";
import { projectService } from "./project.service.js";
import { logger } from "../lib/logger.js";
import { env } from "../env.js";
import type { CodeReview } from "@portfolio/shared";

export class AIReviewService {
    async getLatestReview(projectId: number): Promise<CodeReview | null> {
        return codeReviewRepository.findByProjectId(projectId);
    }

    async triggerReview(projectId: number): Promise<CodeReview> {
        const project = await projectService.getById(projectId);
        if (!project) throw new Error("Project not found");

        // Create a pending review
        const review = await codeReviewRepository.create({
            projectId,
            content: "",
            badges: [],
            status: "processing",
        });

        // Run review in background (fire-and-forget)
        this.runReview(review.id, project).catch((err) => {
            logger.error({ err, projectId }, "AI review failed");
        });

        return review;
    }

    private async runReview(reviewId: number, project: { title: string; description: string; techStack: string[]; githubUrl: string | null }): Promise<void> {
        try {
            const apiKey = env.GEMINI_API_KEY;
            if (!apiKey) {
                await codeReviewRepository.updateStatus(reviewId, "failed", undefined, undefined, "Gemini API key not configured");
                return;
            }

            const prompt = this.buildPrompt(project);
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
                }),
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json() as any;
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No review generated.";

            // Extract badges from content
            const badges: string[] = [];
            if (text.toLowerCase().includes("security")) badges.push("security");
            if (text.toLowerCase().includes("performance")) badges.push("performance");
            if (text.toLowerCase().includes("architecture")) badges.push("architecture");
            if (text.toLowerCase().includes("testing")) badges.push("testing");
            if (text.toLowerCase().includes("accessibility")) badges.push("accessibility");

            await codeReviewRepository.updateStatus(reviewId, "completed", text, badges);
        } catch (err: any) {
            logger.error({ err, reviewId }, "AI review generation failed");
            await codeReviewRepository.updateStatus(reviewId, "failed", undefined, undefined, err.message);
        }
    }

    private buildPrompt(project: { title: string; description: string; techStack: string[]; githubUrl: string | null }): string {
        return `You are a senior software engineer conducting a code review. Analyze the following project and provide a comprehensive review with actionable feedback.

## Project: ${project.title}

**Description:** ${project.description}

**Tech Stack:** ${project.techStack.join(", ")}

${project.githubUrl ? `**GitHub:** ${project.githubUrl}` : ""}

Please provide your review in the following markdown format:

## 🔒 Security
Assess potential security concerns.

## ⚡ Performance
Evaluate performance considerations.

## 🏗️ Architecture
Review architectural decisions and patterns.

## 🧪 Testing
Evaluate testing strategy considerations.

## 💡 Recommendations
List the top 5 actionable improvements.

## 📊 Overall Score
Rate the project on a scale of 1-10 with justification.`;
    }
}

export const aiReviewService = new AIReviewService();
