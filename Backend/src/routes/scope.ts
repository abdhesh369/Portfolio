import { Router } from "express";
import { z } from "zod";
import { insertScopeRequestApiSchema } from "@portfolio/shared";
import { scopeService } from "../services/scope.service.js";
import { scopeRepository } from "../repositories/scope.repository.js";
import { logger } from "../lib/logger.js";

const router = Router();

// POST /api/v1/scope/request - Submit wizard data & queue job
router.post("/request", async (req, res) => {
    try {
        const validatedData = insertScopeRequestApiSchema.parse(req.body);
        const request = await scopeService.submitRequest(validatedData);

        res.status(202).json({
            message: "Scope request submitted and processing started.",
            requestId: request.id,
            status: request.status
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: "Validation failed", details: error.errors });
        }
        logger.error({ err: error }, "Error submitting scope request:");
        res.status(500).json({ error: "Failed to submit scope request" });
    }
});

// GET /api/v1/scope/stream/:id - SSE endpoint to stream estimation progress/results
router.get("/stream/:id", async (req, res) => {
    const requestId = parseInt(req.params.id);

    if (isNaN(requestId)) {
        return res.status(400).json({ error: "Invalid request ID" });
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*"); // Customize as needed

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
router.get("/recent", async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
        const recent = await scopeRepository.findRecent(limit);
        res.json(recent);
    } catch (error) {
        logger.error({ err: error }, "Error fetching recent scope requests:");
        res.status(500).json({ error: "Failed to fetch recent requests" });
    }
});

// GET /api/v1/scope/:id - Get status/result of a specific request
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

        const request = await scopeRepository.findById(id);
        if (!request) return res.status(404).json({ error: "Request not found" });

        res.json(request);
    } catch (error) {
        logger.error({ err: error }, `Error fetching scope request ${req.params.id}:`);
        res.status(500).json({ error: "Failed to fetch scope request" });
    }
});

export default router;
