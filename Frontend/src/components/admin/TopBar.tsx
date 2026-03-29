import {
    Menu, Bell, Search, User, LogOut, ChevronRight, Sun, Moon, Settings, Globe, Clock
} from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { useTheme } from "@/components/theme-provider";
import { useState, useRef, useEffect } from "react";
import { useMutationState } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TopBarProps {
    activeTab: string;
    setMobileMenuOpen: (open: boolean) => void;
    sidebarCollapsed: boolean;
    isRefreshing?: boolean;
    unreadCount?: number;
    onNavigate?: (tab: string) => void;
}

export default function TopBar({ 
    activeTab, 
    setMobileMenuOpen, 
    isRefreshing, 
    unreadCount = 0,
    onNavigate 
}: TopBarProps) {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Track successful mutations to show "Last Saved"
    const mutationResults = useMutationState({
        filters: { status: 'success' },
        select: (mutation) => mutation.state.submittedAt,
    });

    useEffect(() => {
        if (mutationResults.length > 0) {
            setLastSaved(new Date());
        }
    }, [mutationResults.length]);

    const viewSiteUrl = typeof window !== 'undefined' ? window.location.origin : "";

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-40 h-[var(--admin-topbar-height)] topbar-container px-6 lg:px-12 flex items-center">
            <div className="w-full flex items-center justify-between">
                {/* Left Side: Mobile Menu + Technical Breadcrumbs */}
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="w-12 h-12 nm-button !p-0 lg:hidden"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="hidden sm:flex items-center gap-4 text-[var(--admin-text-secondary)] text-[10px] font-black uppercase tracking-[0.3em]">
                        <button 
                            onClick={() => onNavigate?.("overview")}
                            className="flex items-center gap-2 group cursor-pointer hover:text-purple-400 transition-all"
                        >
                            <span className="opacity-70 group-hover:opacity-100">CONFIG_ENGINE</span>
                        </button>
                        <ChevronRight size={14} className="opacity-20 translate-y-[1px] text-[var(--admin-text-primary)]" />
                        <button 
                            onClick={() => onNavigate?.(activeTab)}
                            className="text-[var(--admin-text-primary)] tracking-[0.4em] font-black drop-shadow-[0_0_10px_var(--nm-shadow)] hover:text-purple-400 transition-all uppercase"
                        >
                            {activeTab.replace(/-/g, "_")}
                        </button>
                        {isRefreshing && (
                            <div className="flex items-center gap-3 ml-6 px-3 py-1.5 nm-inset rounded-lg bg-emerald-500/5 text-emerald-500 border border-emerald-500/10">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black tracking-widest">DATA_SYNC_ACTIVE</span>
                            </div>
                        )}
                        {lastSaved && !isRefreshing && (
                            <div className="hidden lg:flex items-center gap-2 ml-6 text-[var(--admin-text-secondary)]">
                                <Clock size={12} />
                                <span className="text-[9px] font-bold tracking-widest">
                                    SAVED {formatDistanceToNow(lastSaved, { addSuffix: true }).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Search + Tools + User Profile */}
                <div className="flex items-center gap-6 flex-1 justify-end">
                    {/* Technical Search: Inset Focus */}
                    <div className="hidden md:flex items-center relative w-72 group">
                        <Search size={14} className="absolute left-5 text-[var(--admin-text-secondary)] opacity-30 group-focus-within:text-purple-500 transition-all group-focus-within:scale-110" />
                        <input
                            type="text"
                            placeholder="SEARCH_KERNEL_MODS..."
                            className="w-full h-12 pl-12 pr-6 nm-inset rounded-2xl text-[10px] font-black tracking-[0.2em] placeholder:text-[var(--admin-text-muted)] focus:outline-none transition-all focus:ring-1 focus:ring-purple-500/20 text-[var(--admin-text-primary)]"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => window.open(viewSiteUrl, "_blank")}
                            className="w-12 h-12 nm-button !p-0 flex items-center justify-center hover:text-purple-400 group"
                            title="View Site"
                        >
                            <Globe size={18} className="text-[var(--admin-text-primary)] group-hover:rotate-12 transition-transform" />
                        </button>

                        <button 
                            onClick={() => onNavigate?.("messages")}
                            className="w-12 h-12 nm-button !p-0 relative flex items-center justify-center group hover:text-purple-400"
                            title="Notifications"
                        >
                            <Bell size={20} className="text-[var(--admin-text-primary)]" />
                            {unreadCount > 0 && (
                                <span className="absolute top-3 right-3 w-5 h-5 bg-pink-600 rounded-full shadow-[0_0_12px_rgba(219,39,119,0.7)] ring-2 ring-[var(--nm-bg)] flex items-center justify-center text-[10px] font-black pointer-events-none animate-in zoom-in duration-300">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="w-12 h-12 nm-button !p-0 hidden sm:flex hover:text-purple-400 relative overflow-hidden"
                            title={`Re-Init Viewport Mode: ${theme === 'dark' ? 'LIGHT' : 'DARK'}`}
                        >
                            <div className={cn(
                                "absolute inset-0 flex items-center justify-center transition-all duration-700 var(--nm-timing)",
                                theme === "dark" ? "rotate-0 opacity-100" : "-rotate-180 opacity-0 scale-50"
                            )}>
                                <Moon size={20} />
                            </div>
                            <div className={cn(
                                "absolute inset-0 flex items-center justify-center transition-all duration-700 var(--nm-timing)",
                                theme === "light" ? "rotate-0 opacity-100" : "rotate-180 opacity-0 scale-50"
                            )}>
                                <Sun size={20} />
                            </div>
                        </button>

                        <div className="w-px h-8 bg-[var(--nm-light)] mx-2 hidden sm:block" />

                        {/* User Access Terminal */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                data-testid="profile-popover-trigger"
                                className={cn(
                                    "flex items-center gap-4 p-1.5 rounded-2xl transition-all group",
                                    profileOpen ? "nm-inset" : "nm-button"
                                )}
                            >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] font-black text-xs group-hover:scale-105 transition-transform">
                                    {user?.username?.charAt(0).toUpperCase() || "R"}
                                </div>
                                <div className="hidden lg:flex flex-col items-start pr-4 leading-tight">
                                    <span className="text-[10px] font-black text-[var(--admin-text-primary)] tracking-widest uppercase">
                                        {user?.username || "ROOT_USER"}
                                    </span>
                                    <span className="text-[8px] font-bold text-purple-500/80 tracking-tighter">PRIVILEGE_LVL_4</span>
                                </div>
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-6 w-72 nm-float rounded-3xl py-3 flex flex-col animate-in slide-in-from-top-4 duration-500 var(--nm-timing) overflow-hidden z-50 border border-[var(--nm-light)]">
                                    <div className="px-8 py-6 border-b border-[var(--nm-light)] bg-[var(--nm-card)]">
                                        <p className="text-[8px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.4em] mb-2">Access_Protocol</p>
                                        <p className="text-sm font-black text-[var(--admin-text-primary)] truncate tracking-wide">{user?.username || "ADMIN_UNKNWN"}</p>
                                        <div className="flex items-center gap-2 mt-3 text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            CORE_SECURITY_CLEARANCE
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <button disabled className="flex w-full items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold text-[var(--admin-text-muted)] opacity-30 cursor-not-allowed">
                                            <User size={16} />
                                            IDENTITY_CORE
                                        </button>
                                        <button disabled className="flex w-full items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold text-[var(--admin-text-muted)] opacity-30 cursor-not-allowed">
                                            <Settings size={16} />
                                            SYSTEM_RESOURCES
                                        </button>
                                        <div className="h-px bg-[var(--nm-light)] mx-3 my-2" />
                                        <button
                                            onClick={() => logout()}
                                            data-testid="logout-button"
                                            className="flex w-full items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black text-pink-500 hover:bg-pink-500/10 transition-all group"
                                        >
                                            <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                                            TERMINATE_SESSION
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
