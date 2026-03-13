import { Router, Request, Response } from "express";
import { sketchpadService } from "../services/sketchpad.service.js";
import { isAuthenticated } from "../auth.js";
import { asyncHandler } from "../lib/async-handler.js";
import { recordAudit } from "../lib/audit.js";
import { validateBody } from "../middleware/validate.js";
import { insertSketchpadSessionApiSchema } from "@portfolio/shared";

export function registerSketchpadRoutes(app: Router) {
    // GET /sketchpad/sessions — list active sessions
    app.get(
        "/sketchpad/sessions",
        asyncHandler(async (_req: Request, res: Response) => {
            const sessions = await sketchpadService.getActive();
            res.json(sessions);
        })
    );

    // GET /admin/sketchpad/sessions — admin: list all sessions
    app.get(
        "/admin/sketchpad/sessions",
        isAuthenticated,
        asyncHandler(async (_req: Request, res: Response) => {
            const sessions = await sketchpadService.getAll();
            res.json(sessions);
        })
    );

    // GET /sketchpad/sessions/:id — get session data
    app.get(
        "/sketchpad/sessions/:id",
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid ID" }); return; }
            const session = await sketchpadService.getById(id);
            if (!session) { res.status(404).json({ success: false, message: "Session not found" }); return; }
            res.json({ success: true, data: session });
        })
    );

    // POST /sketchpad/sessions — create session
    app.post(
        "/sketchpad/sessions",
        validateBody(insertSketchpadSessionApiSchema),
        asyncHandler(async (req: Request, res: Response) => {
            const session = await sketchpadService.create(req.body);
            recordAudit("CREATE", "sketchpad_session", session.id, null, { title: session.title });
            res.status(201).json({ success: true, data: session });
        })
    );

    // PUT /sketchpad/sessions/:id — save canvas data
    app.put(
        "/sketchpad/sessions/:id",
        isAuthenticated,
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid ID" }); return; }
            const session = await sketchpadService.saveCanvas(id, req.body.canvasData || {});
            res.json({ success: true, data: session });
        })
    );

    // PUT /sketchpad/sessions/:id/archive — archive session
    app.put(
        "/sketchpad/sessions/:id/archive",
        isAuthenticated,
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid ID" }); return; }
            await sketchpadService.archive(id);
            recordAudit("UPDATE", "sketchpad_session", id, null, { status: "archived" });
            res.json({ success: true, message: "Session archived" });
        })
    );

    // DELETE /sketchpad/sessions/:id — admin delete
    app.delete(
        "/sketchpad/sessions/:id",
        isAuthenticated,
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid ID" }); return; }
            await sketchpadService.delete(id);
            recordAudit("DELETE", "sketchpad_session", id, null, null);
            res.status(204).send();
        })
    );
}
