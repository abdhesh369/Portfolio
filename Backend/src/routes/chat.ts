import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { articlesTable, projectsTable, skillsTable, experiencesTable } from "../../shared/schema.js";
import { env } from "../env.js";

export const registerChatRoutes = (router: Router) => {
    router.post("/chat", async (req, res) => {
        try {
            if (!env.GEMINI_API_KEY) {
                return res.status(503).json({ error: "AI Chatbot is currently unavailable (API key missing)." });
            }

            const schema = z.object({
                messages: z.array(z.object({
                    role: z.enum(["user", "model"]),
                    parts: z.array(z.object({ text: z.string() }))
                }))
            });

            const { messages } = schema.parse(req.body);

            // Fetch context data from the database to inject into the system prompt
            const [projects, skills, experiences, articles] = await Promise.all([
                db.select().from(projectsTable).limit(5),
                db.select().from(skillsTable),
                db.select().from(experiencesTable),
                db.select().from(articlesTable).where(eq(articlesTable.status, "published")).limit(5)
            ]);

            const systemInstruction = `You are a helpful and professional AI assistant representing Abdhesh Sah on his personal portfolio website.
Here is information about Abdhesh you must use to answer questions:

SKILLS:
${skills.map(s => `- ${s.name} (${s.category})`).join("\n")}

PROJECTS:
${projects.map(p => `- ${p.title}: ${p.description} (Built with: ${(p.techStack as string[])?.join(", ")})`).join("\n")}

EXPERIENCE:
${experiences.map(e => `- ${e.role} at ${e.organization} (${e.period})`).join("\n")}

RECENT BLOG ARTICLES:
${articles.map(a => `- ${a.title}: ${a.excerpt}`).join("\n")}

INSTRUCTIONS:
- You must answer questions as if you are Abdhesh's personal assistant. Be polite and professional.
- Use markdown for formatting your answers to make them readable (e.g., bullet points, bold text).
- Do not make up information that is not provided in the context above. If you don't know the answer based on the context, politely state that you're an AI assistant and recommend the user reach out to Abdhesh directly via the contact form.
- Keep answers concise and relevant.`;

            const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

            // Extract the last user message and build history from the rest
            // Filter out any initial "model" greeting messages not from Gemini
            const firstUserIdx = messages.findIndex(m => m.role === "user");
            const relevantMessages = firstUserIdx >= 0 ? messages.slice(firstUserIdx) : messages;

            // The last message is the current user message, and everything before is history
            const lastMessage = relevantMessages[relevantMessages.length - 1];
            const history = relevantMessages.slice(0, -1);

            // Use the chats API for multi-turn conversations (proven pattern)
            const chat = ai.chats.create({
                model: "gemini-2.0-flash",
                config: {
                    systemInstruction,
                },
                history: history,
            });

            const response = await chat.sendMessage({
                message: lastMessage.parts[0].text,
            });

            res.json({ message: response.text });
        } catch (error: any) {
            const errMsg = error?.message || String(error);
            const statusCode = error?.status || error?.statusCode;
            console.error("Chat API Error:", errMsg);

            if (statusCode === 429) {
                return res.status(429).json({
                    error: "The AI assistant is receiving too many requests. Please try again in a moment."
                });
            }

            if (statusCode === 403) {
                return res.status(503).json({
                    error: "The AI assistant is temporarily unavailable. The API key may be invalid or restricted."
                });
            }

            res.status(500).json({ error: "Failed to generate AI response. Please try again." });
        }
    });
};
