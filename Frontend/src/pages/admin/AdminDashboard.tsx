import { useState } from "react";
import { useAuth } from "@/hooks/auth-context";
import { Button } from "@/components/ui/button";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";

// Modular Tab Components
import { OverviewTab } from "@/components/admin/tabs/OverviewTab";
import { EmailTemplatesTab } from "@/components/admin/tabs/EmailTemplatesTab";
import { MessagesTab } from "@/components/admin/tabs/MessagesTab";
import { ProjectsTab } from "@/components/admin/tabs/ProjectsTab";
import { SkillsTab } from "@/components/admin/tabs/SkillsTab";
import { ExperiencesTab } from "@/components/admin/tabs/ExperiencesTab";
import { SeoTab } from "@/components/admin/tabs/SeoTab";
import { ArticlesTab } from "@/components/admin/tabs/ArticlesTab";

type Tab = "overview" | "analytics" | "messages" | "templates" | "projects" | "skills" | "experiences" | "seo" | "articles";

export default function AdminDashboard() {
    const [tab, setTab] = useState<Tab>("overview");
    const { logout, token } = useAuth();

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: "overview", label: "Overview", icon: "📊" },
        { key: "analytics", label: "Analytics", icon: "📈" },
        { key: "messages", label: "Messages", icon: "✉️" },
        { key: "templates", label: "Templates", icon: "📄" },
        { key: "projects", label: "Projects", icon: "🚀" },
        { key: "skills", label: "Skills", icon: "⚡" },
        { key: "experiences", label: "Experiences", icon: "💼" },
        { key: "seo", label: "SEO", icon: "🔍" },
        { key: "articles", label: "Articles", icon: "📝" },
    ];

    return (
        <div className="min-h-screen" style={{ background: "hsl(224 71% 4%)" }}>
            {/* ============ TOP NAV ============ */}
            <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl"
                style={{ background: "hsl(222 47% 11% / 0.8)" }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-sm font-bold text-white">
                            A
                        </div>
                        <span className="text-white font-semibold text-sm hidden sm:block"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Admin Panel
                        </span>
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${tab === t.key
                                    ? "bg-white/10 text-white"
                                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                                    }`}
                            >
                                <span className="mr-1.5">{t.icon}</span>
                                <span className="hidden sm:inline">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <Button variant="ghost" size="sm" onClick={logout}
                        className="text-white/50 hover:text-white text-xs"
                    >
                        Logout
                    </Button>
                </div>
            </nav>

            {/* ============ CONTENT ============ */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {tab === "overview" && <OverviewTab token={token} />}
                {tab === "analytics" && <AnalyticsOverview />}
                {tab === "messages" && <MessagesTab token={token} />}
                {tab === "templates" && <EmailTemplatesTab token={token} />}
                {tab === "projects" && <ProjectsTab token={token} />}
                {tab === "skills" && <SkillsTab token={token} />}
                {tab === "experiences" && <ExperiencesTab token={token} />}
                {tab === "seo" && <SeoTab token={token} />}
                {tab === "articles" && <ArticlesTab token={token} />}
            </main>
        </div>
    );
}
