import { useState, useEffect } from "react";
import {
    LayoutDashboard, BarChart3, Mail, FileText, FolderKanban,
    Zap, Briefcase, Settings, Search, PenTool, Star, Shield,
    Brain, Sliders, ChevronLeft, ChevronRight, X, BookOpen, Users
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
    { key: "analytics", label: "Analytics", icon: BarChart3 },
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
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-[60] transition-all duration-300 ease-in-out lg:translate-x-0 glass-nav",
                collapsed ? "w-[var(--admin-sidebar-collapsed)]" : "w-[var(--admin-sidebar-width)]",
                mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            )}
        >
            <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-xl">
                {/* Brand */}
                <div className="h-[72px] flex items-center px-6">
                    <div className={cn(
                        "flex items-center gap-3 overflow-hidden p-2 rounded-xl bg-white/5 border border-white/10",
                        collapsed && "p-1"
                    )}>
                        <div className="w-8 h-8 rounded-lg bg-[var(--admin-accent)] flex items-center justify-center shrink-0 shadow-lg shadow-[var(--admin-accent)]/30 overflow-hidden">
                            {(settings?.personalAvatar && !avatarError) ? (
                                <img
                                    src={settings.personalAvatar}
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                    onError={() => setAvatarError(true)}
                                />
                            ) : (
                                <span className="text-white font-bold text-lg">{brandInitial}</span>
                            )}
                        </div>
                        {!collapsed && (
                            <span className="font-heading font-black text-xs tracking-[0.2em] whitespace-nowrap text-[var(--admin-text-primary)]">
                                {brandName.replace(/\s+/g, '_').toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Mobile Close */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="ml-auto lg:hidden p-2 text-[var(--admin-text-secondary)] hover:text-[var(--admin-accent)] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 mt-2 custom-scrollbar">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = activeTab === item.key;

                        return (
                            <button
                                key={item.key}
                                onClick={() => {
                                    onNavigate(item.key);
                                    setMobileOpen(false);
                                }}
                                className={cn(
                                    "sidebar-link group relative py-3 px-4",
                                    active && "active bg-indigo-500/10 text-indigo-400"
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon size={18} className={cn("shrink-0 transition-transform duration-300", active ? "text-indigo-400" : "group-hover:scale-110 group-hover:text-white")} />
                                {!collapsed && (
                                    <span className="text-[11px] font-black uppercase tracking-[0.15em] truncate">
                                        {item.label}
                                    </span>
                                )}
                                {active && (
                                    <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Toggle */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex w-full items-center justify-center p-3 rounded-xl glass-button text-[var(--admin-text-secondary)] hover:text-[var(--admin-accent)] transition-all"
                    >
                        {collapsed ? <ChevronRight size={18} /> : (
                            <div className="flex items-center gap-2">
                                <ChevronLeft size={18} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dock System</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
}
