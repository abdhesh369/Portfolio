import { Router, Request, Response } from "express";
import { whiteboardService } from "../services/whiteboard.service.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { recordAudit } from "../lib/audit.js";
import { validateBody } from "../middleware/validate.js";
import { insertWhiteboardSessionApiSchema } from "@portfolio/shared";

export function registerWhiteboardRoutes(app: Router) {
    // GET /whiteboard/sessions — list active sessions
    app.get(
        "/whiteboard/sessions",
        asyncHandler(async (_req: Request, res: Response) => {
            const sessions = await whiteboardService.getActive();
            res.json(sessions);
        })
    );

    // GET /admin/whiteboard/sessions — admin: list all sessions
    app.get(
        "/admin/whiteboard/sessions",
        isAuthenticated,
        asyncHandler(async (_req: Request, res: Response) => {
            const sessions = await whiteboardService.getAll();
            res.json(sessions);
        })
    );

    // GET /whiteboard/sessions/:id — get session data
    app.get(
        "/whiteboard/sessions/:id",
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid ID" }); return; }
            const session = await whiteboardService.getById(id);
            if (!session) { res.status(404).json({ success: false, message: "Session not found" }); return; }
            res.json({ success: true, data: session });
        })
    );

    // POST /whiteboard/sessions — create session
    app.post(
        "/whiteboard/sessions",
        validateBody(insertWhiteboardSessionApiSchema),
        asyncHandler(async (req: Request, res: Response) => {
            const session = await whiteboardService.create(req.body);
            recordAudit("CREATE", "whiteboard_session", session.id, null, { title: session.title });
            res.status(201).json({ success: true, data: session });
        })
    );

    // PUT /whiteboard/sessions/:id — save canvas data
    app.put(
        "/whiteboard/sessions/:id",
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid ID" }); return; }
            const session = await whiteboardService.saveCanvas(id, req.body.canvasData || {});
            res.json({ success: true, data: session });
        })
    );

    // PUT /whiteboard/sessions/:id/archive — archive session
    app.put(
        "/whiteboard/sessions/:id/archive",
        isAuthenticated,
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid ID" }); return; }
            await whiteboardService.archive(id);
            recordAudit("UPDATE", "whiteboard_session", id, null, { status: "archived" });
            res.json({ success: true, message: "Session archived" });
        })
    );

    // DELETE /whiteboard/sessions/:id — admin delete
    app.delete(
        "/whiteboard/sessions/:id",
        isAuthenticated,
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid ID" }); return; }
            await whiteboardService.delete(id);
            recordAudit("DELETE", "whiteboard_session", id, null, null);
            res.status(204).send();
        })
    );
}
