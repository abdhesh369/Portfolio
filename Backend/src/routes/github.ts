import { Router } from "express";
import { logger } from "../lib/logger.js";
import { asyncHandler } from "../auth.js";
import { cachePublic } from "../middleware/cache.js";

const githubRoutes = Router();

const GITHUB_USERNAME = "abdhesh369";

githubRoutes.get("/activity", cachePublic(3600), asyncHandler(async (_req, res) => {
    try {
        logger.info({ context: "github-proxy" }, "Fetching GitHub activity");
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

        // Limit the payload size to the first 15 events
        const filteredData = Array.isArray(data) ? data.slice(0, 15) : [];

        res.json(filteredData);
    } catch (error) {
        logger.error({ context: "github-proxy", error }, "Error fetching GitHub activity");
        res.status(502).json({ message: "Unable to reach GitHub", events: [] });
    }
}));

export default githubRoutes;
