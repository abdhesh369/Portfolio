import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock import.meta.env before importing the module
const { apiFetch, authHeaders } = await import("./api-helpers");

describe("authHeaders", () => {
  it("returns Content-Type application/json", () => {
    expect(authHeaders()).toEqual({ "Content-Type": "application/json" });
  });
});

describe("apiFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("makes a fetch call with credentials and JSON headers", async () => {
    const mockResponse = { ok: true, status: 200, json: vi.fn().mockResolvedValue({ data: "test" }) };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await apiFetch("/api/test");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/test"),
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
    expect(result).toEqual({ data: "test" });
  });

  it("merges custom headers with auth headers", async () => {
    const mockResponse = { ok: true, status: 200, json: vi.fn().mockResolvedValue({}) };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    await apiFetch("/api/test", { headers: { "X-Custom": "value" } });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Custom": "value",
        }),
      })
    );
  });

  it("throws an error with message from JSON body on non-ok response", async () => {
    const mockResponse = {
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      json: vi.fn().mockResolvedValue({ message: "Validation failed" }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    await expect(apiFetch("/api/test")).rejects.toThrow("Validation failed");
  });

  it("falls back to statusText when JSON parse fails on error", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: vi.fn().mockRejectedValue(new Error("parse error")),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    await expect(apiFetch("/api/test")).rejects.toThrow("Internal Server Error");
  });

  it("returns null for 204 No Content responses", async () => {
    const mockResponse = { ok: true, status: 204, json: vi.fn() };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await apiFetch("/api/test", { method: "DELETE" });

    expect(result).toBeNull();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it("passes through method and body options", async () => {
    const mockResponse = { ok: true, status: 200, json: vi.fn().mockResolvedValue({ id: 1 }) };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    const body = JSON.stringify({ name: "test" });
    await apiFetch("/api/items", { method: "POST", body });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/items"),
      expect.objectContaining({
        method: "POST",
        body,
        credentials: "include",
      })
    );
  });
});
