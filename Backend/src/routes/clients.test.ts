import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// ---- Hoisted mocks ----
const {
    mockGetClientByToken,
    mockGetPortalDashboard,
    mockSubmitFeedback,
    mockGetProjectFeedback
} = vi.hoisted(() => ({
    mockGetClientByToken: vi.fn(),
    mockGetPortalDashboard: vi.fn(),
    mockSubmitFeedback: vi.fn(),
    mockGetProjectFeedback: vi.fn(),
}));

vi.mock("../services/client.service.js", () => ({
    clientService: {
        getClientByToken: mockGetClientByToken,
        getPortalDashboard: mockGetPortalDashboard,
        submitFeedback: mockSubmitFeedback,
        getProjectFeedback: mockGetProjectFeedback,
    },
}));

// Mock audit and CSRF to avoid side effects
vi.mock("../lib/audit.js", () => ({ recordAudit: vi.fn() }));
vi.mock("../middleware/csrf.js", () => ({ csrfProtection: (_req: any, _res: any, next: any) => next() }));
vi.mock("../middleware/validate.js", () => ({ validateBody: () => (_req: any, _res: any, next: any) => next() }));

import { registerClientRoutes } from "./clients.js";

const app = express();
app.use(express.json());
registerClientRoutes(app);

describe("Client Portal Routes IDOR Security", () => {
    const MOCK_CLIENT = { id: 1, name: "Test Client", status: "active" };
    const MOCK_TOKEN = "valid-client-token";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("POST /portal/feedback", () => {
        it("allows feedback when client owns the project", async () => {
            mockGetClientByToken.mockResolvedValue(MOCK_CLIENT);
            mockGetPortalDashboard.mockResolvedValue({
                client: MOCK_CLIENT,
                projects: [{ id: 101, title: "My Project" }]
            });
            mockSubmitFeedback.mockResolvedValue({ id: 1, message: "Thanks!" });

            const res = await request(app)
                .post("/portal/feedback")
                .set("x-client-token", MOCK_TOKEN)
                .send({ clientProjectId: 101, message: "Great work!" });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(mockSubmitFeedback).toHaveBeenCalled();
        });

        it("denies feedback (403) when client does NOT own the project (IDOR Check)", async () => {
            mockGetClientByToken.mockResolvedValue(MOCK_CLIENT);
            mockGetPortalDashboard.mockResolvedValue({
                client: MOCK_CLIENT,
                projects: [{ id: 101, title: "My Project" }] // Owns 101, not 999
            });

            const res = await request(app)
                .post("/portal/feedback")
                .set("x-client-token", MOCK_TOKEN)
                .send({ clientProjectId: 999, message: "I am trying to hack feedback" });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("access denied");
            expect(mockSubmitFeedback).not.toHaveBeenCalled();
        });

        it("returns 401 when token is invalid", async () => {
            mockGetClientByToken.mockResolvedValue(null);

            const res = await request(app)
                .post("/portal/feedback")
                .set("x-client-token", "invalid-token")
                .send({ clientProjectId: 101, message: "..." });

            expect(res.status).toBe(401);
        });
    });

    describe("GET /portal/feedback/:projectId", () => {
        it("allows viewing feedback when client owns the project", async () => {
            mockGetClientByToken.mockResolvedValue(MOCK_CLIENT);
            mockGetPortalDashboard.mockResolvedValue({
                client: MOCK_CLIENT,
                projects: [{ id: 101 }]
            });
            mockGetProjectFeedback.mockResolvedValue([]);

            const res = await request(app)
                .get("/portal/feedback/101")
                .set("x-client-token", MOCK_TOKEN);

            expect(res.status).toBe(200);
            expect(mockGetProjectFeedback).toHaveBeenCalledWith(101);
        });

        it("denies viewing (403) when client does NOT own the project (IDOR Check)", async () => {
            mockGetClientByToken.mockResolvedValue(MOCK_CLIENT);
            mockGetPortalDashboard.mockResolvedValue({
                client: MOCK_CLIENT,
                projects: [{ id: 101 }]
            });

            const res = await request(app)
                .get("/portal/feedback/999")
                .set("x-client-token", MOCK_TOKEN);

            expect(res.status).toBe(403);
            expect(res.body.message).toContain("access denied");
            expect(mockGetProjectFeedback).not.toHaveBeenCalled();
        });
    });
});
