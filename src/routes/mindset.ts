import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage.js";
import { api } from "../../shared/routes.js";
import { asyncHandler } from "../auth.js";

export function registerMindsetRoutes(app: Router) {
    // GET /api/mindset - List all mindset principles
    app.get(
        api.mindset.list.path,
        asyncHandler(async (_req, res) => {
            const mindset = await storage.getMindset();
            res.json(mindset);
        })
    );

    // GET /api/mindset/:id - Get single mindset principle
    app.get(
        "/api/mindset/:id",
        asyncHandler(async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid mindset ID" });
                return;
            }
            const mindset = await storage.getMindsetById(id);
            if (!mindset) {
                res.status(404).json({ message: "Mindset principle not found" });
                return;
            }
            res.json(mindset);
        })
    );
}
