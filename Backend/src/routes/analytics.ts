import { Router } from "express";
import rateLimit from "express-rate-limit";
import { analyticsService } from "../services/analytics.service.js";
import { insertAnalyticsSchema } from "../../shared/schema.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { validateBody } from "../middleware/validate.js";

const analyticsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many analytics events" },
    standardHeaders: true,
    legacyHeaders: false,
});

export function registerAnalyticsRoutes(app: Router) {
    // POST /analytics/track - Log an analytics event
    app.post(
        "/analytics/track",
        analyticsLimiter,
        validateBody(insertAnalyticsSchema),
        asyncHandler(async (req, res) => {
            const event = await analyticsService.logEvent(req.body);
            res.status(201).json(event);
        })
    );

    // GET /analytics/summary - Get aggregated analytics for dashboard
    app.get(
        "/analytics/summary",
        isAuthenticated,
        asyncHandler(async (_req, res) => {
            const summary = await analyticsService.getSummary();
            res.json(summary);
        })
    );
}
