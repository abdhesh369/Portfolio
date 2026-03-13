import { Router, Request, Response } from "express";
import { clientService } from "../services/client.service.js";
import { isAuthenticated } from "../auth.js";
import { parseIntParam } from "../lib/params.js";
import { asyncHandler } from "../lib/async-handler.js";
import { recordAudit } from "../lib/audit.js";
import { validateBody } from "../middleware/validate.js";
import { insertClientApiSchema, insertClientProjectApiSchema, insertClientFeedbackApiSchema } from "@portfolio/shared";

export function registerClientRoutes(app: Router) {
    // ========== ADMIN ROUTES ==========

    // GET /admin/clients — list all clients
    app.get(
        "/admin/clients",
        isAuthenticated,
        asyncHandler(async (_req: Request, res: Response) => {
            const clients = await clientService.getAllClients();
            res.json(clients);
        })
    );

    // POST /admin/clients — create client
    app.post(
        "/admin/clients",
        isAuthenticated,
        validateBody(insertClientApiSchema),
        asyncHandler(async (req: Request, res: Response) => {
            const result = await clientService.createClient(req.body);
            recordAudit("CREATE", "client", result.id, null, { name: result.name });
            res.status(201).json({ success: true, data: result.id, rawToken: result.rawToken, client: result });
        })
    );

    // PUT /admin/clients/:id — update client
    app.put(
        "/admin/clients/:id",
        isAuthenticated,
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseIntParam(res, req.params.id, "ID");
            if (id === null) return;
            const client = await clientService.updateClient(id, req.body);
            recordAudit("UPDATE", "client", id, null, req.body);
            res.json({ success: true, data: client });
        })
    );

    // POST /admin/clients/:id/regenerate-token
    app.post(
        "/admin/clients/:id/regenerate-token",
        isAuthenticated,
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseIntParam(res, req.params.id, "ID");
            if (id === null) return;
            const rawToken = await clientService.regenerateClientToken(id);
            recordAudit("UPDATE", "client", id, null, { action: "REGENERATE_TOKEN" });
            res.json({ success: true, rawToken });
        })
    );

    // DELETE /admin/clients/:id
    app.delete(
        "/admin/clients/:id",
        isAuthenticated,
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseIntParam(res, req.params.id, "ID");
            if (id === null) return;
            await clientService.deleteClient(id);
            recordAudit("DELETE", "client", id, null, null);
            res.status(204).send();
        })
    );

    // POST /admin/client-projects — assign project to client
    app.post(
        "/admin/client-projects",
        isAuthenticated,
        validateBody(insertClientProjectApiSchema),
        asyncHandler(async (req: Request, res: Response) => {
            const project = await clientService.createClientProject(req.body);
            recordAudit("CREATE", "client_project", project.id, null, req.body);
            res.status(201).json({ success: true, data: project });
        })
    );

    // PUT /admin/client-projects/:id — update project status
    app.put(
        "/admin/client-projects/:id",
        isAuthenticated,
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseIntParam(res, req.params.id, "ID");
            if (id === null) return;
            const project = await clientService.updateClientProject(id, req.body);
            recordAudit("UPDATE", "client_project", id, null, req.body);
            res.json({ success: true, data: project });
        })
    );

    // ========== CLIENT PORTAL ROUTES (token-based auth) ==========

    // GET /portal/dashboard — client dashboard
    app.get(
        "/portal/dashboard",
        asyncHandler(async (req: Request, res: Response) => {
            const token = req.headers["x-client-token"] as string;
            if (!token) { res.status(401).json({ success: false, message: "Client token required" }); return; }
            const client = await clientService.getClientByToken(token);
            if (!client || client.status !== "active") { res.status(401).json({ success: false, message: "Invalid or inactive client" }); return; }
            const dashboard = await clientService.getPortalDashboard(client.id);
            res.json({ success: true, data: dashboard });
        })
    );

    // POST /portal/feedback — submit feedback
    app.post(
        "/portal/feedback",
        validateBody(insertClientFeedbackApiSchema),
        asyncHandler(async (req: Request, res: Response) => {
            const token = req.headers["x-client-token"] as string;
            if (!token) { res.status(401).json({ success: false, message: "Client token required" }); return; }
            const client = await clientService.getClientByToken(token);
            if (!client || client.status !== "active") { res.status(401).json({ success: false, message: "Invalid or inactive client" }); return; }

            // Fix IDOR: verify client owns the project
            const dashboard = await clientService.getPortalDashboard(client.id);
            const isOwner = dashboard.projects.some(p => p.id === req.body.clientProjectId);
            if (!isOwner) {
                return res.status(403).json({ success: false, message: "Project not found or access denied" });
            }

            const feedback = await clientService.submitFeedback({
                ...req.body,
                clientId: client.id,
            });
            res.status(201).json({ success: true, data: feedback });
        })
    );

    // GET /portal/feedback/:projectId — get feedback for a project
    app.get(
        "/portal/feedback/:projectId",
        asyncHandler(async (req: Request, res: Response) => {
            const token = req.headers["x-client-token"] as string;
            if (!token) { res.status(401).json({ success: false, message: "Client token required" }); return; }
            const client = await clientService.getClientByToken(token);
            if (!client || client.status !== "active") { res.status(401).json({ success: false, message: "Invalid or inactive client" }); return; }
            const projectId = parseInt(req.params.projectId, 10);
            if (isNaN(projectId)) { res.status(400).json({ success: false, message: "Invalid project ID" }); return; }

            // Fix IDOR: verify client owns the project
            const dashboard = await clientService.getPortalDashboard(client.id);
            const isOwner = dashboard.projects.some(p => p.id === projectId);
            if (!isOwner) {
                return res.status(403).json({ success: false, message: "Project not found or access denied" });
            }

            const feedback = await clientService.getProjectFeedback(projectId);
            res.json({ success: true, data: feedback });
        })
    );
}
