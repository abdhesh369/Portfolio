import { Router } from "express";
import { OpenRouter } from "@openrouter/sdk";
import { z } from "zod";
import { db } from "../db.js";
import { articlesTable, projectsTable, skillsTable, experiencesTable } from "../../shared/schema.js";
import { env } from "../env.js";

const chatSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(["user", "model"]),
        parts: z.array(z.object({
            text: z.string()
        }))
    }))
});

export const registerChatRoutes = (router: Router) => {
    router.post("/chat", async (req, res) => {
        try {
            console.log("DEBUG: CHAT ROUTE - OpenRouter Migration");

            const apiKey = process.env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY;

            if (!apiKey) {
                console.error("Chat API Error: OPENROUTER_API_KEY is missing");
                return res.status(500).json({ message: "OpenRouter API key is not configured." });
            }

            const body = chatSchema.safeParse(req.body);
            if (!body.success) {
                return res.status(400).json({ message: "Invalid request body", details: body.error });
            }

            // Fetch context for system prompt
            const [articles, projects, skills, experiences] = await Promise.all([
                db.select().from(articlesTable),
                db.select().from(projectsTable),
                db.select().from(skillsTable),
                db.select().from(experiencesTable),
            ]);

            const systemPrompt = `You are an AI assistant for Abdhesh's professional portfolio.
            Your goal is to answer questions about Abdhesh based on the following information:
            - Skills: ${skills.map(s => s.name).join(", ")}
            - Projects: ${projects.map(p => `${p.title}: ${p.description}`).join("; ")}
            - Experiences: ${experiences.map(e => `${e.role} at ${e.organization}`).join("; ")}
            - Articles: ${articles.map(a => a.title).join(", ")}
            
            Keep responses professional, concise, and helpful. If you don't know something, say so politely.`;

            const openrouter = new OpenRouter({
                apiKey: apiKey
            });

            // Map internal history to OpenRouter messages format { role, content }
            const messages = body.data.messages.map(msg => ({
                role: (msg.role === "model" ? "assistant" : "user") as "assistant" | "user",
                content: msg.parts.map(p => p.text).join("\n")
            }));

            // Prepend system prompt
            const finalMessages = [
                {
                    role: "system" as const,
                    content: systemPrompt
                },
                ...messages
            ];

            console.log("DEBUG: Sending request to OpenRouter (nemotron-nano-12b-v2-vl:free)...");

            const response = await openrouter.chat.send({
                chatGenerationParams: {
                    model: "openai/gpt-oss-120b:free",
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
                message: "Internal server error during chat processing.",
                details: error.message,
                rawError: error.response?.data || error.message
            });
        }
    });
};
