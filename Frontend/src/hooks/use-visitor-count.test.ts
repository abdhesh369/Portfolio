/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor, act } from "@testing-library/react";
import { useVisitorCount } from "./use-visitor-count";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock EventSource
class MockEventSource {
    onopen: ((ev: Event) => void) | null = null;
    onerror: ((ev: Event) => void) | null = null;
    onmessage: ((ev: MessageEvent) => void) | null = null;
    addEventListener = vi.fn();
    close = vi.fn();
    constructor(_url: string | URL, _options?: Record<string, unknown>) {
        // Use a microtask to fire onopen so it's more predictable than setTimeout
        queueMicrotask(() => { if (this.onopen) this.onopen(new Event("open")); });
    }
}
vi.stubGlobal("EventSource", MockEventSource);

// Mock fetch
global.fetch = vi.fn();

describe("useVisitorCount", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should initialize with 0 and connect to SSE", async () => {
        const { result } = renderHook(() => useVisitorCount());
        await waitFor(() => expect(result.current.count).toBe(0));
    });

    it("should update count when receiving SSE message", async () => {
        let countListener: any;
        const CustomMock = class extends MockEventSource {
            constructor(url: string | URL, options?: Record<string, unknown>) {
                super(url, options);
                this.addEventListener.mockImplementation((event: string, cb: any) => {
                    if (event === "count") countListener = cb;
                });
            }
            close = vi.fn();
        };
        vi.stubGlobal("EventSource", CustomMock);

        const { result } = renderHook(() => useVisitorCount());

        // Simulate SSE message
        act(() => {
            if (countListener) {
                countListener({ data: JSON.stringify({ count: 42 }) });
            }
        });

        await waitFor(() => expect(result.current.count).toBe(42));
        vi.stubGlobal("EventSource", MockEventSource);
    });

    it("should fallback to polling on SSE error", async () => {
        const CustomMock = class extends MockEventSource {
            constructor(url: string | URL, options?: Record<string, unknown>) {
                super(url, options);
                setTimeout(() => {
                    act(() => {
                        if (this.onerror) this.onerror(new Event("error"));
                    });
                }, 0);
            }
            close = vi.fn();
        };
        vi.stubGlobal("EventSource", CustomMock);

        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ count: 10 })
        } as any);

        const { result } = renderHook(() => useVisitorCount());

        // Fast-forward through retries one by one to avoid infinite loops if it misbehaves
        for (let i = 0; i < 5; i++) {
            act(() => {
                vi.advanceTimersByTime(11000);
            });
            await Promise.resolve();
        }

        await waitFor(() => expect(result.current.isPolling).toBe(true));
        expect(result.current.count).toBe(10);
        vi.stubGlobal("EventSource", MockEventSource);
    });
});
