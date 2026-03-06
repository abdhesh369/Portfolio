export type TabKey = "overview" | "analytics" | "messages" | "templates" | "projects" | "skills" | "experiences" | "services" | "seo" | "articles" | "testimonials" | "mindset" | "settings" | "guestbook" | "audit";

export interface AdminTabProps {
    onNavigate?: (tab: TabKey) => void;
}
