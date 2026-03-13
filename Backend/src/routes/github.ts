import { Router } from "express";
import { logger } from "../lib/logger.js";
import { asyncHandler } from "../auth.js";
import { cachePublic } from "../middleware/cache.js";
import { getOpenRouterClient } from "./chat.js";
import { env } from "../env.js";

const githubRoutes = Router();

githubRoutes.get("/activity", cachePublic(3600), asyncHandler(async (_req, res) => {
    try {
        logger.info({ context: "github-proxy" }, "Fetching GitHub activity");
        
        const headers: Record<string, string> = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Portfolio-Backend"
        };

        if (env.GITHUB_TOKEN) {
            headers["Authorization"] = `token ${env.GITHUB_TOKEN}`;
        }

        const response = await fetch(`https://api.github.com/users/${env.GITHUB_USERNAME}/events/public`, { headers });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "No body");
            logger.error({ 
                context: "github-proxy", 
                status: response.status, 
                statusText: response.statusText,
                body: errorBody
            }, "GitHub API fetch failed");
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Limit the payload size to the first 15 events
        const filteredData = Array.isArray(data) ? data.slice(0, 15) : [];

        res.json(filteredData);
    } catch (error) {
        logger.error({ context: "github-proxy", error }, "Error fetching GitHub activity");
        res.status(502).json({ message: "Unable to reach GitHub", events: [] });
    }
}));

githubRoutes.get("/latest-commit", cachePublic(3600), asyncHandler(async (_req, res) => {
    try {
        logger.info({ context: "github-proxy" }, "Fetching latest GitHub commit");
        
        const headers: Record<string, string> = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Portfolio-Backend"
        };

        if (env.GITHUB_TOKEN) {
            headers["Authorization"] = `token ${env.GITHUB_TOKEN}`;
        }

        const response = await fetch(`https://api.github.com/users/${env.GITHUB_USERNAME}/events/public`, { headers });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "No body");
            logger.error({ 
                context: "github-proxy", 
                status: response.status, 
                statusText: response.statusText,
                body: errorBody
            }, "GitHub API latest-commit fetch failed");
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const events = await response.json();
        const pushEvent = Array.isArray(events) ? events.find((e: any) => e.type === "PushEvent") : null;

        if (!pushEvent) {
            return res.json({
                repo: "N/A",
                message: "No recent commits found",
                url: "#",
                date: new Date().toISOString(),
            });
        }

        const latestCommit = pushEvent.payload.commits[0];
        const repoName = pushEvent.repo.name;
        const commitUrl = `https://github.com/${repoName}/commit/${latestCommit.sha}`;
        const commitMessage = latestCommit.message;

        // Optional AI Summary (only if small and meaningful)
        let aiSummary = undefined;
        try {
            const openrouter = getOpenRouterClient();
            const response = await openrouter.chat.send({
                chatGenerationParams: {
                    model: "google/gemma-3-1b-it:free",
                    messages: [
                        {
                            role: "system",
                            content: "You are a concise technical summarizer. Summarize the following GitHub commit message in under 10 words. Focus on the 'what' and 'why'. No conversational filler."
                        },
                        {
                            role: "user",
                            content: `Repo: ${repoName}\nMessage: ${commitMessage}`
                        }
                    ],
                    maxTokens: 30
                }
            });
            aiSummary = response.choices?.[0]?.message?.content?.trim();
        } catch (aiError) {
            logger.warn({ context: "github-summary", error: aiError }, "AI summarization failed, skipping");
        }

        res.json({
            repo: repoName,
            message: commitMessage,
            url: commitUrl,
            date: pushEvent.created_at,
            aiSummary
        });
    } catch (error) {
        logger.error({ context: "github-proxy", error }, "Error fetching latest GitHub commit");
        res.status(502).json({ message: "Unable to reach GitHub", events: [] });
    }
}));

githubRoutes.get("/contributions", cachePublic(86400), asyncHandler(async (_req, res) => {
    try {
        const username = env.GITHUB_USERNAME || "abdhesh369";
        const response = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
        
        if (!response.ok) {
            throw new Error(`GitHub Contributions API error: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        logger.error({ context: "github-contributions", error }, "Error fetching GitHub contributions");
        res.status(502).json({ 
            message: "Unable to fetch contributions", 
            contributions: [],
            total: {} 
        });
    }
}));

export default githubRoutes;
