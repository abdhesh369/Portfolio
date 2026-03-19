import { describe, it, expect } from "vitest";
import request from "supertest";
import { createTestApp } from "./test-app.js";
import { env } from "../env.js";


describe("Auth Integration Tests", () => {
    const app = createTestApp();

    describe("POST /api/v1/auth/login", () => {
        it("should return 200 and set cookies on valid credentials", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({ password: env.ADMIN_PASSWORD });



            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.csrfToken).toBeDefined();

            // Check if cookies are set
            const cookies = response.get("Set-Cookie") || [];
            expect(cookies.some(c => c.includes("auth_token"))).toBe(true);
            expect(cookies.some(c => c.includes("refresh_token"))).toBe(true);
            expect(cookies.some(c => c.includes("csrf_token"))).toBe(true);
        });

        it("should return 401 on invalid credentials", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({ password: "wrong-password" });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid credentials");
        });
    });

    describe("POST /api/v1/auth/refresh", () => {
        it("should return 200 and rotate tokens when a valid refresh token is provided", async () => {
            // 1. Login to get initial tokens
            const loginRes = await request(app)
                .post("/api/v1/auth/login")
                .send({ password: env.ADMIN_PASSWORD });


            const initialCookies = loginRes.get("Set-Cookie")!;
            const refreshToken = initialCookies.find(c => c.includes("refresh_token"))!;

            // 2. Refresh tokens
            const refreshRes = await request(app)
                .post("/api/v1/auth/refresh")
                .set("Cookie", [refreshToken]);

            expect(refreshRes.status).toBe(200);
            expect(refreshRes.body.success).toBe(true);
            
            const newCookies = refreshRes.get("Set-Cookie")!;
            expect(newCookies.some(c => c.includes("auth_token"))).toBe(true);
            expect(newCookies.some(c => c.includes("refresh_token"))).toBe(true);

            // 3. Ensure the old refresh token is now invalid (Rotation check)
            const reuseRes = await request(app)
                .post("/api/v1/auth/refresh")
                .set("Cookie", [refreshToken]);

            expect(reuseRes.body.success).toBe(false);
            expect(reuseRes.body.message).toBe("Invalid or expired refresh token");
        });

        it("should return success: false when no refresh token is provided", async () => {
            const response = await request(app).post("/api/v1/auth/refresh");
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("No refresh token provided");
        });
    });

    describe("GET /api/v1/auth/status", () => {

        it("should return authenticated: false when no token is provided", async () => {
            const response = await request(app).get("/api/v1/auth/status");

            expect(response.status).toBe(200);
            expect(response.body.authenticated).toBe(false);
            expect(response.body.csrfToken).toBeDefined();
        });

        it("should return authenticated: true when valid token is provided in cookies", async () => {
            // First login to get the cookie
            const loginRes = await request(app)
                .post("/api/v1/auth/login")
                .send({ password: env.ADMIN_PASSWORD });



            const authCookie = loginRes.get("Set-Cookie")!.find(c => c.includes("auth_token"))!;

            const response = await request(app)
                .get("/api/v1/auth/status")
                .set("Cookie", [authCookie]);

            expect(response.status).toBe(200);
            expect(response.body.authenticated).toBe(true);
        });
    });

    describe("POST /api/v1/auth/logout", () => {
        it("should clear cookies and return 200", async () => {
            const response = await request(app).post("/api/v1/auth/logout");

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const cookies = response.get("Set-Cookie") || [];
            // Cookies should be set with expiration in the past (Max-Age=0 or similar)
            expect(cookies.some(c => c.includes("auth_token") && (c.includes("Max-Age=0") || c.includes("Expires=")))).toBe(true);
        });
    });
});
