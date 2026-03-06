import {
    LayoutDashboard, BarChart3, Mail, FileText, FolderKanban,
    Zap, Briefcase, Settings, Search, PenTool, Star, Shield,
    Brain, Sliders, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    activeTab: string;
    onNavigate: (tab: any) => void;
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
    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-[60] bg-[var(--nm-bg)] transition-all duration-300 ease-in-out lg:translate-x-0",
                collapsed ? "w-[80px]" : "w-[288px]",
                mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            )}
        >
            <div className="flex flex-col h-full">
                {/* Brand */}
                <div className="h-[72px] flex items-center px-6">
                    <div className={cn(
                        "flex items-center gap-3 overflow-hidden p-2 rounded-xl nm-flat",
                        collapsed && "p-1"
                    )}>
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        {!collapsed && (
                            <span className="font-heading font-bold text-base tracking-tight whitespace-nowrap text-[var(--admin-text-primary)]">
                                OS_ADMIN_v3
                            </span>
                        )}
                    </div>

                    {/* Mobile Close */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="ml-auto lg:hidden p-2 text-[var(--admin-text-secondary)] hover:text-indigo-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 mt-4 custom-scrollbar">
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
                                    "sidebar-link group relative",
                                    active && "active"
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon size={20} className={cn("shrink-0 transition-all", active ? "text-indigo-500" : "group-hover:scale-110")} />
                                {!collapsed && (
                                    <span className="text-[13px] font-bold uppercase tracking-wider truncate">
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Toggle */}
                <div className="p-4">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex w-full items-center justify-center p-3 rounded-xl nm-button text-[var(--admin-text-secondary)] hover:text-indigo-500 transition-all"
                    >
                        {collapsed ? <ChevronRight size={20} /> : (
                            <div className="flex items-center gap-2">
                                <ChevronLeft size={20} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Dock System</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
}
