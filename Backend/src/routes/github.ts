import { Router } from "express";
import { redis } from "../lib/redis.js";
import { logger } from "../lib/logger.js";
import { asyncHandler } from "../auth.js";
import { cachePublic } from "../middleware/cache.js";

const githubRoutes = Router();

const GITHUB_USERNAME = "abdhesh369";
const CACHE_KEY = `github_activity:${GITHUB_USERNAME}`;
const CACHE_TTL = 3600; // 1 hour

githubRoutes.get("/activity", cachePublic(3600), asyncHandler(async (_req, res) => {
    try {
        // 1. Try Cache
        if (redis) {
            const cached = await redis.get(CACHE_KEY);
            if (cached) {
                return res.json(JSON.parse(cached));
            }
        }

        // 2. Fetch from GitHub
        logger.info({ context: "github-proxy" }, "Fetching fresh GitHub activity");
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public`, {
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "Portfolio-Backend"
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const data = await response.json();

        // 3. Simple Filtering (commits, push, create, pull request)
        const filteredData = Array.isArray(data) ? data.slice(0, 5).map((event: any) => ({
            id: event.id,
            type: event.type,
            repo: event.repo.name,
            createdAt: event.created_at,
            payload: {
                action: event.payload.action,
                commits: event.payload.commits?.length || 0
            }
        })) : [];

        // 4. Set Cache
        if (redis) {
            await redis.set(CACHE_KEY, JSON.stringify(filteredData), "EX", CACHE_TTL);
        }

        res.json(filteredData);
    } catch (error) {
        logger.error({ context: "github-proxy", error }, "Error fetching GitHub activity");
        // Fallback to empty array or partial cache if available
        res.status(502).json({ message: "Unable to reach GitHub", events: [] });
    }
}));

export default githubRoutes;
