import {
    Menu, Bell, Search, User, LogOut, ChevronRight, Settings
} from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

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
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="h-16 flex items-center justify-between px-4 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Left Side: Mobile Menu + Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
                    >
                        <Menu size={20} />
                    </button>

                    <div className={cn("hidden sm:flex items-center gap-2 text-slate-400 text-sm")}>
                        <span className="font-medium hover:text-slate-600 transition-colors cursor-pointer">Admin</span>
                        <ChevronRight size={14} className="mt-0.5" />
                        <span className="text-slate-900 font-semibold uppercase tracking-wider text-xs">
                            {activeTab.replace("-", " ")}
                        </span>
                    </div>
                </div>

                {/* Right Side: Tools + User */}
                <div className="flex items-center gap-1 lg:gap-3">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative">
                        <Search size={20} />
                    </button>

                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>

                    <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-2 p-1 pl-1 lg:pl-2 rounded-full hover:bg-slate-100 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 group-hover:border-blue-300 transition-colors">
                                <User size={16} />
                            </div>
                            <span className="text-sm font-medium text-slate-700 hidden lg:block pr-1">
                                {user?.username || "Admin"}
                            </span>
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 py-1 flex flex-col animate-in">
                                <div className="px-4 py-2 border-b border-slate-50">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Account</p>
                                    <p className="text-sm font-medium text-slate-900 truncate">{user?.username}</p>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                    <User size={16} />
                                    My Profile
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                    <Settings size={16} />
                                    Settings
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                    onClick={() => logout()}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
