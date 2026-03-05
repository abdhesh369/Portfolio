import { Router } from "express";
import { OpenRouter } from "@openrouter/sdk";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import DOMPurify from 'isomorphic-dompurify';
import { db } from "../db.js";
import { articlesTable, projectsTable, skillsTable, experiencesTable } from "../../shared/schema.js";
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

    // Cache miss — fetch from DB
    const [articles, projects, skills, experiences] = await Promise.all([
        db.select().from(articlesTable),
        db.select().from(projectsTable),
        db.select().from(skillsTable),
        db.select().from(experiencesTable),
    ]);

    const truncate = (text: string, maxLen = 500) =>
        text.length > maxLen ? text.slice(0, maxLen) + "..." : text;

    const systemPrompt = `You are an AI assistant for Abdhesh's professional portfolio.
            Your goal is to answer questions about Abdhesh based on the following information:
            - Skills: ${skills.slice(0, 30).map(s => s.name).join(", ")}
            - Projects: ${projects.slice(0, 10).map(p => `${p.title}: ${truncate(p.description || "", 200)}`).join("; ")}
            - Experiences: ${experiences.slice(0, 5).map(e => `${e.role} at ${e.organization}`).join("; ")}
            - Articles: ${articles.slice(0, 10).map(a => a.title).join(", ")}
            
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
    router.post("/chat", chatLimiter, validateBody(chatSchema), async (req, res) => {
        try {
            const apiKey = process.env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY;

            if (!apiKey) {
                logger.error({ context: "chat" }, "OPENROUTER_API_KEY is missing");
                return res.status(500).json({ message: "OpenRouter API key is not configured." });
            }

            const validatedData: z.infer<typeof chatSchema> = req.body;

            // Build system prompt (cached in Redis with 15-min TTL)
            const systemPrompt = await buildSystemPrompt();

            const openrouter = new OpenRouter({
                apiKey: apiKey
            });

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



            const response = await openrouter.chat.send({
                chatGenerationParams: {
                    model: "arcee-ai/trinity-large-preview:free",
                    messages: finalMessages,
                    stream: false // Using non-streaming for the unified response
                }
            });

            // Handle the response based on SDK structure
            // Usually response.choices[0].message.content
            const text = response.choices?.[0]?.message?.content || "No response generated.";

            return res.json({
                success: true,
                message: "Response generated successfully",
                data: { message: text }
            });
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
