export const API_BASE_URL = (() => {
    if (import.meta.env.DEV) {
        return "http://localhost:5000";
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

export function authHeaders(token: string | null) {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
}

export async function apiFetch(path: string, token: string | null, opts: RequestInit = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...opts,
        credentials: 'include',
        headers: { ...authHeaders(token), ...(opts.headers as Record<string, string> ?? {}) },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `Request failed (${res.status})`);
    }
    if (res.status === 204) return null;
    return res.json();
}
