export const API_BASE_URL = (() => {
    let url: string;

    // If running on localhost (dev or e2e), always use relative paths 
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        url = "";
    } else if (import.meta.env.DEV) {
        url = "";
    } else {
        url = import.meta.env.VITE_PRODUCTION_API_URL || import.meta.env.VITE_API_URL || "";
    }


    const prodUrl = url;

    if (!prodUrl) {
        console.warn("⚠️ VITE_API_URL not configured. Falling back to relative path or placeholder.");
        // Fallback to relative or a safe default if available, 
        // but don't throw to avoid total boot failure.
        return window.location.origin;
    }

    // Strip any trailing slashes to prevent //api/v1 double-slash 404s
    return prodUrl.replace(/\/+$/, "");
})();

export class ApiError extends Error {
    constructor(public status: number, message: string, public data?: unknown) {
        super(message);
        this.name = "ApiError";
    }
}

// In-memory storage for CSRF token to handle cross-origin SOP restrictions
let memCsrfToken: string | null = null;

export function setCsrfToken(token: string) {
    memCsrfToken = token;
}

export function getCsrfToken() {
    return memCsrfToken;
}

export function authHeaders() {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    // 1. Try in-memory token (captured from login/refresh response body)
    if (memCsrfToken) {
        headers["X-CSRF-Token"] = memCsrfToken;
    }
    // 2. Fallback to reading from cookie (Double Submit)
    else {
        const csrfMatch = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
        if (csrfMatch) {
            headers["X-CSRF-Token"] = decodeURIComponent(csrfMatch[1]);
        }
    }

    return headers;
}

/**
 * Deduplicates concurrent refresh attempts — all 401 callers share a single refresh request.
 */
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });
        if (res.ok) {
            const data = await res.json();
            if (data.csrfToken) {
                setCsrfToken(data.csrfToken);
            }
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...opts,
        credentials: 'include',
        headers: { ...authHeaders(), ...(opts.headers as Record<string, string> ?? {}) },
    });

    // Silent refresh on 401 — skip for the refresh endpoint itself to avoid infinite loops
    if (res.status === 401 && !path.includes("/auth/refresh")) {
        // Deduplicate concurrent refresh attempts
        if (!refreshPromise) {
            refreshPromise = attemptRefresh().finally(() => { refreshPromise = null; });
        }

        const refreshed = await refreshPromise;

        if (refreshed) {
            // Retry original request with fresh access token
            const retryRes = await fetch(`${API_BASE_URL}${path}`, {
                ...opts,
                credentials: 'include',
                headers: { ...authHeaders(), ...(opts.headers as Record<string, string> ?? {}) },
            });
            if (!retryRes.ok) {
                const err = await retryRes.json().catch(() => ({ message: retryRes.statusText }));
                throw new ApiError(retryRes.status, err.message || `Request failed (${retryRes.status})`, err);
            }
            if (retryRes.status === 204) return null;
            return retryRes.json();
        }

        // Refresh failed — notify AuthProvider via event (avoids full page reload)
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
        throw new ApiError(401, "Session expired. Please login again.");
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new ApiError(res.status, err.message || `Request failed (${res.status})`, err);
    }
    if (res.status === 204) return null;
    return res.json();
}
