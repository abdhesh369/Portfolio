import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
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

const vitalsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { message: "Too many vitals reports" },
    standardHeaders: true,
    legacyHeaders: false,
});

const insertVitalSchema = z.object({
    name: z.enum(["LCP", "CLS", "INP", "FCP", "TTFB"]),
    value: z.number().min(0),
    rating: z.enum(["good", "needs-improvement", "poor"]),
    path: z.string().min(1).max(500),
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

    // POST /analytics/vitals - Log a Core Web Vital metric
    app.post(
        "/analytics/vitals",
        vitalsLimiter,
        validateBody(insertVitalSchema),
        asyncHandler(async (req, res) => {
            await analyticsService.logVital(req.body);
            res.status(204).end();
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

    // GET /analytics/vitals - Get Core Web Vitals summary for dashboard
    app.get(
        "/analytics/vitals",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            const days = req.query.days ? Number(req.query.days) : 7;
            const summary = await analyticsService.getVitalsSummary(days);
            res.json(summary);
        })
    );
}
