import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";

// ---- Mock env ----
vi.mock("./env.js", () => ({
    env: {
        NODE_ENV: "test",
        REDIS_URL: "",
        JWT_SECRET: "test-jwt-secret-key",
    },
}));

// ---- Mock ioredis ----
vi.mock("ioredis", () => ({
    Redis: vi.fn().mockImplementation(() => null),
}));

import { isAuthenticated, checkAuthStatus, asyncHandler, revokeToken } from "./auth.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-jwt-secret-key";

describe("auth module", () => {
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    function makeReq(overrides: Partial<Request> = {}): Partial<Request> {
        return {
            headers: {},
            cookies: {},
            ...overrides,
        };
    }

    beforeEach(() => {
        mockRes = {
            status: vi.fn().mockReturnThis() as any,
            json: vi.fn().mockReturnThis() as any,
        };
        mockNext = vi.fn();
        vi.clearAllMocks();
    });

    describe("isAuthenticated middleware", () => {
        it("returns 401 when no token is provided", async () => {
            const req = makeReq();
            await isAuthenticated(req as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining("Unauthorized") })
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("authenticates with valid Bearer token", async () => {
            const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
            const req = makeReq({
                headers: { authorization: `Bearer ${token}` },
            });

            await isAuthenticated(req as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect((req as any).user).toBeDefined();
            expect((req as any).user.role).toBe("admin");
        });

        it("authenticates with valid cookie token", async () => {
            const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
            const req = makeReq({
                cookies: { auth_token: token },
            });

            await isAuthenticated(req as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it("returns 401 for expired token", async () => {
            const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "-1h" });
            const req = makeReq({
                headers: { authorization: `Bearer ${token}` },
            });

            await isAuthenticated(req as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining("Invalid or expired") })
            );
        });

        it("returns 401 for token signed with wrong secret", async () => {
            const token = jwt.sign({ role: "admin" }, "wrong-secret", { expiresIn: "1h" });
            const req = makeReq({
                headers: { authorization: `Bearer ${token}` },
            });

            await isAuthenticated(req as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it("prefers Bearer token over cookie when both present", async () => {
            const bearerToken = jwt.sign({ role: "admin", via: "bearer" }, JWT_SECRET, { expiresIn: "1h" });
            const cookieToken = jwt.sign({ role: "admin", via: "cookie" }, JWT_SECRET, { expiresIn: "1h" });
            const req = makeReq({
                headers: { authorization: `Bearer ${bearerToken}` },
                cookies: { auth_token: cookieToken },
            });

            await isAuthenticated(req as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect((req as any).user.via).toBe("bearer");
        });
    });

    describe("checkAuthStatus", () => {
        it("returns false when no token present", async () => {
            const req = makeReq();
            const result = await checkAuthStatus(req as Request);
            expect(result).toBe(false);
        });

        it("returns true for valid Bearer token", async () => {
            const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
            const req = makeReq({
                headers: { authorization: `Bearer ${token}` },
            });

            const result = await checkAuthStatus(req as Request);
            expect(result).toBe(true);
        });

        it("returns true for valid cookie token", async () => {
            const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
            const req = makeReq({ cookies: { auth_token: token } });

            const result = await checkAuthStatus(req as Request);
            expect(result).toBe(true);
        });

        it("returns false for expired token", async () => {
            const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "-1h" });
            const req = makeReq({
                headers: { authorization: `Bearer ${token}` },
            });

            const result = await checkAuthStatus(req as Request);
            expect(result).toBe(false);
        });
    });

    describe("asyncHandler", () => {
        it("calls the wrapped function", async () => {
            const handler = vi.fn().mockResolvedValue(undefined);
            const wrapped = asyncHandler(handler);
            const req = makeReq();

            wrapped(req as Request, mockRes as Response, mockNext);
            await vi.waitFor(() => expect(handler).toHaveBeenCalled());
        });

        it("catches errors and passes to next", async () => {
            const error = new Error("test error");
            const handler = vi.fn().mockRejectedValue(error);
            const wrapped = asyncHandler(handler);
            const req = makeReq();

            wrapped(req as Request, mockRes as Response, mockNext);
            await vi.waitFor(() => expect(mockNext).toHaveBeenCalledWith(error));
        });
    });

    describe("revokeToken", () => {
        it("does nothing when Redis is not configured", async () => {
            // Since REDIS_URL is empty, redis is null, so revokeToken should just return
            const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
            await expect(revokeToken(token)).resolves.toBeUndefined();
        });
    });
});
