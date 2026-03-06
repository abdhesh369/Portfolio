import { useState, useEffect, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/auth-context";
import { useMessageStream } from "@/hooks/use-message-stream";
import "@/styles/admin.css";
import { TabErrorBoundary } from "@/components/admin/TabErrorBoundary";
import AdminLayout from "@/components/admin/AdminLayout";

// Lazy-loaded Tab Components
const OverviewTab = lazy(() => import("@/components/admin/tabs/OverviewTab").then(m => ({ default: m.OverviewTab })));
const AnalyticsOverview = lazy(() => import("@/components/admin/AnalyticsOverview").then(m => ({ default: m.AnalyticsOverview })));
const EmailTemplatesTab = lazy(() => import("@/components/admin/tabs/EmailTemplatesTab").then(m => ({ default: m.EmailTemplatesTab })));
const MessagesTab = lazy(() => import("@/components/admin/tabs/MessagesTab").then(m => ({ default: m.MessagesTab })));
const ProjectsTab = lazy(() => import("@/components/admin/tabs/ProjectsTab").then(m => ({ default: m.ProjectsTab })));
const SkillsTab = lazy(() => import("@/components/admin/tabs/SkillsTab").then(m => ({ default: m.SkillsTab })));
const ExperiencesTab = lazy(() => import("@/components/admin/tabs/ExperiencesTab").then(m => ({ default: m.ExperiencesTab })));
const ServicesTab = lazy(() => import("@/components/admin/tabs/ServicesTab").then(m => ({ default: m.ServicesTab })));
const SeoTab = lazy(() => import("@/components/admin/tabs/SeoTab").then(m => ({ default: m.SeoTab })));
const ArticlesTab = lazy(() => import("@/components/admin/tabs/ArticlesTab").then(m => ({ default: m.ArticlesTab })));
const TestimonialsTab = lazy(() => import("@/components/admin/tabs/TestimonialsTab").then(m => ({ default: m.TestimonialsTab })));
const AuditLogTab = lazy(() => import("@/components/admin/tabs/AuditLogTab").then(m => ({ default: m.AuditLogTab })));
const GuestbookTab = lazy(() => import("@/components/admin/tabs/GuestbookTab").then(m => ({ default: m.GuestbookTab })));
const MindsetTab = lazy(() => import("@/components/admin/tabs/MindsetTab"));
const CustomizationTab = lazy(() => import("@/components/admin/tabs/CustomizationTab").then(m => ({ default: m.CustomizationTab })));
const SettingsTab = lazy(() => import("@/components/admin/tabs/SettingsTab").then(m => ({ default: m.SettingsTab })));

type Tab = "overview" | "analytics" | "messages" | "templates" | "projects" | "skills" | "experiences" | "services" | "seo" | "articles" | "testimonials" | "guestbook" | "audit" | "mindset" | "customization" | "settings";

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
    guestbook: "GUESTBOOK",
    audit: "AUDIT LOG",
    mindset: "MINDSET",
    customization: "CUSTOMIZATION",
    settings: "SITE SETTINGS",
};

export default function AdminDashboard() {
    const [tab, setTab] = useState<Tab>("overview");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const stored = localStorage.getItem("admin:sidebarCollapsed");
        return stored === "true";
    });

    useEffect(() => {
        localStorage.setItem("admin:sidebarCollapsed", String(sidebarCollapsed));
    }, [sidebarCollapsed]);

    // SSE real-time notifications
    const { resetUnread } = useMessageStream(true);

    // Reset unread count when switching to messages tab
    useEffect(() => {
        if (tab === "messages") resetUnread();
    }, [tab, resetUnread]);

    return (
        <AdminLayout
            activeTab={tab}
            onNavigate={(newTab) => setTab(newTab)}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
        >
            <Suspense fallback={
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-[var(--nm-accent)] border-t-transparent rounded-full animate-spin" />
                </div>
            }>
                <TabErrorBoundary tabName={TAB_LABELS[tab]}>
                    {tab === "overview" && <OverviewTab onNavigate={setTab} />}
                    {tab === "analytics" && <AnalyticsOverview />}
                    {tab === "messages" && <MessagesTab />}
                    {tab === "templates" && <EmailTemplatesTab />}
                    {tab === "projects" && <ProjectsTab />}
                    {tab === "skills" && <SkillsTab />}
                    {tab === "experiences" && <ExperiencesTab />}
                    {tab === "seo" && <SeoTab />}
                    {tab === "services" && <ServicesTab />}
                    {tab === "articles" && <ArticlesTab />}
                    {tab === "testimonials" && <TestimonialsTab />}
                    {tab === "guestbook" && <GuestbookTab />}
                    {tab === "audit" && <AuditLogTab />}
                    {tab === "mindset" && <MindsetTab />}
                    {tab === "customization" && <CustomizationTab />}
                    {tab === "settings" && <SettingsTab />}
                </TabErrorBoundary>
            </Suspense>
        </AdminLayout>
    );
}
