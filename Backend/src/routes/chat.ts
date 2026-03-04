import { Router } from "express";
import { OpenRouter } from "@openrouter/sdk";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import DOMPurify from 'isomorphic-dompurify';
import { db } from "../db.js";
import { articlesTable, projectsTable, skillsTable, experiencesTable } from "../../shared/schema.js";
import { env } from "../env.js";

import { validateBody } from "../middleware/validate.js";

const MAX_CHAT_MESSAGES = 20; // Sliding window limit to prevent token abuse

const chatSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(["user", "model"]),
        parts: z.array(z.object({
            text: z.string().transform(str => DOMPurify.sanitize(str))
        }))
    }))
});

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
                console.error("Chat API Error: OPENROUTER_API_KEY is missing");
                return res.status(500).json({ message: "OpenRouter API key is not configured." });
            }

            const validatedData = req.body;

            // Fetch context for system prompt
            const [articles, projects, skills, experiences] = await Promise.all([
                db.select().from(articlesTable),
                db.select().from(projectsTable),
                db.select().from(skillsTable),
                db.select().from(experiencesTable),
            ]);

            // Helper to truncate long strings for the prompt
            const truncate = (text: string, maxLen = 500) =>
                text.length > maxLen ? text.slice(0, maxLen) + "..." : text;

            const systemPrompt = `You are an AI assistant for Abdhesh's professional portfolio.
            Your goal is to answer questions about Abdhesh based on the following information:
            - Skills: ${skills.slice(0, 30).map(s => s.name).join(", ")}
            - Projects: ${projects.slice(0, 10).map(p => `${p.title}: ${truncate(p.description || "", 200)}`).join("; ")}
            - Experiences: ${experiences.slice(0, 5).map(e => `${e.role} at ${e.organization}`).join("; ")}
            - Articles: ${articles.slice(0, 10).map(a => a.title).join(", ")}
            
            Keep responses professional, concise, and helpful. If you don't know something, say so politely.`;

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

            return res.json({ message: text });
        } catch (error: any) {
            console.error("Chat API Error:", error);
            if (error.response) {
                console.error("OpenRouter Response Error Data:", JSON.stringify(error.response.data, null, 2));
            }

            if (error.status === 429 || error.message.includes("429")) {
                return res.status(429).json({
                    message: "OpenRouter is currently receiving too many requests. Please try again in 10-15 seconds.",
                    details: "Quota exceeded"
                });
            }

            return res.status(500).json({
                message: "Internal server error during chat processing."
            });
        }
    });
};
