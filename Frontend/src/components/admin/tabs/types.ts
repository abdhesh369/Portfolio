export type TabKey = "overview" | "analytics" | "messages" | "templates" | "projects" | "skills" | "experiences" | "services" | "seo" | "articles" | "testimonials" | "mindset" | "customization" | "settings" | "case-studies" | "clients" | "sketchpad";

export interface AdminTabProps {
    onNavigate?: (tab: TabKey) => void;
}
