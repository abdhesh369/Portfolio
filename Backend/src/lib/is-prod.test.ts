import { describe, it, expect, beforeEach } from "vitest";
import { getIsProd } from "./is-prod.js";
import type { Request } from "express";

const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({
    secure: false,
    headers: {},
    ...overrides,
  } as unknown as Request);

describe("getIsProd", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NODE_ENV;
    delete process.env.RENDER;
  });

  it("returns true when NODE_ENV is production", () => {
    process.env.NODE_ENV = "production";
    expect(getIsProd()).toBe(true);
  });

  it("returns true when RENDER env var is set", () => {
    process.env.RENDER = "true";
    expect(getIsProd()).toBe(true); 
    // and also with req:
    expect(getIsProd(mockReq())).toBe(true);
  });

  it("returns true when req.secure is true", () => {
    expect(getIsProd(mockReq({ secure: true }))).toBe(true);
  });

  it("returns true when x-forwarded-proto is https", () => {
    expect(getIsProd(mockReq({ headers: { "x-forwarded-proto": "https" } }))).toBe(true);
  });

  it("returns true for https origin that is not localhost", () => {
    expect(getIsProd(mockReq({ headers: { origin: "https://myportfolio.com" } }))).toBe(true);
  });

  it("returns false for https origin that IS localhost", () => {
    expect(getIsProd(mockReq({ headers: { origin: "https://localhost:5173" } }))).toBe(false);
  });

  it("returns false in development with plain http request", () => {
    process.env.NODE_ENV = "development";
    expect(getIsProd(mockReq())).toBe(false);
  });

  it("returns false when called with no request and no env signals", () => {
    process.env.NODE_ENV = "development";
    expect(getIsProd()).toBe(false);
  });
});
