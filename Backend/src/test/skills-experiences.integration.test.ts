import { describe, it, expect } from "vitest";
import request from "supertest";
import { createTestApp } from "./test-app.js";

describe("Skills & Experiences API Integration Tests", () => {
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

    describe("Skills API", () => {
        const validSkill = {
            name: "TypeScript",
            category: "Languages",
            status: "Advanced",
            icon: "Code",
            description: "Advanced TS usage",
            proof: "Project experience",
            mastery: 90
        };

        it("should create and retrieve a skill", async () => {
            const { cookies, csrfToken } = await getAuth();

            const createRes = await request(app)
                .post("/api/v1/skills")
                .set("Cookie", cookies)
                .set("X-CSRF-Token", csrfToken)
                .send(validSkill);

            expect(createRes.status).toBe(201);
            expect(createRes.body.data.name).toBe("TypeScript");

            const getRes = await request(app).get("/api/v1/skills");
            expect(getRes.body.length).toBe(1);
            expect(getRes.body[0].name).toBe("TypeScript");
        });
    });

    describe("Experiences API", () => {
        const validExperience = {
            role: "Software Engineer",
            organization: "Tech Corp",
            period: "2020 - Present",
            startDate: new Date().toISOString(),
            description: "Built amazing things",
            type: "Experience"
        };

        it("should create and retrieve an experience", async () => {
            const { cookies, csrfToken } = await getAuth();

            const createRes = await request(app)
                .post("/api/v1/experiences")
                .set("Cookie", cookies)
                .set("X-CSRF-Token", csrfToken)
                .send(validExperience);

            expect(createRes.status).toBe(201);
            expect(createRes.body.data.role).toBe("Software Engineer");

            const getRes = await request(app).get("/api/v1/experiences");
            expect(getRes.body.length).toBe(1);
            expect(getRes.body[0].role).toBe("Software Engineer");
        });
    });
});
