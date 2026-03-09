import { useState, useEffect } from "react";
import {
    LayoutDashboard, BarChart3, Mail, FileText, FolderKanban,
    Zap, Briefcase, Settings, Search, PenTool, Star, Shield,
    Brain, Sliders, BookOpen, Users, Globe, Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    activeTab: string;
    onNavigate: (tab: string) => void;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

const NAV_ITEMS = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "messages", label: "Messages", icon: Mail },
    { key: "projects", label: "Projects", icon: FolderKanban },
    { key: "skills", label: "Skills", icon: Zap },
    { key: "experiences", label: "Experiences", icon: Briefcase },
    { key: "articles", label: "Articles", icon: PenTool },
    { key: "templates", label: "Email Templates", icon: FileText },
    { key: "seo", label: "SEO Settings", icon: Search },
    { key: "services", label: "Services", icon: Settings },
    { key: "testimonials", label: "Testimonials", icon: Star },
    { key: "guestbook", label: "Guestbook", icon: FileText },
    { key: "audit", label: "Audit Log", icon: Shield },
    { key: "case-studies", label: "Case Studies", icon: BookOpen },
    { key: "clients", label: "Clients", icon: Users },
    { key: "sketchpad", label: "Sketchpad", icon: PenTool },
    { key: "mindset", label: "Mindset", icon: Brain },
    { key: "customization", label: "Appearance", icon: Palette },
    { key: "settings", label: "Site Settings", icon: Sliders },
];

export default function Sidebar({
    collapsed,
    setCollapsed,
    activeTab,
    onNavigate,
    mobileOpen,
    setMobileOpen
}: SidebarProps) {
    const { data: settings } = useSiteSettings();
    const [avatarError, setAvatarError] = useState(false);

    useEffect(() => {
        setAvatarError(false);
    }, [settings?.personalAvatar]);

    const brandName = settings?.personalName || "OS_ADMIN";
    const brandInitial = brandName.charAt(0).toUpperCase();

    return (
        <>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed lg:sticky top-0 left-0 h-screen z-50 transition-all duration-500 ease-out",
                "sidebar-container flex flex-col",
                collapsed ? "w-[var(--admin-sidebar-collapsed)]" : "w-[var(--admin-sidebar-width)]",
                mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Brand Section */}
                <div className="h-[72px] flex items-center shrink-0 justify-center relative">
                    <div
                        className="icon-container-inset group cursor-pointer"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500">
                            {settings?.personalAvatar && !avatarError ? (
                                <img
                                    src={settings.personalAvatar}
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={() => setAvatarError(true)}
                                    alt="Logo"
                                />
                            ) : (
                                <span className="font-bold text-lg">{brandInitial}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-6 px-3 flex flex-col gap-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {NAV_ITEMS.map((item) => {
                        const isActive = activeTab === item.key;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.key}
                                onClick={() => {
                                    onNavigate(item.key);
                                    if (window.innerWidth < 1024) setMobileOpen(false);
                                }}
                                className={cn(
                                    "nm-nav-item group relative",
                                    isActive && "active",
                                    collapsed && "justify-center p-0 h-[48px] w-[48px] mx-auto shrink-0"
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <div className={cn(
                                    "flex items-center justify-center transition-all duration-500 shrink-0",
                                    isActive ? "text-indigo-500" : "group-hover:text-indigo-400 group-hover:rotate-12"
                                )}>
                                    <Icon size={20} strokeWidth={2.5} />
                                </div>

                                {!collapsed && (
                                    <span className="font-bold text-xs tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300 uppercase">
                                        {item.label}
                                    </span>
                                )}

                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Action */}
                <div className="p-4 border-t border-black/5 bg-black/[0.01]">
                    <div className={cn(
                        "nm-inset p-2.5 transition-all duration-500",
                        collapsed ? "w-10 h-10 p-0 flex items-center justify-center mx-auto" : "flex items-center gap-3"
                    )}>
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 animate-pulse">
                            <Globe size={14} />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">Context</span>
                                <span className="text-[10px] font-bold truncate uppercase">{brandName}</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
