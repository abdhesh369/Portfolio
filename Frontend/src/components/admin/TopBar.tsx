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
}

export default function TopBar({ activeTab, setMobileMenuOpen }: TopBarProps) {
    const { user, logout } = useAuth();
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
        <header className="sticky top-0 z-40 h-[72px] nm-flat transition-all">
            <div className="h-full flex items-center justify-between px-4 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Left Side: Mobile Menu + Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="w-10 h-10 nm-button lg:hidden"
                    >
                        <Menu size={18} />
                    </button>

                    <div className={cn("hidden sm:flex items-center gap-3 text-[var(--admin-text-secondary)] text-[11px] font-bold uppercase tracking-widest")}>
                        <span className="hover:text-indigo-500 transition-colors cursor-pointer">System</span>
                        <ChevronRight size={12} className="opacity-50" />
                        <span className="text-[var(--admin-text-primary)] tracking-[0.15em]">
                            {activeTab.replace("-", "_")}
                        </span>
                    </div>
                </div>

                {/* Right Side: Search + Tools + User */}
                <div className="flex items-center gap-4 flex-1 justify-end">
                    {/* Search Bar */}
                    <div className="hidden md:flex items-center relative w-72">
                        <Search size={16} className="absolute left-4 text-[var(--admin-text-secondary)]" />
                        <input
                            type="text"
                            placeholder="SEARCH_COMMAND..."
                            className="w-full h-10 pl-12 pr-4 nm-inset rounded-full text-xs font-bold tracking-widest text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-secondary)] focus:outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={ripple} className="w-10 h-10 rounded-full nm-button text-[var(--admin-text-secondary)] hover:text-indigo-500 transition-all relative group">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        </button>

                        <button onClick={ripple} className="w-10 h-10 rounded-full nm-button text-[var(--admin-text-secondary)] hover:text-indigo-500 transition-all hidden sm:flex">
                            <Settings size={18} />
                        </button>

                        <div className="w-1 h-6 nm-inset mx-2 hidden sm:block rounded-full" />

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-3 p-1.5 rounded-full nm-button hover:nm-flat transition-all group"
                            >
                                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                                    <User size={14} />
                                </div>
                                <span className="text-[11px] font-bold text-[var(--admin-text-primary)] hidden lg:block pr-2 tracking-widest uppercase">
                                    {user?.username || "ROOT"}
                                </span>
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-4 w-56 nm-flat rounded-2xl py-2 flex flex-col animate-in overflow-hidden z-50">
                                    <div className="px-5 py-3 border-b border-white/20">
                                        <p className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em] mb-1">Access Protocol</p>
                                        <p className="text-xs font-black text-[var(--admin-text-primary)] truncate">{user?.username}</p>
                                    </div>
                                    <button className="flex items-center gap-3 px-5 py-3 text-xs font-bold text-[var(--admin-text-secondary)] hover:bg-white/10 hover:text-indigo-500 transition-all">
                                        <User size={14} />
                                        User Profile
                                    </button>
                                    <button className="flex items-center gap-3 px-5 py-3 text-xs font-bold text-[var(--admin-text-secondary)] hover:bg-white/10 hover:text-indigo-500 transition-all">
                                        <Settings size={14} />
                                        Kernel Config
                                    </button>
                                    <div className="h-px bg-white/20 mx-4 my-1" />
                                    <button
                                        onClick={() => logout()}
                                        className="flex items-center gap-3 px-5 py-3 text-xs font-black text-rose-500 hover:bg-rose-500/10 transition-all"
                                    >
                                        <LogOut size={14} />
                                        TERMINATE_SESSION
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
