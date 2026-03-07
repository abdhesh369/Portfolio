import { Router } from "express";
import { OpenRouter } from "@openrouter/sdk";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import DOMPurify from 'isomorphic-dompurify';
import { eq, and } from "drizzle-orm";
import { articlesTable, projectsTable, skillsTable, experiencesTable } from "@portfolio/shared";
import { db } from "../db.js";
import { env } from "../env.js";
import { redis } from "../lib/redis.js";

import { validateBody } from "../middleware/validate.js";
import { logger } from "../lib/logger.js";

const MAX_CHAT_MESSAGES = 20; // Sliding window limit to prevent token abuse
export const CHAT_CACHE_KEY = "chat:system-prompt";
const CHAT_CACHE_TTL = 900; // 15 minutes

const chatSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(["user", "model"]),
        parts: z.array(z.object({
            text: z.string().transform(str => DOMPurify.sanitize(str))
        }))
    }))
});


/**
 * Build the system prompt from DB data, with Redis caching (15-min TTL).
 * Returns cached prompt on hit, queries DB and caches on miss.
 */
export async function buildSystemPrompt(): Promise<string> {
    // Try cache first
    if (redis) {
        try {
            const cached = await redis.get(CHAT_CACHE_KEY);
            if (cached) return cached;
        } catch (err) {
            logger.error({ context: "cache", service: "chat", error: err }, "Redis cache read failed, falling back to DB");
        }
    }

    // Cache miss — fetch from DB (filtered to avoid data leaks)
    const [articles, projects, skills, experiences] = await Promise.all([
        db.select().from(articlesTable).where(eq(articlesTable.status, "published")),
        db.select().from(projectsTable).where(
            and(
                eq(projectsTable.isHidden, false),
                eq(projectsTable.status, "Completed")
            )
        ),
        db.select().from(skillsTable),
        db.select().from(experiencesTable),
    ]);


    const truncate = (text: string, maxLen = 500) =>
        text.length > maxLen ? text.slice(0, maxLen) + "..." : text;

    const systemPrompt = `You are an AI assistant for Abdhesh's professional portfolio.
            Your goal is to answer questions about Abdhesh based on the following information:
            - Skills: ${skills.slice(0, 30).map((s: any) => s.name).join(", ")}
            - Projects: ${projects.slice(0, 10).map((p: any) => `${p.title}: ${truncate(p.description || "", 200)}`).join("; ")}
            - Experiences: ${experiences.slice(0, 5).map((e: any) => `${e.role} at ${e.organization}`).join("; ")}
            - Articles: ${articles.slice(0, 10).map((a: any) => a.title).join(", ")}

            
            Keep responses professional, concise, and helpful. If you don't know something, say so politely.`;

    // Cache the built prompt
    if (redis) {
        try {
            await redis.setex(CHAT_CACHE_KEY, CHAT_CACHE_TTL, systemPrompt);
        } catch (err) {
            logger.error({ context: "cache", service: "chat", error: err }, "Redis cache write failed");
        }
    }

    return systemPrompt;
}

const CHAT_MODELS = [
    "arcee-ai/trinity-large-preview:free",
    "meta-llama/llama-4-scout:free",
    "google/gemma-3-1b-it:free",
];

let openRouterClient: OpenRouter | null = null;

function getOpenRouterClient() {
    if (!openRouterClient) {
        const apiKey = process.env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error(
                "OPENROUTER_API_KEY is not configured. " +
                "Set it in Render Environment Variables or your local .env file."
            );
        }
        openRouterClient = new OpenRouter({ apiKey });
    }
    return openRouterClient;
}

/**
 * Chat Rate Limiter: 20 requests per minute per IP
 */
const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { message: "Too many chat requests. Please wait a moment before sending another message." },
    standardHeaders: true,
    legacyHeaders: false,
});

export const registerChatRoutes = (router: Router) => {
    router.post("/chat", chatLimiter, validateBody(chatSchema), async (req: any, res: any) => {
        try {
            let openrouter: OpenRouter;
            try {
                openrouter = getOpenRouterClient();
            } catch (err: any) {
                logger.error({ context: "chat" }, err.message);
                return res.status(500).json({ message: err.message });
            }

            const validatedData: z.infer<typeof chatSchema> = req.body;

            // Build system prompt (cached in Redis with 15-min TTL)
            let systemPrompt: string;
            try {
                systemPrompt = await buildSystemPrompt();
            } catch (dbErr: any) {
                logger.error({ context: "chat", error: dbErr.message }, "Failed to build system prompt from DB");
                return res.status(503).json({
                    success: false,
                    message: "Chat is temporarily unavailable. Database connection issue."
                });
            }

            // Map internal history to OpenRouter messages format { role, content }
            // Cap to last MAX_CHAT_MESSAGES to prevent token limit abuse
            const allMessages = validatedData.messages.map((msg: any) => ({
                role: (msg.role === "model" ? "assistant" : "user") as "assistant" | "user",
                content: msg.parts.map((p: any) => p.text).join("\n")
            }));
            const messages = allMessages.slice(-MAX_CHAT_MESSAGES);

            // Prepend system prompt
            const finalMessages = [
                {
                    role: "system" as const,
                    content: systemPrompt
                },
                ...messages
            ];

            // Try each model in order until one succeeds
            let lastError: any = null;
            for (const model of CHAT_MODELS) {
                try {
                    const response = await openrouter.chat.send({
                        chatGenerationParams: {
                            model,
                            messages: finalMessages,
                            stream: false
                        }
                    });

                    const text = response.choices?.[0]?.message?.content || "No response generated.";

                    return res.json({ message: text });
                } catch (modelErr: any) {
                    lastError = modelErr;
                    logger.warn({ context: "chat", model, error: modelErr.message }, `Model ${model} failed, trying next`);
                    continue;
                }
            }

            // All models failed
            logger.error({ context: "chat", error: lastError?.message }, "All chat models failed");
            throw lastError;
        } catch (error: any) {
            logger.error({
                context: "chat",
                error: error.message,
                responseData: error.response?.data
            }, "Chat API Error");

            if (error.status === 429 || error.message.includes("429")) {
                return res.status(429).json({
                    success: false,
                    message: "OpenRouter is currently receiving too many requests. Please try again in 10-15 seconds.",
                    details: "Quota exceeded"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal server error during chat processing."
            });
        }
    });
};
