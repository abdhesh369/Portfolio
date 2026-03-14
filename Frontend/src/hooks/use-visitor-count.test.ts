/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from "@testing-library/react";
import { useVisitorCount } from "./use-visitor-count";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock EventSource
class MockEventSource {
    onopen: ((ev: Event) => void) | null = null;
    onerror: ((ev: Event) => void) | null = null;
    onmessage: ((ev: MessageEvent) => void) | null = null;
    addEventListener = vi.fn();
    close = vi.fn();
    static latestInstance: MockEventSource | null = null;
    constructor(_url: string | URL, _options?: Record<string, unknown>) {
        MockEventSource.latestInstance = this;
    }
}
vi.stubGlobal("EventSource", MockEventSource);

// Mock fetch
global.fetch = vi.fn();

describe("useVisitorCount", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        MockEventSource.latestInstance = null;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should initialize with 0 and connect to SSE", async () => {
        const { result } = renderHook(() => useVisitorCount());
        expect(result.current.count).toBe(0);
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
        };
        vi.stubGlobal("EventSource", CustomMock);

        const { result } = renderHook(() => useVisitorCount());

        act(() => {
            if (countListener) {
                countListener({ data: JSON.stringify({ count: 42 }) });
            }
        });

        expect(result.current.count).toBe(42);
        vi.stubGlobal("EventSource", MockEventSource);
    });

    it("should fallback to polling on SSE error after retries", async () => {
        vi.useFakeTimers();
        
        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ count: 10 })
        } as any);

        const { result } = renderHook(() => useVisitorCount());

        // We need 4 failures to switch to polling
        for (let i = 0; i < 4; i++) {
            act(() => {
                if (MockEventSource.latestInstance?.onerror) {
                    MockEventSource.latestInstance.onerror(new Event("error"));
                }
            });

            act(() => {
                vi.runOnlyPendingTimers();
            });
        }

        // Wait for fetch to resolve
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.isPolling).toBe(true);
        expect(result.current.count).toBe(10);
        
        vi.useRealTimers();
        vi.stubGlobal("EventSource", MockEventSource);
    });
});
