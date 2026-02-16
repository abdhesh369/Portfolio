import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";

/* ---------------------------------- */
/* Auth Context                        */
/* ---------------------------------- */

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem("auth_token")
    );

    const isAuthenticated = !!token;

    const login = (newToken: string) => {
        localStorage.setItem("auth_token", newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        setToken(null);
    };

    // Sync across tabs
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === "auth_token") {
                setToken(e.newValue);
            }
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
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
    const { isAuthenticated } = useAuth();
    const [, navigate] = useLocation();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/admin/login", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) return null;

    return <>{children}</>;
}
