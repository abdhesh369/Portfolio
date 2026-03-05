import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { hydrateFromCache, subscribeToQueryCache } from "./query-cache-persister";
import { apiFetch } from "./api-helpers";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Delegate to apiFetch for automatic 401 refresh handling.
  // apiFetch returns parsed JSON, so we wrap it to return a Response-like result
  // for backward compatibility with callers that may call .json() on the result.
  const result = await apiFetch(url, {
    method,
    body: data ? JSON.stringify(data) : undefined,
  });

  // Return a synthetic Response so callers that do `await apiRequest(...)`
  // without calling `.json()` still work. Those that call `.json()`
  // on the return value will get the already-parsed data.
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const res = await fetch(queryKey.join("/") as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry 401 errors
        if (error?.message?.includes('401')) {
          return false;
        }
        // Retry up to 3 times for network/5xx errors (handles cold starts)
        // Wait 1s, 3s, 7s between attempts
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 3s, 7s
        return Math.pow(2, attemptIndex) * 1000 + Math.random() * 1000;
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.message?.includes('401')) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => {
        return Math.pow(2, attemptIndex) * 1000 + Math.random() * 1000;
      },
    },
  },
});

// Hydrate from localStorage so returning users see cached data instantly,
// then subscribe to persist future successful fetches.
hydrateFromCache(queryClient);
subscribeToQueryCache(queryClient);
