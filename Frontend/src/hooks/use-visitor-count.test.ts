import { renderHook, waitFor } from "@testing-library/react";
import { useVisitorCount } from "./use-visitor-count";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock EventSource
class MockEventSource {
    onopen: any = null;
    onerror: any = null;
    addEventListener = vi.fn();
    close = vi.fn();
    constructor(url: string, options?: any) { }
}
global.EventSource = MockEventSource as any;

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

    it("should initialize with 0 and connect to SSE", () => {
        const { result } = renderHook(() => useVisitorCount());
        expect(result.current.count).toBe(0);
        expect(global.EventSource).toHaveBeenCalled();
    });

    it("should update count when receiving SSE message", async () => {
        let countListener: any;
        vi.mocked(global.EventSource).mockImplementation((url: string) => {
            const instance = new MockEventSource(url);
            instance.addEventListener.mockImplementation((event: string, cb: any) => {
                if (event === "count") countListener = cb;
            });
            return instance as any;
        });

        const { result } = renderHook(() => useVisitorCount());

        // Simulate SSE message
        if (countListener) {
            countListener({ data: JSON.stringify({ count: 42 }) });
        }

        await waitFor(() => expect(result.current.count).toBe(42));
    });

    it("should fallback to polling on SSE error", async () => {
        let errorListener: any;
        vi.mocked(global.EventSource).mockImplementation((url: string) => {
            const instance = new MockEventSource(url);
            // In the hook, onerror is assigned directly
            setTimeout(() => { if (instance.onerror) instance.onerror(); }, 0);
            return instance as any;
        });

        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ count: 10 })
        } as any);

        const { result } = renderHook(() => useVisitorCount());

        // Fast-forward through retries
        vi.runAllTimers();

        await waitFor(() => expect(result.current.isPolling).toBe(true));
        expect(result.current.count).toBe(10);
    });
});
