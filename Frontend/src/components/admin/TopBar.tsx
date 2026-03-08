import {
    Menu, Bell, Search, User, LogOut, ChevronRight, Settings
} from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRipple } from "@/hooks/use-ripple";

interface TopBarProps {
    activeTab: string;
    setMobileMenuOpen: (open: boolean) => void;
    sidebarCollapsed: boolean;
    isRefreshing?: boolean;
}

export default function TopBar({ activeTab, setMobileMenuOpen, isRefreshing }: TopBarProps) {
    const { user, logout } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const ripple = useRipple();

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
        <header className="sticky top-0 z-40 transition-all topbar-container">
            <div className="h-full flex items-center justify-between px-4 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Left Side: Mobile Menu + Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="w-10 h-10 glass-button rounded-xl lg:hidden flex items-center justify-center"
                    >
                        <Menu size={18} />
                    </button>

                    <div className={cn("hidden sm:flex items-center gap-3 text-[var(--admin-text-secondary)] text-[10px] font-black uppercase tracking-[0.2em]")}>
                        <span className="hover:text-[var(--admin-accent)] transition-colors cursor-pointer opacity-70">Control_Panel</span>
                        <ChevronRight size={12} className="opacity-30" />
                        <span className="text-[var(--admin-text-primary)] tracking-[0.25em] font-black">
                            {activeTab.replace(/-/g, "_")}
                        </span>
                        {isRefreshing && (
                            <div className="flex items-center gap-2 ml-4 px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                <span className="text-[8px] font-black tracking-tighter">DATA_SYNC...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Search + Tools + User */}
                <div className="flex items-center gap-4 flex-1 justify-end">
                    {/* Search Bar */}
                    <div className="hidden md:flex items-center relative w-72">
                        <Search size={14} className="absolute left-4 text-[var(--admin-text-secondary)] opacity-50" />
                        <input
                            type="text"
                            placeholder="SEARCH_KERNEL_LOGS..."
                            className="w-full h-10 pl-11 pr-4 glass-input rounded-xl text-[10px] font-black tracking-[0.1em] placeholder:opacity-50 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={ripple} className="w-10 h-10 rounded-xl glass-button flex items-center justify-center hover:text-indigo-400 relative group">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)] border-2 border-slate-900" />
                        </button>

                        <button onClick={ripple} className="w-10 h-10 rounded-xl glass-button flex items-center justify-center hover:text-indigo-400 hidden sm:flex">
                            <Settings size={18} />
                        </button>

                        <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-3 p-1 rounded-xl glass-button transition-all group hover:border-white/20"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-black text-xs">
                                    {user?.username?.charAt(0).toUpperCase() || <User size={14} />}
                                </div>
                                <span className="text-[10px] font-black text-[var(--admin-text-primary)] hidden lg:block pr-2 tracking-[0.15em] uppercase">
                                    {user?.username || "ROOT"}
                                </span>
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-3 w-64 glass-card rounded-2xl py-2 flex flex-col animate-in overflow-hidden z-50 shadow-2xl">
                                    <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                                        <p className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.2em] mb-1">Access Protocol</p>
                                        <p className="text-sm font-black text-[var(--admin-text-primary)] truncate tracking-wide">{user?.username}</p>
                                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter mt-1">Super_User Privilege</p>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        <button disabled className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold text-[var(--admin-text-secondary)] opacity-50 cursor-not-allowed transition-colors hover:bg-white/5">
                                            <User size={14} />
                                            CORE_IDENTITY
                                        </button>
                                        <button disabled className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold text-[var(--admin-text-secondary)] opacity-50 cursor-not-allowed transition-colors hover:bg-white/5">
                                            <Settings size={14} />
                                            SYSTEM_ROOT
                                        </button>
                                        <div className="h-px bg-white/5 mx-2 my-1" />
                                        <button
                                            onClick={() => logout()}
                                            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black text-rose-400 hover:bg-rose-500/10 transition-all hover:text-rose-300"
                                        >
                                            <LogOut size={14} />
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
