import { Router } from "express";
import { env } from "../env.js";
import { logger } from "../lib/logger.js";
import { asyncHandler } from "../lib/async-handler.js";
import { cachePublic } from "../middleware/cache.js";
import { getOpenRouterClient } from "./chat.js";

async function fetchGitHubEvents(username: string): Promise<any> {
    const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Portfolio-Backend",
        ...(env.GITHUB_TOKEN ? { "Authorization": `token ${env.GITHUB_TOKEN}` } : {})
    };
    const response = await fetch(`https://api.github.com/users/${username}/events/public`, { headers });

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

    return await response.json();
}

const githubRoutes = Router();

githubRoutes.get("/activity", cachePublic(3600), asyncHandler(async (_req, res) => {
    try {
        logger.info({ context: "github-proxy" }, "Fetching GitHub activity");
        
        if (!env.GITHUB_USERNAME) {
            return res.status(503).json({ message: "GitHub username not configured" });
        }

        const data = await fetchGitHubEvents(env.GITHUB_USERNAME);

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
        
        if (!env.GITHUB_USERNAME) {
            return res.status(503).json({ message: "GitHub username not configured" });
        }

        const events = await fetchGitHubEvents(env.GITHUB_USERNAME);
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

githubRoutes.get("/activity/latest", cachePublic(300), asyncHandler(async (_req, res) => {
    try {
        if (!env.GITHUB_USERNAME) {
            return res.status(503).json({ message: "GitHub username not configured" });
        }

        const events = await fetchGitHubEvents(env.GITHUB_USERNAME);
        const pushEvent = Array.isArray(events) ? events.find((e: any) => e.type === "PushEvent") : null;

        if (!pushEvent || !pushEvent.payload.commits[0]) {
            return res.json({ status: "idle" });
        }

        const latestCommit = pushEvent.payload.commits[0];
        const repoName = pushEvent.repo.name;

        // Fetch detailed commit info
        const headers: Record<string, string> = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Portfolio-Backend",
            ...(env.GITHUB_TOKEN ? { "Authorization": `token ${env.GITHUB_TOKEN}` } : {})
        };
        
        const commitResponse = await fetch(`https://api.github.com/repos/${repoName}/commits/${latestCommit.sha}`, { headers });
        if (!commitResponse.ok) throw new Error("Failed to fetch commit details");
        
        const details = await commitResponse.json() as any;
        
        res.json({
            status: "active",
            repo: repoName,
            message: latestCommit.message,
            sha: latestCommit.sha.substring(0, 7),
            date: pushEvent.created_at,
            files: (details.files || []).slice(0, 3).map((f: any) => ({
                filename: f.filename,
                additions: f.additions,
                deletions: f.deletions,
                status: f.status
            })),
            stats: details.stats
        });
    } catch (error) {
        logger.error({ context: "github-detail", error }, "Error fetching latest commit detail");
        res.status(502).json({ status: "error" });
    }
}));

githubRoutes.get("/contributions", cachePublic(86400), asyncHandler(async (_req, res) => {
    try {
        if (!env.GITHUB_USERNAME) {
            return res.status(503).json({ message: "GitHub username not configured" });
        }
        const username = env.GITHUB_USERNAME;
        const response = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
        
        if (!response.ok) {
            throw new Error(`GitHub Contributions API error: ${response.statusText}`);
        }

        const data = await response.json() as any;
        
        // Flatten and map data for frontend
        const levelMap: Record<string, number> = {
            "NONE": 0,
            "FIRST_QUARTILE": 1,
            "SECOND_QUARTILE": 2,
            "THIRD_QUARTILE": 3,
            "FOURTH_QUARTILE": 4
        };

        const contributions = (data.contributions || []).flat().map((d: any) => ({
            date: d.date,
            count: d.contributionCount,
            level: levelMap[d.contributionLevel] || 0
        }));

        res.json({
            total: data.totalContributions || 0,
            contributions
        });
    } catch (error) {
        logger.error({ context: "github-contributions", error }, "Error fetching GitHub contributions");
        res.status(502).json({ 
            message: "Unable to fetch contributions", 
            contributions: [],
            total: 0
        });
    }
}));

export default githubRoutes;
