import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { scopeRepository } from "../repositories/scope.repository.js";
import { aiClient } from "../lib/ai.js";
import { env } from "../env.js";
import { logger } from "../lib/logger.js";
import type { ScopeRequest } from "@portfolio/shared";

/**
 * BullMQ Worker for processing project scope estimations.
 */
export function createScopeWorker(connection: Redis) {
    const worker = new Worker("scope", async (job: Job) => {
        const { requestId } = job.data;
        logger.info({ requestId, jobId: job.id }, "Processing scope estimation job");

        const request = await scopeRepository.findById(requestId);
        if (!request) {
            throw new Error(`Scope request with ID ${requestId} not found`);
        }

        // Update status to processing
        await scopeRepository.update(requestId, { status: "processing" });

        try {
            const prompt = constructPrompt(request);
            const estimation = await aiClient.generateJSON<ScopeRequest["estimation"]>(prompt);

            // Save results and mark as completed
            await scopeRepository.update(requestId, {
                estimation,
                status: "completed",
                completedAt: new Date(),
            });

            logger.info({ requestId }, "Scope estimation completed successfully");
            return estimation;
        } catch (error: any) {
            logger.error({ error, requestId }, "Scope estimation failed");
            await scopeRepository.update(requestId, {
                status: "failed",
                error: error.message || "Unknown error during AI generation",
            });
            throw error;
        }
    }, {
        connection: connection as any,
        concurrency: 2, // Limit concurrent AI calls
    });

    worker.on("failed", (job, err) => {
        logger.error({ jobId: job?.id, error: err }, "Scope worker job failed");
    });

    return worker;
}

function constructPrompt(request: ScopeRequest): string {
    return `
    You are an expert technical project manager and software estimator.
    Generate a professional project scope estimation for the following request:

    Project Name: ${request.name}
    Project Type: ${request.projectType || "General Web Application"}
    Description: ${request.description}
    Requested Features: ${request.features.join(", ")}

    ESTIMATION GUIDELINES:
    - Be realistic but optimistic.
    - Currency should be USD.
    - Provide a breakdown of at least 3-4 milestones.
    - Suggest a modern tech stack.
    - High-level summary should be professional and encouraging.

    OUTPUT FORMAT:
    Your output must be a single JSON object with the following structure:
    {
      "summary": "Short professional summary of the project scope",
      "hours": { "min": number, "max": number },
      "cost": { "min": number, "max": number, "currency": "USD" },
      "milestones": [
        { "title": "Discovery & Planning", "duration": "1 week", "description": "Details..." },
        { "title": "Core Development", "duration": "4 weeks", "description": "Details..." }
      ],
      "techSuggestions": ["React", "Node.js", "PostgreSQL", "Tailwind CSS"]
    }
    `;
}
