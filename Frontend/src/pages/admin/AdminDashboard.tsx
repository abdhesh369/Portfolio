import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/auth-context";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import {
    LayoutDashboard, BarChart3, Mail, FileText, FolderKanban,
    Zap, Briefcase, Settings, Search, PenTool, Star,
    PanelLeftClose, PanelLeft, Bell, LogOut, ChevronRight, User, X,
} from "lucide-react";

// Modular Tab Components
import { OverviewTab } from "@/components/admin/tabs/OverviewTab";
import { EmailTemplatesTab } from "@/components/admin/tabs/EmailTemplatesTab";
import { MessagesTab } from "@/components/admin/tabs/MessagesTab";
import { ProjectsTab } from "@/components/admin/tabs/ProjectsTab";
import { SkillsTab } from "@/components/admin/tabs/SkillsTab";
import { ExperiencesTab } from "@/components/admin/tabs/ExperiencesTab";
import { ServicesTab } from "@/components/admin/tabs/ServicesTab";
import { SeoTab } from "@/components/admin/tabs/SeoTab";
import { ArticlesTab } from "@/components/admin/tabs/ArticlesTab";
import { TestimonialsTab } from "@/components/admin/tabs/TestimonialsTab";

type Tab = "overview" | "analytics" | "messages" | "templates" | "projects" | "skills" | "experiences" | "services" | "seo" | "articles" | "testimonials";

const NAV_ITEMS: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "messages", label: "Messages", icon: Mail, badge: 0 },
    { key: "templates", label: "Templates", icon: FileText },
    { key: "projects", label: "Projects", icon: FolderKanban },
    { key: "skills", label: "Skills", icon: Zap },
    { key: "experiences", label: "Experiences", icon: Briefcase },
    { key: "services", label: "Services", icon: Settings },
    { key: "seo", label: "SEO", icon: Search },
    { key: "articles", label: "Articles", icon: PenTool },
    { key: "testimonials", label: "Testimonials", icon: Star },
];

const TAB_LABELS: Record<Tab, string> = {
    overview: "OVERVIEW",
    analytics: "ANALYTICS",
    messages: "MESSAGES",
    templates: "TEMPLATES",
    projects: "PROJECTS",
    skills: "SKILLS",
    experiences: "EXPERIENCES",
    services: "SERVICES",
    seo: "SEO",
    articles: "ARTICLES",
    testimonials: "TESTIMONIALS",
};

export default function AdminDashboard() {
    const [tab, setTab] = useState<Tab>("overview");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [msgCount, setMsgCount] = useState(0);
    const { logout, token } = useAuth();

    // Search state
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchRef = useRef<HTMLDivElement>(null);

    // Profile dropdown state
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Fetch unread message count for badge
    useEffect(() => {
        import("@/lib/api-helpers").then(({ apiFetch }) => {
            apiFetch("/api/messages", token)
                .then((msgs: any[]) => setMsgCount(msgs?.length ?? 0))
                .catch(() => setMsgCount(0));
        });
    }, [token]);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search filtering
    const filteredNav = NAV_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Update nav badge dynamically
    const navItems = NAV_ITEMS.map((item) =>
        item.key === "messages" ? { ...item, badge: msgCount } : item
    );

    return (
        <div
            className="flex min-h-screen relative overflow-hidden"
            style={{
                background: "#050508",
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                color: "#e2e8f0",
            }}
        >
            {/* Animated background grid */}
            <div className="admin-grid-bg" />
            {/* Glow orbs */}
            <div className="admin-glow-tl" />
            <div className="admin-glow-br" />

            {/* ============ SIDEBAR ============ */}
            <aside
                className="admin-sidebar fixed top-0 left-0 bottom-0 z-10 flex flex-col"
                style={{ width: sidebarCollapsed ? 64 : 220 }}
            >
                {/* Logo */}
                <div
                    className="flex items-center gap-2.5 border-b border-cyan-400/10"
                    style={{
                        padding: sidebarCollapsed ? "20px 0" : "24px 20px",
                        justifyContent: sidebarCollapsed ? "center" : "flex-start",
                    }}
                >
                    <div
                        className="w-[34px] h-[34px] flex-shrink-0 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                            background: "linear-gradient(135deg, #22d3ee, #a78bfa)",
                            color: "#050508",
                        }}
                    >
                        A
                    </div>
                    {!sidebarCollapsed && (
                        <div>
                            <div className="text-[13px] font-bold text-slate-100" style={{ letterSpacing: "0.05em" }}>
                                Abdhesh.Dev
                            </div>
                            <div className="text-[10px] text-cyan-400" style={{ letterSpacing: "0.1em", opacity: 0.8 }}>
                                ADMIN_PANEL
                            </div>
                        </div>
                    )}
                </div>

                {/* Status badge */}
                {!sidebarCollapsed && (
                    <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div
                            className="inline-flex items-center gap-1.5 rounded text-[10px] text-cyan-400"
                            style={{
                                background: "rgba(34,211,238,0.08)",
                                border: "1px solid rgba(34,211,238,0.2)",
                                padding: "4px 8px",
                                letterSpacing: "0.08em",
                            }}
                        >
                            <span
                                className="w-[5px] h-[5px] bg-cyan-400 rounded-full"
                                style={{ boxShadow: "0 0 6px #22d3ee" }}
                            />
                            SYS.ONLINE
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-2 py-3 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = tab === item.key;
                        return (
                            <button
                                key={item.key}
                                onClick={() => setTab(item.key)}
                                className={`admin-sidebar-nav-btn ${isActive ? "active" : ""} ${sidebarCollapsed ? "collapsed" : ""}`}
                            >
                                <Icon size={15} className="flex-shrink-0" />
                                {!sidebarCollapsed && (
                                    <span className="flex-1 text-left" style={{ letterSpacing: "0.04em" }}>
                                        {item.label}
                                    </span>
                                )}
                                {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                                    <span
                                        className="rounded-full text-[9px] font-bold"
                                        style={{
                                            background: "#a78bfa",
                                            color: "#050508",
                                            padding: "1px 6px",
                                        }}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="admin-sidebar-nav-btn mx-2 mb-1"
                    style={{
                        color: "rgba(244,114,182,0.7)",
                        justifyContent: sidebarCollapsed ? "center" : "flex-start",
                        padding: sidebarCollapsed ? "10px 0" : "9px 12px",
                    }}
                >
                    <LogOut size={15} className="flex-shrink-0" />
                    {!sidebarCollapsed && <span className="flex-1 text-left">Logout</span>}
                </button>

                {/* Collapse button */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="mx-2 mb-3 p-2.5 rounded-md flex items-center justify-center gap-2 cursor-pointer text-[12px]"
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "rgba(148,163,184,0.6)",
                        fontFamily: "inherit",
                        letterSpacing: "0.05em",
                        transition: "all 0.15s ease",
                    }}
                >
                    {sidebarCollapsed ? <PanelLeft size={16} /> : (
                        <>
                            <PanelLeftClose size={14} />
                            <span>COLLAPSE</span>
                        </>
                    )}
                </button>
            </aside>

            {/* ============ MAIN ============ */}
            <main
                className="admin-main flex-1 flex flex-col min-h-screen relative z-[1]"
                style={{
                    marginLeft: sidebarCollapsed ? 64 : 220,
                    transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
                }}
            >
                {/* Top bar */}
                <header className="admin-topbar sticky top-0 z-[5] px-7 py-4 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] text-cyan-400 mb-0.5" style={{ letterSpacing: "0.15em" }}>
                            &gt; ADMIN_PANEL / {TAB_LABELS[tab]}
                        </div>
                        <div className="text-xl font-bold text-slate-100" style={{ letterSpacing: "0.03em" }}>
                            {TAB_LABELS[tab] === "OVERVIEW" ? "Dashboard" : TAB_LABELS[tab].charAt(0) + TAB_LABELS[tab].slice(1).toLowerCase()}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* ─── Search with dropdown ─── */}
                        <div ref={searchRef} className="relative">
                            <div
                                className="flex items-center gap-2 rounded-md"
                                style={{
                                    background: searchOpen ? "rgba(34,211,238,0.06)" : "rgba(255,255,255,0.04)",
                                    border: searchOpen ? "1px solid rgba(34,211,238,0.25)" : "1px solid rgba(255,255,255,0.08)",
                                    padding: "7px 12px",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <Search size={13} style={{ color: searchOpen ? "#22d3ee" : "rgba(148,163,184,0.5)" }} />
                                <input
                                    placeholder="Search tabs..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                                    onFocus={() => setSearchOpen(true)}
                                    className="bg-transparent border-none outline-none text-slate-200 text-xs w-[140px]"
                                    style={{ fontFamily: "inherit" }}
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                            {searchOpen && searchQuery.length > 0 && (
                                <div
                                    className="absolute top-full right-0 mt-2 w-[220px] rounded-lg overflow-hidden"
                                    style={{
                                        background: "rgba(10,10,18,0.95)",
                                        border: "1px solid rgba(34,211,238,0.15)",
                                        backdropFilter: "blur(12px)",
                                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                                    }}
                                >
                                    {filteredNav.length > 0 ? filteredNav.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.key}
                                                onClick={() => { setTab(item.key); setSearchQuery(""); setSearchOpen(false); }}
                                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-300 hover:text-cyan-300 cursor-pointer"
                                                style={{
                                                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                                                    background: tab === item.key ? "rgba(34,211,238,0.08)" : "transparent",
                                                    transition: "all 0.15s ease",
                                                    fontFamily: "inherit",
                                                    letterSpacing: "0.04em",
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(34,211,238,0.08)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = tab === item.key ? "rgba(34,211,238,0.08)" : "transparent")}
                                            >
                                                <Icon size={14} />
                                                <span>{item.label}</span>
                                                {tab === item.key && <ChevronRight size={12} className="ml-auto text-cyan-400" />}
                                            </button>
                                        );
                                    }) : (
                                        <div className="px-3.5 py-3 text-xs text-slate-500" style={{ letterSpacing: "0.05em" }}>
                                            No matching tabs
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ─── Notification Bell ─── */}
                        <button
                            onClick={() => setTab("messages")}
                            title={msgCount > 0 ? `${msgCount} messages — click to view` : "Messages — click to view"}
                            className="relative rounded-md cursor-pointer"
                            style={{
                                background: tab === "messages" ? "rgba(34,211,238,0.08)" : "rgba(255,255,255,0.04)",
                                border: tab === "messages" ? "1px solid rgba(34,211,238,0.25)" : "1px solid rgba(255,255,255,0.08)",
                                padding: "8px 10px",
                                color: tab === "messages" ? "#22d3ee" : "rgba(148,163,184,0.7)",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <Bell size={15} />
                            {msgCount > 0 && (
                                <span
                                    className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[9px] font-bold"
                                    style={{
                                        background: "#a78bfa",
                                        color: "#050508",
                                        boxShadow: "0 0 8px rgba(167,139,250,0.5)",
                                        padding: "0 4px",
                                    }}
                                >
                                    {msgCount > 99 ? "99+" : msgCount}
                                </span>
                            )}
                        </button>

                        {/* ─── Profile Avatar with dropdown ─── */}
                        <div ref={profileRef} className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[13px] font-bold cursor-pointer"
                                style={{
                                    background: profileOpen
                                        ? "linear-gradient(135deg, #a78bfa, #22d3ee)"
                                        : "linear-gradient(135deg, #22d3ee, #a78bfa)",
                                    color: "#050508",
                                    boxShadow: profileOpen ? "0 0 16px rgba(167,139,250,0.4)" : "0 0 12px rgba(34,211,238,0.3)",
                                    transition: "all 0.2s ease",
                                    border: "none",
                                }}
                            >
                                A
                            </button>
                            {profileOpen && (
                                <div
                                    className="absolute top-full right-0 mt-2 w-[200px] rounded-lg overflow-hidden"
                                    style={{
                                        background: "rgba(10,10,18,0.95)",
                                        border: "1px solid rgba(34,211,238,0.15)",
                                        backdropFilter: "blur(12px)",
                                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                                    }}
                                >
                                    {/* Profile info */}
                                    <div className="px-3.5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                        <div className="text-xs font-bold text-slate-100" style={{ letterSpacing: "0.04em" }}>
                                            Administrator
                                        </div>
                                        <div className="text-[10px] text-cyan-400 mt-0.5" style={{ letterSpacing: "0.06em" }}>
                                            ROLE: SUPER_ADMIN
                                        </div>
                                    </div>
                                    {/* Quick nav */}
                                    <button
                                        onClick={() => { setTab("overview"); setProfileOpen(false); }}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-300 hover:text-cyan-300 cursor-pointer"
                                        style={{
                                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                                            background: "transparent",
                                            transition: "all 0.15s ease",
                                            fontFamily: "inherit",
                                            letterSpacing: "0.04em",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(34,211,238,0.08)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <User size={13} />
                                        <span>Dashboard</span>
                                    </button>
                                    <button
                                        onClick={() => { setTab("seo"); setProfileOpen(false); }}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-300 hover:text-cyan-300 cursor-pointer"
                                        style={{
                                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                                            background: "transparent",
                                            transition: "all 0.15s ease",
                                            fontFamily: "inherit",
                                            letterSpacing: "0.04em",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(34,211,238,0.08)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <Settings size={13} />
                                        <span>SEO Settings</span>
                                    </button>
                                    {/* Logout */}
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs cursor-pointer"
                                        style={{
                                            color: "rgba(244,114,182,0.8)",
                                            background: "transparent",
                                            transition: "all 0.15s ease",
                                            fontFamily: "inherit",
                                            letterSpacing: "0.04em",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(244,114,182,0.06)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <LogOut size={13} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="admin-content flex-1 p-7 admin-animate-in" key={tab}>
                    {tab === "overview" && <OverviewTab token={token} onNavigate={setTab} />}
                    {tab === "analytics" && <AnalyticsOverview token={token} />}
                    {tab === "messages" && <MessagesTab token={token} />}
                    {tab === "templates" && <EmailTemplatesTab token={token} />}
                    {tab === "projects" && <ProjectsTab token={token} />}
                    {tab === "skills" && <SkillsTab token={token} />}
                    {tab === "experiences" && <ExperiencesTab token={token} />}
                    {tab === "seo" && <SeoTab token={token} />}
                    {tab === "services" && <ServicesTab token={token} />}
                    {tab === "articles" && <ArticlesTab token={token} />}
                    {tab === "testimonials" && <TestimonialsTab token={token} />}
                </div>

                {/* Footer */}
                <footer className="admin-footer flex justify-between items-center">
                    <span>ABDHESH.DEV / ADMIN_PANEL</span>
                    <span>SESSION_EXPIRES: 24H &nbsp;|&nbsp; BUILD: v2.0.1</span>
                </footer>
            </main>
        </div>
    );
}
