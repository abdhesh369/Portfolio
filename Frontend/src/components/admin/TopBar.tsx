import {
    Menu, Bell, Search, User, LogOut, ChevronRight, Sun, Moon, Settings
} from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { useTheme } from "@/components/theme-provider";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TopBarProps {
    activeTab: string;
    setMobileMenuOpen: (open: boolean) => void;
    sidebarCollapsed: boolean;
    isRefreshing?: boolean;
}

export default function TopBar({ activeTab, setMobileMenuOpen, isRefreshing }: TopBarProps) {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

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
        <header className="sticky top-0 z-40 h-[var(--admin-topbar-height)] topbar-container px-4 lg:px-10">
            <div className="h-full flex items-center justify-between">
                {/* Left Side: Mobile Menu + Breadcrumbs */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="w-10 h-10 nm-button lg:hidden"
                    >
                        <Menu size={18} />
                    </button>

                    <div className="hidden sm:flex items-center gap-3 text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.2em]">
                        <span className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer">ADMIN_ROOT</span>
                        <ChevronRight size={12} className="opacity-30" />
                        <span className="text-[var(--admin-text-primary)] tracking-[0.25em] font-black">
                            {activeTab.replace(/-/g, "_")}
                        </span>
                        {isRefreshing && (
                            <div className="flex items-center gap-2 ml-4 px-2 py-1 nm-inset rounded bg-indigo-500/5 text-indigo-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[8px] font-black tracking-tighter">DATA_SYNC</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Search + Tools + User */}
                <div className="flex items-center gap-4 flex-1 justify-end">
                    {/* Search Bar */}
                    <div className="hidden md:flex items-center relative w-64 group">
                        <Search size={14} className="absolute left-4 text-[var(--admin-text-secondary)] opacity-50 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH_KERNEL..."
                            className="w-full h-10 pl-11 pr-4 nm-inset rounded-xl text-[10px] font-black tracking-[0.1em] placeholder:opacity-50 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 nm-button relative group hover:text-indigo-500">
                            <Bell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                        </button>

                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="w-10 h-10 nm-button hidden sm:flex hover:text-indigo-500 relative overflow-hidden"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            <div className={cn(
                                "absolute inset-0 flex items-center justify-center transition-transform duration-500",
                                theme === "dark" ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                            )}>
                                <Moon size={18} />
                            </div>
                            <div className={cn(
                                "absolute inset-0 flex items-center justify-center transition-transform duration-500",
                                theme === "light" ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
                            )}>
                                <Sun size={18} />
                            </div>
                        </button>

                        <div className="w-px h-6 bg-black/5 mx-1 hidden sm:block" />

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className={cn(
                                    "flex items-center gap-3 p-1 rounded-xl transition-all group",
                                    profileOpen ? "nm-inset" : "nm-button"
                                )}
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white shadow-lg font-black text-xs">
                                    {user?.username?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <span className="text-[10px] font-black text-[var(--admin-text-primary)] hidden lg:block pr-2 tracking-[0.15em] uppercase">
                                    {user?.username || "ROOT_ADMIN"}
                                </span>
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-4 w-64 nm-float rounded-2xl py-2 flex flex-col animate-in slide-in-from-top-2 duration-300 overflow-hidden z-50">
                                    <div className="px-6 py-4 border-b border-black/5 bg-black/[0.01]">
                                        <p className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.2em] mb-1">Access Protocol</p>
                                        <p className="text-sm font-black text-[var(--admin-text-primary)] truncate tracking-wide">{user?.username}</p>
                                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter mt-1">Super_User Privilege</p>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        <button disabled className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold text-[var(--admin-text-secondary)] opacity-50 cursor-not-allowed">
                                            <User size={14} />
                                            CORE_IDENTITY
                                        </button>
                                        <button disabled className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold text-[var(--admin-text-secondary)] opacity-50 cursor-not-allowed">
                                            <Settings size={14} />
                                            SYSTEM_ROOT
                                        </button>
                                        <div className="h-px bg-black/5 mx-2 my-1" />
                                        <button
                                            onClick={() => logout()}
                                            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black text-rose-500 hover:bg-rose-500/5 transition-all"
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
