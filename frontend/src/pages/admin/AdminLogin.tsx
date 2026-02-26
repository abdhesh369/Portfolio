import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/auth-context";
import { useToast } from "@/hooks/use-toast";

import { API_BASE_URL } from "@/lib/api-helpers";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const [, navigate] = useLocation();
    const { toast } = useToast();

    // If already logged in, redirect
    if (isAuthenticated) {
        navigate("/admin", { replace: true });
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!password.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
                credentials: 'include'
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: "Login failed" }));
                throw new Error(err.message || "Invalid credentials");
            }

            const data = await res.json();
            login(data.token);
            toast({
                title: "Welcome back, Admin!",
                description: "You are now logged in.",
            });
            navigate("/admin", { replace: true });
        } catch (err: any) {
            toast({
                title: "Login Failed",
                description: err.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{
                background: "linear-gradient(135deg, hsl(224 71% 4%) 0%, hsl(263 40% 10%) 50%, hsl(224 71% 4%) 100%)",
            }}
        >
            {/* Decorative background orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, hsl(263 70% 50%), transparent)" }}
                />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, hsl(239 84% 67%), transparent)" }}
                />
            </div>

            <div className="relative w-full max-w-md animate-fade-in">
                {/* Card */}
                <div className="rounded-2xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl"
                    style={{ background: "hsl(222 47% 11% / 0.85)" }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-primary">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Admin Panel
                        </h1>
                        <p className="text-sm text-white/50">Enter your password to continue</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="admin-password"
                                className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="admin-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    autoFocus
                                    disabled={loading}
                                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-white/30
                      border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                      transition-all duration-200 outline-none disabled:opacity-50"
                                    style={{ background: "hsl(224 71% 4% / 0.6)" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors p-1"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password.trim()}
                            className="w-full py-3 px-4 rounded-xl font-semibold text-white
                bg-gradient-primary hover:opacity-90 active:scale-[0.98]
                transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-white/30 mt-6">
                        This area is restricted to the site administrator.
                    </p>
                </div>

                {/* Back link */}
                <div className="text-center mt-6">
                    <a
                        href="/"
                        className="text-sm text-white/40 hover:text-white/70 transition-colors"
                    >
                        ← Back to Portfolio
                    </a>
                </div>
            </div>
        </div>
    );
}
