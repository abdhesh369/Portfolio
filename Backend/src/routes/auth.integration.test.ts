import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";




// Mock env module before app import
vi.mock("../env.js", () => ({
    env: {
        NODE_ENV: "test",
        PORT: 5000,
        DATABASE_URL: "postgresql://localhost:5432/test",
        JWT_SECRET: "integration-test-jwt-secret-key-that-is-at-least-64-characters-long-for-zod-validation",
        JWT_REFRESH_SECRET: "integration-test-refresh-secret-key-that-is-at-least-64-characters-long-for-zod-validation",
        ADMIN_PASSWORD: "test-admin-password-long-enough",
        ADMIN_EMAIL: "admin@test.com",
        CONTACT_EMAIL: "contact@test.com",
        REDIS_URL: "",
    },
}));


// Mock ioredis
vi.mock("ioredis", () => ({
    Redis: vi.fn().mockImplementation(() => null),
    default: vi.fn().mockImplementation(() => null),
}));

import { createTestApp } from "../test/test-app.js";

const app = createTestApp();

describe("Auth Routes Integration", () => {
    describe("POST /api/v1/auth/login", () => {
        it("returns 400 when password is missing", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Password is required");
        });

        it("returns 401 with invalid password", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ password: "wrong-password" });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe("Invalid credentials");
        }, 5000); // Allow time for the brute-force delay

        it("returns 200 and sets cookie with valid password", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ password: "test-admin-password-long-enough" });


            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Login successful");

            // Check that auth_token cookie was set
            const cookies = res.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookieStr = Array.isArray(cookies) ? cookies.join("; ") : cookies;
            expect(cookieStr).toContain("auth_token");
            expect(cookieStr).toContain("HttpOnly");
        });
    });

    describe("GET /api/v1/auth/status", () => {
        it("returns 200 with authenticated: false without token", async () => {
            const res = await request(app).get("/api/v1/auth/status");
            
            expect(res.status).toBe(200);
            expect(res.body.authenticated).toBe(false);
        });


        it("returns 200 with valid token", async () => {
            const token = jwt.sign({ role: "admin" }, "integration-test-jwt-secret-key-that-is-at-least-64-characters-long-for-zod-validation", { expiresIn: "1h" });

            const res = await request(app)
                .get("/api/v1/auth/status")
                .set("Authorization", `Bearer ${token}`);


            expect(res.status).toBe(200);
            expect(res.body.authenticated).toBe(true);
        });

        it("returns 200 with authenticated: false with expired token", async () => {
            const token = jwt.sign({ role: "admin" }, "integration-test-jwt-secret-key-that-is-at-least-64-characters-long-for-zod-validation", { expiresIn: "-1h" });

            const res = await request(app)
                .get("/api/v1/auth/status")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.authenticated).toBe(false);
        });

    });

    describe("POST /api/v1/auth/logout", () => {
        it("returns 200 even without token (silent logout)", async () => {
            const res = await request(app).post("/api/v1/auth/logout");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });


        it("clears cookie and returns success with valid token", async () => {
            const token = jwt.sign({ role: "admin" }, "integration-test-jwt-secret-key-that-is-at-least-64-characters-long-for-zod-validation", { expiresIn: "1h" });

            const res = await request(app)
                .post("/api/v1/auth/logout")
                .set("Authorization", `Bearer ${token}`);


            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Logged out successfully");

            // Cookie should be cleared
            const cookies = res.headers["set-cookie"];
            if (cookies) {
                const cookieStr = Array.isArray(cookies) ? cookies.join("; ") : cookies;
                expect(cookieStr).toContain("auth_token");
            }
        });
    });

    describe("Full auth flow", () => {
        it("login → status check → logout", async () => {
            // 1. Login
            const loginRes = await request(app)
                .post("/api/v1/auth/login")
                .send({ password: "test-admin-password-long-enough" });
            expect(loginRes.status).toBe(200);


            // Extract the auth_token from set-cookie header
            const setCookie = loginRes.headers["set-cookie"];
            const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
            const tokenMatch = cookieStr?.match(/auth_token=([^;]+)/);
            expect(tokenMatch).toBeTruthy();
            const token = tokenMatch![1];

            // 2. Check status using the token
            const statusRes = await request(app)
                .get("/api/v1/auth/status")
                .set("Cookie", `auth_token=${token}`);
            expect(statusRes.status).toBe(200);
            expect(statusRes.body.authenticated).toBe(true);

            // 3. Logout
            const logoutRes = await request(app)
                .post("/api/v1/auth/logout")
                .set("Cookie", `auth_token=${token}`);
            expect(logoutRes.status).toBe(200);
            expect(logoutRes.body.message).toBe("Logged out successfully");
        });
    });
});
