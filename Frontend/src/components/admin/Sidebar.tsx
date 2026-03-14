import { useState, useEffect } from "react";
import {
    LayoutDashboard, BarChart3, Mail, FileText, FolderKanban,
    Zap, Briefcase, Settings, Search, PenTool, Star, Shield,
    Brain, Sliders, BookOpen, Users, Globe, Palette, Wrench, MessageCircle, Pencil, ChevronLeft, ChevronRight, X, Send
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
    unreadCount?: number;
}

const NAV_GROUPS = [
    {
        label: "DASHBOARD",
        items: [
            { key: "overview", label: "Overview", icon: LayoutDashboard },
            { key: "analytics", label: "Analytics", icon: BarChart3 },
        ]
    },
    {
        label: "CONTENT",
        items: [
            { key: "projects", label: "Projects", icon: FolderKanban },
            { key: "skills", label: "Skills", icon: Zap },
            { key: "experiences", label: "Experiences", icon: Briefcase },
            { key: "articles", label: "Articles", icon: PenTool },
            { key: "mindset", label: "Mindset", icon: Brain },
            { key: "services", label: "Services", icon: Wrench },
        ]
    },
    {
        label: "ENGAGEMENT",
        items: [
            { key: "messages", label: "Messages", icon: Mail, showBadge: true },
            { key: "guestbook", label: "Guestbook", icon: MessageCircle },
            { key: "testimonials", label: "Testimonials", icon: Star },
            { key: "clients", label: "Clients", icon: Users },
        ]
    },
    {
        label: "PUBLISHING",
        items: [
            { key: "newsletter", label: "Newsletter", icon: Send },
            { key: "seo", label: "SEO Settings", icon: Search },
            { key: "templates", label: "Email Templates", icon: FileText },
            { key: "case-studies", label: "Case Studies", icon: BookOpen },
        ]
    },
    {
        label: "SYSTEM",
        items: [
            { key: "customization", label: "Appearance & Theme", icon: Palette },
            { key: "settings", label: "Layout & Features", icon: Sliders },
            { key: "sketchpad", label: "Sketchpad", icon: Pencil },
            { key: "audit", label: "Audit Log", icon: Shield },
        ]
    }
];

export default function Sidebar({
    collapsed,
    setCollapsed,
    activeTab,
    onNavigate,
    mobileOpen,
    setMobileOpen,
    unreadCount = 0
}: SidebarProps) {
    const { data: settings } = useSiteSettings();
    const [avatarError, setAvatarError] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setAvatarError(false);
    }, [settings?.personalAvatar]);

    // Handle Escape key to clear search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSearchQuery("");
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const brandName = settings?.personalName || "OS_ADMIN";
    const brandInitial = brandName.charAt(0).toUpperCase();

    const filteredGroups = NAV_GROUPS.map(group => ({
        ...group,
        items: group.items.filter(item => 
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(group => group.items.length > 0);

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
                "fixed lg:sticky top-0 left-0 h-screen z-50 transition-all duration-500 ease-[var(--nm-timing)]",
                "sidebar-container flex flex-col",
                collapsed ? "w-[var(--admin-sidebar-collapsed)]" : "w-[var(--admin-sidebar-width)]",
                mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Brand Section: Technical Gear */}
                <div className="h-[var(--admin-topbar-height)] flex items-center shrink-0 justify-between px-6 relative">
                    <div
                        className="group cursor-pointer relative"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <div className={cn(
                            "rounded-2xl bg-var(--nm-card) shadow-float flex items-center justify-center relative overflow-hidden nm-flat group-hover:scale-110 transition-all duration-500",
                            collapsed ? "w-12 h-12" : "w-10 h-10"
                        )}>
                            <div className="absolute inset-0 bg-var(--nm-accent-gradient) opacity-10 group-hover:opacity-20 transition-opacity" />
                            {settings?.personalAvatar && !avatarError ? (
                                <img
                                    src={settings.personalAvatar}
                                    className="w-full h-full object-cover rounded-xl z-10"
                                    onError={() => setAvatarError(true)}
                                    alt="Logo"
                                />
                            ) : (
                                <span className="font-black text-xl text-purple-500 z-10 tracking-tighter">{brandInitial}</span>
                            )}
                        </div>
                    </div>

                    {!collapsed && (
                        <button 
                            onClick={() => setCollapsed(true)}
                            className="w-8 h-8 nm-inset rounded-lg flex items-center justify-center text-[var(--admin-text-secondary)] hover:text-purple-400 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                </div>

                {/* Search Implementation */}
                <div className="px-4 py-2 shrink-0">
                    <div className={cn(
                        "relative transition-all duration-500",
                        collapsed ? "w-12 h-12 mx-auto" : "w-full"
                    )}>
                        {collapsed ? (
                            <button 
                                onClick={() => {
                                    setCollapsed(false);
                                    setTimeout(() => document.getElementById('sidebar-search')?.focus(), 500);
                                }}
                                className="w-12 h-12 nm-button flex items-center justify-center text-[var(--admin-text-secondary)] hover:text-purple-400"
                            >
                                <Search size={18} />
                            </button>
                        ) : (
                            <div className="relative group">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-secondary)] group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    id="sidebar-search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="FILTER_NAV..."
                                    className="w-full h-11 pl-11 pr-10 nm-inset rounded-xl text-[10px] font-black tracking-widest bg-transparent border-none focus:ring-1 focus:ring-purple-500/20 placeholder:text-[var(--admin-text-muted)] text-[var(--admin-text-primary)] outline-none"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-secondary)] hover:text-pink-500 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Items: grouped spacing */}
                <nav className="flex-1 py-4 px-4 flex flex-col gap-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {filteredGroups.map((group, groupIdx) => (
                        <div key={group.label} className="flex flex-col gap-3">
                            {/* Group Header */}
                            <div className="flex items-center gap-3 h-4 px-2">
                                {!collapsed ? (
                                    <span className="text-[8px] uppercase tracking-[0.4em] text-[var(--admin-text-muted)] font-black whitespace-nowrap">
                                        {group.label}
                                    </span>
                                ) : (
                                    <div className="w-full h-px bg-[var(--nm-light)]" />
                                )}
                            </div>

                            {/* Group Items */}
                            <div className="flex flex-col gap-2">
                                {group.items.map((item, itemIdx) => {
                                    const isActive = activeTab === item.key;
                                    const Icon = item.icon;
                                    const isMessages = item.key === 'messages';

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
                                                collapsed && "justify-center p-0 h-12 w-12 mx-auto shrink-0"
                                            )}
                                            style={{
                                                transitionDelay: `${itemIdx * 20}ms`,
                                            }}
                                            title={collapsed ? item.label : undefined}
                                        >
                                            <div className={cn(
                                                "flex items-center justify-center transition-all duration-500 shrink-0 relative",
                                                isActive ? "text-[var(--nm-accent-purple)] scale-110" : "group-hover:text-purple-400 group-hover:rotate-12 text-[var(--admin-text-secondary)]"
                                            )}>
                                                <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 2} />
                                                
                                                {/* Notification Dot (Collapsed) */}
                                                {collapsed && isMessages && unreadCount > 0 && (
                                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-pink-600 rounded-full border-2 border-[var(--nm-bg)]" />
                                                )}
                                            </div>

                                            {!collapsed && (
                                                <span className={cn(
                                                    "font-bold text-[9px] tracking-[0.2em] whitespace-nowrap opacity-100 transition-all duration-300 uppercase flex-1 text-left",
                                                    isActive ? "text-[var(--admin-text-primary)]" : "text-[var(--admin-text-secondary)] group-hover:text-[var(--admin-text-primary)]"
                                                )}>
                                                    {item.label}
                                                </span>
                                            )}

                                            {!collapsed && isMessages && unreadCount > 0 && (
                                                <span className="ml-2 px-2 py-0.5 nm-inset rounded-lg text-[9px] font-black text-pink-500 animate-pulse">
                                                    {unreadCount}
                                                </span>
                                            )}

                                            {isActive && (
                                                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--nm-accent-purple)] rounded-r-full shadow-[0_0_15px_rgba(124,58,237,0.6)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer Action: Context Sync */}
                <div className="p-4 border-t border-[var(--nm-light)]">
                    <div className={cn(
                        "nm-inset p-3 transition-all duration-500",
                        collapsed ? "w-12 h-12 p-0 flex items-center justify-center mx-auto rounded-xl" : "flex items-center gap-4 rounded-2xl"
                    )}>
                        <div className="w-8 h-8 rounded-xl bg-purple-500/5 flex items-center justify-center text-purple-500 group">
                            <Globe size={16} className="group-hover:rotate-180 transition-transform duration-[length:2s]" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-[8px] uppercase tracking-[0.4em] font-black text-[var(--admin-text-muted)]">Kernel_Link</span>
                                <span className="text-[10px] font-bold truncate uppercase text-[var(--admin-text-primary)]">{brandName}</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
