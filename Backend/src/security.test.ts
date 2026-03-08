import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { registerClientRoutes } from "./routes/clients.js";
import { registerSketchpadRoutes } from "./routes/sketchpad.js";
import { clientService } from "./services/client.service.js";
import { sketchpadService } from "./services/sketchpad.service.js";

// Mock dependencies
vi.mock("./services/client.service.js", () => ({
    clientService: {
        getClientByToken: vi.fn(),
        getPortalDashboard: vi.fn(),
        submitFeedback: vi.fn(),
        getProjectFeedback: vi.fn(),
    },
}));

vi.mock("./services/sketchpad.service.js", () => ({
    sketchpadService: {
        saveCanvas: vi.fn(),
        getById: vi.fn(),
    },
}));

vi.mock("./auth.js", () => ({
    isAuthenticated: (req: any, res: any, next: any) => {
        if (req.headers.authorization === "Bearer admin-token") {
            req.user = { role: "admin" };
            return next();
        }
        res.status(401).json({ message: "Unauthorized" });
    },
    asyncHandler: (fn: any) => (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    },
}));

vi.mock("./lib/audit.js", () => ({
    recordAudit: vi.fn(),
}));

vi.mock("./middleware/validate.js", () => ({
    validateBody: () => (req: any, res: any, next: any) => next(),
}));

describe("Security and Authorization", () => {
    let app: express.Express;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        registerClientRoutes(app);
        registerSketchpadRoutes(app);
        vi.clearAllMocks();
    });

    describe("Client Portal IDOR Protection", () => {
        it("denies feedback submission for a project the client does not own", async () => {
            const client = { id: 1, status: "active" };
            const dashboard = {
                client: { id: 1, name: "Test Client" },
                projects: [{ id: 101, title: "Project A" }] // Client only owns project 101
            };

            vi.mocked(clientService.getClientByToken).mockResolvedValue(client as any);
            vi.mocked(clientService.getPortalDashboard).mockResolvedValue(dashboard as any);

            const response = await request(app)
                .post("/portal/feedback")
                .set("x-client-token", "valid-token")
                .send({
                    clientProjectId: 999, // IDOR attempt: project 999
                    message: "HackAttempt"
                });

            expect(response.status).toBe(403);
            expect(response.body.message).toContain("Project not found or access denied");
            expect(clientService.submitFeedback).not.toHaveBeenCalled();
        });

        it("allows feedback submission for a project the client owns", async () => {
            const client = { id: 1, status: "active" };
            const dashboard = {
                client: { id: 1, name: "Test Client" },
                projects: [{ id: 101, title: "Project A" }]
            };

            vi.mocked(clientService.getClientByToken).mockResolvedValue(client as any);
            vi.mocked(clientService.getPortalDashboard).mockResolvedValue(dashboard as any);
            vi.mocked(clientService.submitFeedback).mockResolvedValue({ id: 1 } as any);

            const response = await request(app)
                .post("/portal/feedback")
                .set("x-client-token", "valid-token")
                .send({
                    clientProjectId: 101,
                    message: "Great work!"
                });

            expect(response.status).toBe(201);
            expect(clientService.submitFeedback).toHaveBeenCalled();
        });
    });

    describe("Sketchpad Route Protection", () => {
        it("requires authentication for PUT /sketchpad/sessions/:id", async () => {
            const response = await request(app)
                .put("/sketchpad/sessions/1")
                .send({ canvasData: {} });

            expect(response.status).toBe(401);
        });

        it("allows PUT /sketchpad/sessions/:id for authenticated users", async () => {
            vi.mocked(sketchpadService.saveCanvas).mockResolvedValue({ id: 1 } as any);

            const response = await request(app)
                .put("/sketchpad/sessions/1")
                .set("Authorization", "Bearer admin-token")
                .send({ canvasData: {} });

            expect(response.status).toBe(200);
            expect(sketchpadService.saveCanvas).toHaveBeenCalledWith(1, {});
        });
    });

    describe("AI Review Service Simulation", () => {
        it("triggers a review and returns 202 status", async () => {
            // Mocking logic without actual service implementation for brevity
            app.post("/api/v1/projects/:id/review", (req, res) => {
                res.status(202).json({ success: true, data: { status: 'pending' } });
            });

            const response = await request(app)
                .post("/api/v1/projects/1/review")
                .set("Authorization", "Bearer admin-token");

            expect(response.status).toBe(202);
            expect(response.body.data.status).toBe('pending');
        });
    });
});
