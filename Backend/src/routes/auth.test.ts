/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Hoisted mocks ----
const {
    mockJwtSign,
    mockJwtVerify,
    mockJwtDecode,
    mockBcryptCompare,
    mockStoreRefreshToken,
    mockValidateRefreshToken,
    mockRevokeRefreshToken,
    mockRevokeToken,
    mockGenerateCsrfToken,
} = vi.hoisted(() => ({
    mockJwtSign: vi.fn().mockReturnValue("mock-access-token"),
    mockJwtVerify: vi.fn().mockReturnValue({ role: "admin" }),
    mockJwtDecode: vi.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }),
    mockBcryptCompare: vi.fn().mockResolvedValue(true),
    mockStoreRefreshToken: vi.fn().mockResolvedValue(undefined),
    mockValidateRefreshToken: vi.fn().mockResolvedValue(true),
    mockRevokeRefreshToken: vi.fn().mockResolvedValue(undefined),
    mockRevokeToken: vi.fn().mockResolvedValue(undefined),
    mockGenerateCsrfToken: vi.fn().mockReturnValue("mock-csrf-token"),
}));

vi.mock("jsonwebtoken", () => ({
    default: {
        sign: mockJwtSign,
        verify: mockJwtVerify,
        decode: mockJwtDecode,
    },
}));

vi.mock("bcryptjs", () => ({
    default: {
        compare: mockBcryptCompare,
    },
}));

vi.mock("../env.js", () => ({
    env: {
        JWT_SECRET: "test-secret",
        JWT_REFRESH_SECRET: "test-refresh-secret",
        ADMIN_PASSWORD: "test-password",
        REDIS_URL: "redis://localhost:6379",
        NODE_ENV: "test",
    },
}));

vi.mock("../auth.js", () => ({
    isAuthenticated: vi.fn((_req: unknown, _res: unknown, next: (err?: any) => void) => next()),
    asyncHandler: (fn: any) => fn,
    createRefreshToken: vi.fn().mockReturnValue("mock-refresh-token"),
    storeRefreshToken: mockStoreRefreshToken,
    validateRefreshToken: mockValidateRefreshToken,
    revokeRefreshToken: mockRevokeRefreshToken,
    revokeToken: mockRevokeToken,
}));

vi.mock("../middleware/csrf.js", () => ({
    generateCsrfToken: mockGenerateCsrfToken,
    csrfProtection: vi.fn((_req: unknown, _res: unknown, next: (err?: any) => void) => next()),
}));

vi.mock("../lib/async-handler.js", () => ({
    asyncHandler: (fn: any) => fn,
}));

vi.mock("express-rate-limit", () => ({
    authLimiter: (_req: any, _res: any, next: any) => next(),
}));

vi.mock("../lib/rate-limit.js", () => ({
    authLimiter: (_req: unknown, _res: unknown, next: (err?: any) => void) => next(),
}));

// Now import the auth routes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type ScopeRequest } from "@portfolio/shared";
import { authRoutes as router } from "./auth.js";

// Helper to create mock req/res
function mockReq(overrides: Record<string, any> = {}): any {
    return {
        body: {},
        cookies: {},
        headers: {},
        ...overrides,
    };
}

interface MockResponseCtx {
    statusCode: number;
    body: any;
    cookies: Record<string, { value: any; opts: any }>;
    clearedCookies: string[];
}

function mockRes(): { res: any; ctx: MockResponseCtx } {
    const ctx: MockResponseCtx = {
        statusCode: 200,
        body: null as any,
        cookies: {} as Record<string, any>,
        clearedCookies: [] as string[]
    };
    const res = {
        status(code: number) { ctx.statusCode = code; return res; },
        json(data: any) { ctx.body = data; return res; },
        cookie(name: string, value: any, opts: any) {
            ctx.cookies[name] = { value, opts };
            return res;
        },
        clearCookie(name: string, __opts?: any) { // eslint-disable-line @typescript-eslint/no-unused-vars
            ctx.clearedCookies.push(name);
            return res;
        },
        login(_user: any, _opts?: any, callback?: (err?: any) => void) {
            if (callback) {
                callback();
            }
            return res;
        },
    };
    return { res, ctx };
}

// Extract route handlers from the router
function getRouteHandler(method: string, path: string): ((...args: any[]) => any) | undefined {
    const stack = (router as any).stack;
    for (const layer of stack) {
        if (layer.route) {
            const routePath = layer.route.path;
            const routeMethod = Object.keys(layer.route.methods)[0];
            if (routePath === path && routeMethod === method) {
                const handlers = layer.route.stack.map((s: any) => s.handle);
                return handlers[handlers.length - 1];
            }
        }
    }
    return undefined;
}

describe("Auth Routes - Refresh Token Flow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockJwtSign.mockReturnValue("mock-access-token");
        mockValidateRefreshToken.mockResolvedValue(true);
        mockBcryptCompare.mockResolvedValue(true);
    });

    describe("POST /login", () => {
        it("issues access token with 15m expiry", async () => {
            const handler = getRouteHandler("post", "/login");
            const req = mockReq({ body: { password: "test-password" } });
            const { res, ctx } = mockRes();
            await handler!(req, res);

            expect(mockJwtSign).toHaveBeenCalledWith(
                { role: "admin" },
                "test-secret",
                { expiresIn: "15m" }
            );
            expect(ctx.cookies.auth_token).toBeDefined();
            expect(ctx.cookies.auth_token.opts.maxAge).toBe(15 * 60 * 1000);
        });

        it("issues refresh token as HttpOnly cookie (7 days)", async () => {
            const handler = getRouteHandler("post", "/login");
            const req = mockReq({ body: { password: "test-password" } });
            const { res, ctx } = mockRes();
            await handler!(req, res);

            expect(ctx.cookies.refresh_token).toBeDefined();
            expect(ctx.cookies.refresh_token.opts.httpOnly).toBe(true);
            expect(ctx.cookies.refresh_token.opts.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
        });

        it("stores refresh token in Redis", async () => {
            const handler = getRouteHandler("post", "/login");
            const req = mockReq({ body: { password: "test-password" } });
            const { res } = mockRes();
            await handler!(req, res);

            expect(mockStoreRefreshToken).toHaveBeenCalledWith("mock-refresh-token");
        });

        it("issues CSRF token with 7-day maxAge", async () => {
            const handler = getRouteHandler("post", "/login");
            const req = mockReq({ body: { password: "test-password" } });
            const { res, ctx } = mockRes();
            await handler!(req, res);

            expect(ctx.cookies.csrf_token).toBeDefined();
            expect(ctx.cookies.csrf_token.opts.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
            expect(ctx.cookies.csrf_token.opts.httpOnly).toBe(false);
        });
    });

    describe("POST /refresh", () => {
        it("issues new access token when refresh token is valid", async () => {
            const handler = getRouteHandler("post", "/refresh");
            const refreshToken = "valid-refresh-token";
            const req = mockReq({ cookies: { refresh_token: refreshToken } });
            const { res, ctx } = mockRes();
            await handler!(req, res);

            expect(mockValidateRefreshToken).toHaveBeenCalledWith(refreshToken);
            expect(ctx.body).toEqual(expect.objectContaining({ success: true }));
            expect(ctx.cookies.auth_token).toBeDefined();
        });

        it("returns success: false when no refresh token cookie", async () => {
            const handler = getRouteHandler("post", "/refresh");
            const req = mockReq({ cookies: {} });
            const { res, ctx } = mockRes();
            await handler!(req, res);

            expect(ctx.statusCode).toBe(200);
            expect(ctx.body.success).toBe(false);
        });
    });

    describe("POST /logout", () => {
        it("revokes both access and refresh tokens", async () => {
            const handler = getRouteHandler("post", "/logout");
            const refreshToken = "my-refresh-token";
            const req = mockReq({
                cookies: { auth_token: "my-access-token", refresh_token: refreshToken },
            });
            const { res } = mockRes();
            await handler!(req, res);

            expect(mockRevokeToken).toHaveBeenCalledWith("my-access-token");
            expect(mockRevokeRefreshToken).toHaveBeenCalledWith(refreshToken);
        });

        it("clears auth_token, refresh_token, and csrf_token cookies", async () => {
            const handler = getRouteHandler("post", "/logout");
            const req = mockReq({
                cookies: { auth_token: "tok", refresh_token: "ref" },
            });
            const { res, ctx } = mockRes();
            await handler!(req, res);

            expect(ctx.clearedCookies).toContain("auth_token");
            expect(ctx.clearedCookies).toContain("refresh_token");
            expect(ctx.clearedCookies).toContain("csrf_token");
        });
    });
});
