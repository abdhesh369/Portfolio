import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { cachePublic } from "../middleware/cache.js";

describe("cachePublic middleware", () => {
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    function makeReq(overrides: Partial<Request> = {}): Partial<Request> {
        return {
            method: "GET",
            cookies: {},
            headers: {},
            ...overrides,
        };
    }

    beforeEach(() => {
        mockRes = {
            set: vi.fn().mockReturnThis() as any,
        };
        mockNext = vi.fn();
    });

    it("sets Cache-Control header for GET requests", () => {
        const middleware = cachePublic(300);
        const req = makeReq();

        middleware(req as Request, mockRes as Response, mockNext);

        expect(mockRes.set).toHaveBeenCalledWith(
            "Cache-Control",
            "public, max-age=300, stale-while-revalidate=60"
        );
        expect(mockNext).toHaveBeenCalled();
    });

    it("uses custom maxAge value", () => {
        const middleware = cachePublic(600);
        const req = makeReq();

        middleware(req as Request, mockRes as Response, mockNext);

        expect(mockRes.set).toHaveBeenCalledWith(
            "Cache-Control",
            "public, max-age=600, stale-while-revalidate=60"
        );
    });

    it("skips non-GET requests", () => {
        const middleware = cachePublic(300);
        const req = makeReq({ method: "POST" });

        middleware(req as Request, mockRes as Response, mockNext);

        expect(mockRes.set).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });

    it("skips when auth_token cookie is present", () => {
        const middleware = cachePublic(300);
        const req = makeReq({ cookies: { auth_token: "abc123" } });

        middleware(req as Request, mockRes as Response, mockNext);

        expect(mockRes.set).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });

    it("skips when authorization header is present", () => {
        const middleware = cachePublic(300);
        const req = makeReq({ headers: { authorization: "Bearer token" } });

        middleware(req as Request, mockRes as Response, mockNext);

        expect(mockRes.set).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });

    it("uses default maxAge of 300 when no argument given", () => {
        const middleware = cachePublic();
        const req = makeReq();

        middleware(req as Request, mockRes as Response, mockNext);

        expect(mockRes.set).toHaveBeenCalledWith(
            "Cache-Control",
            "public, max-age=300, stale-while-revalidate=60"
        );
    });
});
