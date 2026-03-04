export const API_BASE_URL = (() => {
    if (import.meta.env.DEV) {
        // Use relative paths to leverage Vite proxy in development
        return "";
    }

    const prodUrl = import.meta.env.VITE_API_URL;

    if (!prodUrl) {
        console.warn("⚠️ VITE_API_URL not configured. Falling back to relative path or placeholder.");
        // Fallback to relative or a safe default if available, 
        // but don't throw to avoid total boot failure.
        return window.location.origin;
    }

    return prodUrl;
})();

export function authHeaders() {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    // Read CSRF token from cookie and attach as header (Double Submit Cookie pattern)
    const csrfMatch = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
    if (csrfMatch) {
        headers["X-CSRF-Token"] = decodeURIComponent(csrfMatch[1]);
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
        return res.ok;
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
                throw new Error(err.message || `Request failed (${retryRes.status})`);
            }
            if (retryRes.status === 204) return null;
            return retryRes.json();
        }

        // Refresh failed — redirect to login
        window.location.href = "/admin/login";
        throw new Error("Session expired. Please login again.");
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `Request failed (${res.status})`);
    }
    if (res.status === 204) return null;
    return res.json();
}
