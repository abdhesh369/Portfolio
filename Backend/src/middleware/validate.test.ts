/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { validateBody } from "../middleware/validate.js";
import { z } from "zod";

describe("validateBody middleware", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockReq = { body: {} };
        mockRes = {
            status: vi.fn().mockReturnThis() as any,
            json: vi.fn().mockReturnThis() as any,
        };
        mockNext = vi.fn();
    });

    it("passes valid body and calls next", async () => {
        const schema = z.object({ name: z.string() });
        const middleware = validateBody(schema);

        mockReq.body = { name: "test" };
        await middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(mockReq.body).toEqual({ name: "test" });
    });

    it("strips unknown properties", async () => {
        const schema = z.object({ name: z.string() }).strict();
        const middleware = validateBody(schema);

        mockReq.body = { name: "test", extra: "nope" };
        await middleware(mockReq as Request, mockRes as Response, mockNext);

        // strict schema should produce a ZodError
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Validation failed",
                errors: expect.arrayContaining([
                    expect.objectContaining({ path: expect.any(String), message: expect.any(String) }),
                ]),
            })
        );
    });

    it("returns 400 with structured errors for missing required fields", async () => {
        const schema = z.object({ name: z.string(), email: z.string().email() });
        const middleware = validateBody(schema);

        mockReq.body = {};
        await middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        const jsonCall = (mockRes.json as any).mock.calls[0][0];
        expect(jsonCall.message).toBe("Validation failed");
        expect(jsonCall.errors).toHaveLength(2);
        expect(jsonCall.errors[0]).toHaveProperty("path");
        expect(jsonCall.errors[0]).toHaveProperty("message");
    });

    it("forwards non-Zod errors to next", async () => {
        const schema = z.object({ name: z.string() });
        const middleware = validateBody(schema);

        // Simulate parseAsync throwing a non-Zod error
        vi.spyOn(schema, "parseAsync").mockRejectedValueOnce(new Error("Unexpected error"));

        await middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
});
