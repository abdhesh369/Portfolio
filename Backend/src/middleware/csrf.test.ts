/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

const { csrfProtection, generateCsrfToken } = await import("./csrf.js");

function mockReq(overrides: Partial<Request> = {}): Request {
    return {
        method: "POST",
        cookies: {},
        headers: {},
        ...overrides,
    } as unknown as Request;
}

function mockRes(): { res: Response; statusCode: number; body: any } {
    const ctx = { statusCode: 0, body: null as any };
    const res = {
        status(code: number) {
            ctx.statusCode = code;
            return res;
        },
        json(data: any) {
            ctx.body = data;
            return res;
        },
    } as unknown as Response;
    return { res, ...ctx, get statusCode() { return ctx.statusCode; }, get body() { return ctx.body; } };
}

describe("csrfProtection middleware", () => {
    let next: NextFunction;

    beforeEach(() => {
        next = vi.fn();
    });

    it("skips GET requests", () => {
        const req = mockReq({ method: "GET" });
        const { res } = mockRes();
        csrfProtection(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it("skips HEAD requests", () => {
        const req = mockReq({ method: "HEAD" });
        const { res } = mockRes();
        csrfProtection(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it("skips OPTIONS requests", () => {
        const req = mockReq({ method: "OPTIONS" });
        const { res } = mockRes();
        csrfProtection(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it("skips unauthenticated POST requests (no auth_token)", () => {
        const req = mockReq({ method: "POST", cookies: {} });
        const { res } = mockRes();
        csrfProtection(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it("returns 403 when authenticated POST has no CSRF token", () => {
        const r = mockRes();
        const req = mockReq({
            method: "POST",
            cookies: { auth_token: "jwt-token" },
            headers: {},
        });
        csrfProtection(req, r.res, next);
        expect(next).not.toHaveBeenCalled();
        expect(r.statusCode).toBe(403);
        expect(r.body).toEqual({ message: "Invalid CSRF token" });
    });

    it("returns 403 when CSRF header does not match cookie", () => {
        const r = mockRes();
        const req = mockReq({
            method: "POST",
            cookies: { auth_token: "jwt", csrf_token: "token-a" },
            headers: { "x-csrf-token": "token-b" },
        });
        csrfProtection(req, r.res, next);
        expect(next).not.toHaveBeenCalled();
        expect(r.statusCode).toBe(403);
    });

    it("passes when CSRF header matches cookie", () => {
        const token = generateCsrfToken();
        const req = mockReq({
            method: "POST",
            cookies: { auth_token: "jwt", csrf_token: token },
            headers: { "x-csrf-token": token },
        });
        const { res } = mockRes();
        csrfProtection(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it("returns 403 for DELETE with mismatched tokens", () => {
        const r = mockRes();
        const req = mockReq({
            method: "DELETE",
            cookies: { auth_token: "jwt", csrf_token: "aaa" },
            headers: { "x-csrf-token": "bbb" },
        });
        csrfProtection(req, r.res, next);
        expect(next).not.toHaveBeenCalled();
        expect(r.statusCode).toBe(403);
    });

    it("passes for PUT with matching tokens", () => {
        const token = "test-csrf-token-123";
        const req = mockReq({
            method: "PUT",
            cookies: { auth_token: "jwt", csrf_token: token },
            headers: { "x-csrf-token": token },
        });
        const { res } = mockRes();
        csrfProtection(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});

describe("generateCsrfToken", () => {
    it("generates a 64-character hex string", () => {
        const token = generateCsrfToken();
        expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it("generates unique tokens", () => {
        const tokens = new Set(Array.from({ length: 10 }, () => generateCsrfToken()));
        expect(tokens.size).toBe(10);
    });
});
