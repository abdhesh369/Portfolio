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
                "fixed inset-y-0 left-0 z-[60] bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:translate-x-0",
                collapsed ? "w-[80px]" : "w-[260px]",
                mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            )}
        >
            <div className="flex flex-col h-full">
                {/* Brand */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        {!collapsed && (
                            <span className="font-heading font-semibold text-lg tracking-tight whitespace-nowrap">
                                Portfolio Admin
                            </span>
                        )}
                    </div>

                    {/* Mobile Close */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="ml-auto lg:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 custom-scrollbar">
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
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                    active
                                        ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon size={20} className={cn("shrink-0", active ? "text-blue-600" : "group-hover:scale-110 transition-transform")} />
                                {!collapsed && (
                                    <span className="text-sm font-medium leading-none truncate">
                                        {item.label}
                                    </span>
                                )}
                                {active && (
                                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Toggle */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                    >
                        {collapsed ? <ChevronRight size={20} /> : (
                            <div className="flex items-center gap-2">
                                <ChevronLeft size={20} />
                                <span className="text-xs font-medium uppercase tracking-wider">Collapse Sidebar</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
}
