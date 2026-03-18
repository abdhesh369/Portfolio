import { describe, it, expect } from "vitest";
import request from "supertest";
import { createTestApp } from "./test-app.js";

describe("Projects API Integration Tests", () => {
    const app = createTestApp();

    const getAuth = async () => {
        const loginRes = await request(app)
            .post("/api/v1/auth/login")
            .send({ password: "1111111111111111" });
        
        const cookies = loginRes.get("Set-Cookie")!;
        const authCookie = cookies.find(c => c.includes("auth_token"))!;
        const csrfCookie = cookies.find(c => c.includes("csrf_token"))!;
        const csrfToken = loginRes.body.csrfToken;

        return { 
            cookies: [authCookie, csrfCookie], 
            csrfToken 
        };
    };


    describe("GET /api/v1/projects", () => {
        it("should return an empty array when no projects exist", async () => {
            const response = await request(app).get("/api/v1/projects");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });
    });

    describe("POST /api/v1/projects", () => {
        const validProject = {
            title: "Test Project",
            slug: "test-project",
            description: "Detailed description",
            techStack: ["React", "TypeScript"],
            imageUrl: "https://example.com/image.png",
            category: "Web Development",
            displayOrder: 1,
            status: "Completed"
        };

        it("should return 401 when not authenticated", async () => {
            const response = await request(app)
                .post("/api/v1/projects")
                .send(validProject);
            expect(response.status).toBe(401);
        });

        it("should create a project when authenticated", async () => {
            const { cookies, csrfToken } = await getAuth();

            const createRes = await request(app)
                .post("/api/v1/projects")
                .set("Cookie", cookies)
                .set("X-CSRF-Token", csrfToken)
                .send(validProject);

            expect(createRes.status).toBe(201);
            expect(createRes.body.data.title).toBe("Test Project");
            expect(createRes.body.data.id).toBeDefined();


            // Verify it was actually saved to the DB
            const getRes = await request(app).get("/api/v1/projects");
            expect(getRes.body.length).toBe(1);
            expect(getRes.body[0].title).toBe("Test Project");
        });

        it("should return 400 on validation error (missing required field)", async () => {
            const { cookies, csrfToken } = await getAuth();
            const invalidProject = { ...validProject, title: "" }; // Empty title should fail Zod validation

            const response = await request(app)
                .post("/api/v1/projects")
                .set("Cookie", cookies)
                .set("X-CSRF-Token", csrfToken)
                .send(invalidProject);

            expect(response.status).toBe(400);
            expect(response.body.message).toBeDefined();
        });

    });
});
