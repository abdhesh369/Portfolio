import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-helpers";

/**
 * Server status states:
 * - "checking"  → initial ping in progress
 * - "online"    → /health responded 200 OK
 * - "waking"    → response was slow (>3 s) or returned non-200 (cold start)
 * - "offline"   → network error / server totally unreachable
 */
export type ServerStatus = "checking" | "online" | "waking" | "offline";

const HEALTH_URL = `${API_BASE_URL}/health`;
const COLD_START_TIMEOUT_MS = 3_000; // treat >3 s as "waking up"
const POLL_INTERVAL_MS = 5_000;      // retry every 5 s when not online

/**
 * Fetch with an AbortController-based timeout.
 * Returns { ok, slow } where `slow` is true when the response took longer
 * than `COLD_START_TIMEOUT_MS` (but eventually succeeded).
 */
async function pingHealth(signal?: AbortSignal): Promise<{ ok: boolean; slow: boolean }> {
  const controller = new AbortController();
  const mergedSignal = signal; // caller can cancel externally

  // If the caller already aborted, bail immediately
  if (mergedSignal?.aborted) return { ok: false, slow: false };

  // Wire external signal → inner controller
  const onExternalAbort = () => controller.abort();
  mergedSignal?.addEventListener("abort", onExternalAbort, { once: true });

  let slow = false;
  const slowTimer = setTimeout(() => {
    slow = true;
  }, COLD_START_TIMEOUT_MS);

  try {
    const res = await fetch(HEALTH_URL, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(slowTimer);
    return { ok: res.ok, slow };
  } catch {
    clearTimeout(slowTimer);
    return { ok: false, slow: false };
  } finally {
    mergedSignal?.removeEventListener("abort", onExternalAbort);
  }
}

export function useServerStatus() {
  const [status, setStatus] = useState<ServerStatus>("checking");
  const queryClient = useQueryClient();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const wasOfflineRef = useRef(false); // tracks if we ever left "online"

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const check = useCallback(async () => {
    // Create a fresh AbortController per check
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const { ok, slow } = await pingHealth(ac.signal);

    // If this check was aborted (component unmounted), ignore the result
    if (ac.signal.aborted) return;

    if (ok && !slow) {
      setStatus("online");
      stopPolling();

      // If we were previously in a degraded state, refetch all queries
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        queryClient.invalidateQueries();
      }
    } else if (ok && slow) {
      // Server responded but took a while — cold-start detected
      setStatus("online");
      stopPolling();
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        queryClient.invalidateQueries();
      }
    } else {
      // Distinguish waking vs offline based on whether slow timer fired
      // If the request failed quickly (<3 s), the server is likely offline.
      // If it timed out / was slow, it's probably waking up.
      wasOfflineRef.current = true;
      setStatus((prev) => (prev === "checking" ? "waking" : prev === "waking" ? "waking" : "offline"));
      startPolling();
    }
  }, [queryClient, stopPolling]); // eslint-disable-line react-hooks/exhaustive-deps

  const startPolling = useCallback(() => {
    if (pollingRef.current) return; // already polling
    pollingRef.current = setInterval(() => {
      check();
    }, POLL_INTERVAL_MS);
  }, [check]);

  // Initial check on mount
  useEffect(() => {
    check();
    return () => {
      abortRef.current?.abort();
      stopPolling();
    };
  }, [check, stopPolling]);

  return status;
}
