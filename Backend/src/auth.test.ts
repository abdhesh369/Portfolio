import { describe, it, expect, vi, beforeEach } from "vitest";
import { isAuthenticated } from "./auth.js";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "./env.js";

// Mock dependencies
const { mockRedisGet } = vi.hoisted(() => ({
    mockRedisGet: vi.fn(),
}));

vi.mock("./lib/redis.js", () => ({
    redis: {
        get: mockRedisGet,
    },
}));

vi.mock("./lib/logger.js", () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

describe("isAuthenticated middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            headers: {},
            cookies: {},
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
        next = vi.fn();
        vi.clearAllMocks();
    });

    it("returns 401 if no token provided", async () => {
        await isAuthenticated(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized. Please provide a valid token." });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 if token is blacklisted", async () => {
        const token = "blacklisted-token";
        req.headers!.authorization = `Bearer ${token}`;
        mockRedisGet.mockResolvedValue("1");

        await isAuthenticated(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Token has been revoked. Please login again." });
    });

    it("calls next() and attaches user if token is valid (Bearer)", async () => {
        const payload = { role: "admin", iat: 12345, exp: 9999999999 };
        const token = jwt.sign(payload, env.JWT_SECRET);
        req.headers!.authorization = `Bearer ${token}`;
        mockRedisGet.mockResolvedValue(null);

        await isAuthenticated(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toMatchObject({
            role: "admin",
            token: token,
            via: "bearer"
        });
    });

    it("calls next() and attaches user if token is valid (Cookie)", async () => {
        const payload = { role: "admin" };
        const token = jwt.sign(payload, env.JWT_SECRET);
        req.cookies!.auth_token = token;
        mockRedisGet.mockResolvedValue(null);

        await isAuthenticated(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toMatchObject({
            role: "admin",
            token: token,
            via: "cookie"
        });
    });

    it("returns 401 if token is expired", async () => {
        const payload = { role: "admin", exp: Math.floor(Date.now() / 1000) - 3600 };
        const token = jwt.sign(payload, env.JWT_SECRET);
        req.headers!.authorization = `Bearer ${token}`;
        mockRedisGet.mockResolvedValue(null);

        await isAuthenticated(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
    });
});
