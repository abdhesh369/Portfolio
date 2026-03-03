export type TabKey = "overview" | "analytics" | "messages" | "templates" | "projects" | "skills" | "experiences" | "services" | "seo" | "articles" | "testimonials";

export interface AdminTabProps {
    token: string | null;
    onNavigate?: (tab: TabKey) => void;
}
