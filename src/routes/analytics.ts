import { Router } from "express";
import { storage } from "../storage.js";
import { insertAnalyticsSchema } from "../../shared/schema.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { z } from "zod";

const router = Router();

export function registerAnalyticsRoutes(app: Router) {
    // POST /analytics/track - Log an analytics event
    app.post(
        "/analytics/track",
        asyncHandler(async (req, res) => {
            const parsed = insertAnalyticsSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ message: "Invalid analytics data", errors: parsed.error.errors });
                return;
            }

            const event = await storage.logAnalyticsEvent(parsed.data);
            res.status(201).json(event);
        })
    );

    // GET /analytics/summary - Get aggregated analytics for dashboard
    app.get(
        "/analytics/summary",
        isAuthenticated,
        asyncHandler(async (_req, res) => {
            const summary = await storage.getAnalyticsSummary();
            res.json(summary);
        })
    );
}
