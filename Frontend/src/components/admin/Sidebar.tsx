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
                "fixed lg:sticky top-0 left-0 h-screen z-50 transition-all duration-500 var(--nm-timing)",
                "sidebar-container flex flex-col",
                collapsed ? "w-[var(--admin-sidebar-collapsed)]" : "w-[var(--admin-sidebar-width)]",
                mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Brand Section: Technical Gear */}
                <div className="h-[var(--admin-topbar-height)] flex items-center shrink-0 justify-center relative">
                    <div
                        className="group cursor-pointer relative"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-var(--nm-card) shadow-float flex items-center justify-center relative overflow-hidden nm-flat group-hover:scale-110 transition-all duration-500">
                            <div className="absolute inset-0 bg-var(--nm-accent-gradient) opacity-10 group-hover:opacity-20 transition-opacity" />
                            {settings?.personalAvatar && !avatarError ? (
                                <img
                                    src={settings.personalAvatar}
                                    className="w-10 h-10 object-cover rounded-xl z-10"
                                    onError={() => setAvatarError(true)}
                                    alt="Logo"
                                />
                            ) : (
                                <span className="font-black text-xl text-purple-500 z-10 tracking-tighter">{brandInitial}</span>
                            )}
                        </div>
                        {/* Status Ring */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-var(--nm-bg) flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                </div>

                {/* Navigation Items: technical spacing */}
                <nav className="flex-1 py-8 px-4 flex flex-col gap-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {NAV_ITEMS.map((item, idx) => {
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
                                    collapsed && "justify-center p-0 h-[56px] w-[56px] mx-auto shrink-0"
                                )}
                                style={{
                                    transitionDelay: `${idx * 40}ms`,
                                    animation: `fadeInRight 0.5s var(--nm-timing) forwards ${idx * 0.05}s`
                                }}
                                title={collapsed ? item.label : undefined}
                            >
                                <div className={cn(
                                    "flex items-center justify-center transition-all duration-500 shrink-0",
                                    isActive ? "text-[var(--nm-accent-purple)] scale-110" : "group-hover:text-purple-400 group-hover:rotate-12"
                                )}>
                                    <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                                </div>

                                {!collapsed && (
                                    <span className="font-bold text-[10px] tracking-[0.25em] whitespace-nowrap opacity-100 transition-all duration-300 uppercase">
                                        {item.label}
                                    </span>
                                )}

                                {isActive && (
                                    <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[var(--nm-accent-purple)] rounded-r-full shadow-[0_0_15px_rgba(124,58,237,0.6)]" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Action: Context Sync */}
                <div className="p-6 border-t border-white/5">
                    <div className={cn(
                        "nm-inset p-3 transition-all duration-500",
                        collapsed ? "w-12 h-12 p-0 flex items-center justify-center mx-auto" : "flex items-center gap-4"
                    )}>
                        <div className="w-8 h-8 rounded-xl bg-purple-500/5 flex items-center justify-center text-purple-500 group">
                            <Globe size={16} className="group-hover:rotate-180 transition-transform duration-[2s]" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-[8px] uppercase tracking-[0.4em] font-black text-slate-500">Kernel_Link</span>
                                <span className="text-[10px] font-bold truncate uppercase text-slate-300">{brandName}</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
