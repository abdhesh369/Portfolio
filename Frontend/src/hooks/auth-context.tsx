import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useLocation } from "wouter";
import { API_BASE_URL } from "@/lib/api-helpers";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_QUERY_KEY } from "@/lib/query-keys";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const queryClient = useQueryClient();

    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/status`, {
                credentials: 'include'
            });
            if (res.ok) {
                setIsAuthenticated(true);
            } else if (res.status === 401) {
                // Access token expired — try silent refresh before giving up
                const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include'
                });
                if (refreshRes.ok) {
                    // Refresh succeeded — new access token cookie is set, verify status
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        } catch (err) {
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, [queryClient]); // queryClient is stable from useQueryClient()

    const login = () => {
        localStorage.removeItem("auth_last_exit");
        setIsAuthenticated(true);
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    };

    const logout = useCallback(async () => {
        try {
            await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
                method: "POST",
                credentials: 'include'
            });
        } finally {
            setIsAuthenticated(false);
            localStorage.removeItem("auth_last_exit");
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        }
    }, [queryClient]);

    useEffect(() => {
        checkAuth();
    }, []);

    // Listen for session-expired events from apiFetch
    useEffect(() => {
        const handler = () => { logout(); };
        window.addEventListener("auth:session-expired", handler);
        return () => window.removeEventListener("auth:session-expired", handler);
    }, [logout]);

    // Session Lock / Timeout Logic (5 minutes absence)
    // Now simpler: just clears the session if user was gone too long
    useEffect(() => {
        if (!isAuthenticated) return;

        const TIMEOUT_MS = 5 * 60 * 1000;

        const checkTimeout = () => {
            const lastExit = localStorage.getItem("auth_last_exit");
            if (lastExit) {
                const elapsed = Date.now() - parseInt(lastExit, 10);
                if (elapsed > TIMEOUT_MS) {
                    logout();
                    return true;
                }
            }
            return false;
        };

        const handleExit = () => {
            if (document.visibilityState === 'hidden') {
                localStorage.setItem("auth_last_exit", Date.now().toString());
            } else {
                // Tab became visible — check timeout, then clear the marker
                if (!checkTimeout()) {
                    localStorage.removeItem("auth_last_exit");
                }
            }
        };

        checkTimeout();

        window.addEventListener("visibilitychange", handleExit);
        const focusHandler = () => checkTimeout();
        window.addEventListener("focus", focusHandler);

        return () => {
            window.removeEventListener("visibilitychange", handleExit);
            window.removeEventListener("focus", focusHandler);
        };
    }, [isAuthenticated, logout]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}

/* ---------------------------------- */
/* Protected Route                     */
/* ---------------------------------- */

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const [, navigate] = useLocation();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/admin/login", { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!isAuthenticated) return null;

    return <>{children}</>;
}
