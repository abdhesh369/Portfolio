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
    return { "Content-Type": "application/json" };
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...opts,
        credentials: 'include',
        headers: { ...authHeaders(), ...(opts.headers as Record<string, string> ?? {}) },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `Request failed (${res.status})`);
    }
    if (res.status === 204) return null;
    return res.json();
}
