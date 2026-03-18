import { Router } from "express";
import { insertScopeRequestApiSchema } from "@portfolio/shared";
import { scopeService } from "../services/scope.service.js";
import { scopeRepository } from "../repositories/scope.repository.js";
import { parseIntParam } from "../lib/params.js";
import { logger } from "../lib/logger.js";
import { aiLimiter } from "../lib/rate-limit.js";
import { asyncHandler } from "../lib/async-handler.js";

const router = Router();

// POST /api/v1/scope/request - Submit wizard data & queue job
router.post("/request", aiLimiter, asyncHandler(async (req, res) => {
    const validatedData = insertScopeRequestApiSchema.parse(req.body);
    const request = await scopeService.submitRequest(validatedData);

    res.status(202).json({
        message: "Scope request submitted and processing started.",
        requestId: request.id,
        status: request.status
    });
}));

// GET /api/v1/scope/stream/:id - SSE endpoint to stream estimation progress/results
router.get("/stream/:id", (req, res) => {
    const requestId = parseIntParam(res, req.params.id, "request ID");
    if (requestId === null) return;

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: "connected", requestId })}\n\n`);

    const pollInterval = setInterval(async () => {
        try {
            const request = await scopeRepository.findById(requestId);

            if (!request) {
                res.write(`data: ${JSON.stringify({ type: "error", message: "Request not found" })}\n\n`);
                clearInterval(pollInterval);
                res.end();
                return;
            }

            if (request.status === "completed") {
                res.write(`data: ${JSON.stringify({ type: "completed", data: request.estimation })}\n\n`);
                clearInterval(pollInterval);
                res.end();
            } else if (request.status === "failed") {
                res.write(`data: ${JSON.stringify({ type: "failed", error: request.error })}\n\n`);
                clearInterval(pollInterval);
                res.end();
            } else {
                // Still processing
                res.write(`data: ${JSON.stringify({ type: "processing", status: request.status })}\n\n`);
            }
        } catch (error) {
            logger.error({ err: error }, `Error polling scope request ${requestId}:`);
            res.write(`data: ${JSON.stringify({ type: "error", message: "Internal server error" })}\n\n`);
            clearInterval(pollInterval);
            res.end();
        }
    }, 2000); // Poll every 2 seconds

    // Handle client disconnection
    req.on("close", () => {
        clearInterval(pollInterval);
        res.end();
    });
});

// GET /api/v1/scope/recent - Get recent completed requests (for social proof or admin)
router.get("/recent", asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const recent = await scopeRepository.findRecent(limit);
    res.json(recent);
}));

// GET /api/v1/scope/:id - Get status/result of a specific request
router.get("/:id", asyncHandler(async (req, res) => {
    const id = parseIntParam(res, req.params.id, "ID");
    if (id === null) return;

    const request = await scopeRepository.findById(id);
    if (!request) return res.status(404).json({ error: "Request not found" });

    res.json(request);
}));

export default router;
