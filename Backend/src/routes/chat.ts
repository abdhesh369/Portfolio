import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
            console.log("DEBUG: CHAT ROUTE - FINAL STABLE VERSION (Gemini 2.0 Flash)");

            const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

            if (!apiKey) {
                console.error("Chat API Error: GEMINI_API_KEY is missing");
                return res.status(500).json({ message: "Gemini API key is not configured." });
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

            const genAI = new GoogleGenerativeAI(apiKey);

            // Use gemini-2.0-flash which we verified exists for this key
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            // Robust history management (prepend system prompt as context)
            const chatHistory = [
                {
                    role: "user",
                    parts: [{ text: "System Instructions: " + systemPrompt }]
                },
                {
                    role: "model",
                    parts: [{ text: "Acknowledged. I am Abdhesh's AI portfolio assistant and I will answer questions based on the provided criteria." }]
                },
                ...body.data.messages.slice(0, -1) // All previous messages
            ];

            const userMessage = body.data.messages[body.data.messages.length - 1].parts[0].text;

            const chat = model.startChat({
                history: chatHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                },
            });

            console.log("DEBUG: Sending user message to Gemini 2.0 Flash...");
            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const text = response.text();

            return res.json({ message: text });
        } catch (error: any) {
            console.error("Chat API Error:", error.message);

            // Handle quota errors gracefully
            if (error.message.includes("429") || error.message.toLowerCase().includes("quota")) {
                return res.status(429).json({
                    message: "The AI is currently receiving too many requests. Please try again in 10-15 seconds.",
                    details: "Quota exceeded"
                });
            }

            return res.status(500).json({
                message: "Internal server error during chat processing.",
                details: error.message
            });
        }
    });
};
