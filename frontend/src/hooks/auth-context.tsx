import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { API_BASE_URL } from "@/lib/api-helpers";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/status`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setIsAuthenticated(true);
                // We keep the token in memory only if needed for other legacy parts
                if (data.token) setToken(data.token);
            } else {
                setIsAuthenticated(false);
                setToken(null);
            }
        } catch (err) {
            setIsAuthenticated(false);
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = (newToken: string) => {
        setToken(newToken);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: "POST",
                credentials: 'include'
            });
        } finally {
            setToken(null);
            setIsAuthenticated(false);
            localStorage.removeItem("auth_last_exit");
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

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
                localStorage.removeItem("auth_last_exit");
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
    }, [isAuthenticated]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, token, login, logout, checkAuth }}>
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
