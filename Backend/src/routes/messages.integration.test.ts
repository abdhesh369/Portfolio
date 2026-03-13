import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

// ---- Mock dependencies using vi.hoisted ----
const { JWT_SECRET, mockGetAll, mockGetById, mockCreate, mockDelete, mockBulkDelete } = vi.hoisted(() => ({
    JWT_SECRET: "integration-test-jwt-secret-key-32chars",
    mockGetAll: vi.fn(),
    mockGetById: vi.fn(),
    mockCreate: vi.fn(),
    mockDelete: vi.fn(),
    mockBulkDelete: vi.fn(),
}));

vi.mock("../env.js", () => ({
    env: {
        NODE_ENV: "test",
        JWT_SECRET,
        ADMIN_PASSWORD: "test-admin-password",
        ADMIN_EMAIL: "admin@test.com",
        CONTACT_EMAIL: "contact@test.com",
        REDIS_URL: "",
        RESEND_API_KEY: "",
    },
}));

vi.mock("ioredis", () => ({
    Redis: vi.fn().mockImplementation(() => null),
    default: vi.fn().mockImplementation(() => null),
}));

vi.mock("../services/message.service.js", () => ({
    messageService: {
        getAll: mockGetAll,
        getById: mockGetById,
        create: mockCreate,
        delete: mockDelete,
        bulkDelete: mockBulkDelete,
    },
}));

vi.mock("../lib/queue.js", () => ({
    emailQueue: null,
    emailWorker: null,
}));

import cookieParser from "cookie-parser";
import { Router } from "express";
import { registerMessageRoutes } from "../routes/messages.js";
import { isAuthenticated } from "../auth.js";
import { asyncHandler } from "../lib/async-handler.js";

function createMessagesApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());

    const router = Router();
    registerMessageRoutes(router);
    app.use("/api/v1", router);

    app.use(
        (err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
            const status = err.status || 500;
            res.status(status).json({ message: err.message });
        }
    );

    return app;
}

const app = createMessagesApp();

function adminToken() {
    return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
}

describe("Messages Routes Integration", () => {
    describe("GET /api/v1/messages", () => {
        it("returns 401 without auth", async () => {
            const res = await request(app).get("/api/v1/messages");
            expect(res.status).toBe(401);
        });

        it("returns messages list for authenticated admin", async () => {
            const messages = [
                { id: 1, name: "User", email: "u@t.com", message: "Hi", createdAt: "2025-01-01" },
            ];
            mockGetAll.mockResolvedValueOnce(messages);

            const res = await request(app)
                .get("/api/v1/messages")
                .set("Authorization", `Bearer ${adminToken()}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(messages);
        });
    });

    describe("POST /api/v1/messages", () => {
        it("creates a message with valid data", async () => {
            const input = { name: "Alice", email: "alice@example.com", message: "Hello!", subject: "Greet" };
            const created = { id: 1, ...input, createdAt: "2025-01-01T00:00:00.000Z" };
            mockCreate.mockResolvedValueOnce(created);

            const res = await request(app)
                .post("/api/v1/messages")
                .send(input);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(1);
        });

        it("returns 400 with missing required fields", async () => {
            const res = await request(app)
                .post("/api/v1/messages")
                .send({ name: "Bob" }); // missing email and message

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Validation failed");
            expect(res.body.errors).toBeDefined();
        });
    });

    describe("GET /api/v1/messages/:id", () => {
        it("returns 401 without auth", async () => {
            const res = await request(app).get("/api/v1/messages/1");
            expect(res.status).toBe(401);
        });

        it("returns 404 when message not found", async () => {
            mockGetById.mockResolvedValueOnce(null);

            const res = await request(app)
                .get("/api/v1/messages/999")
                .set("Authorization", `Bearer ${adminToken()}`);

            expect(res.status).toBe(404);
        });

        it("returns message when found", async () => {
            const msg = { id: 1, name: "User", email: "u@t.com", message: "Hi" };
            mockGetById.mockResolvedValueOnce(msg);

            const res = await request(app)
                .get("/api/v1/messages/1")
                .set("Authorization", `Bearer ${adminToken()}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
        });
    });

    describe("DELETE /api/v1/messages/:id", () => {
        it("returns 404 when message not found", async () => {
            mockDelete.mockResolvedValueOnce(false);

            const res = await request(app)
                .delete("/api/v1/messages/999")
                .set("Authorization", `Bearer ${adminToken()}`);

            expect(res.status).toBe(404);
        });

        it("returns 204 when message deleted", async () => {
            mockDelete.mockResolvedValueOnce(true);

            const res = await request(app)
                .delete("/api/v1/messages/1")
                .set("Authorization", `Bearer ${adminToken()}`);

            expect(res.status).toBe(204);
        });
    });
});
