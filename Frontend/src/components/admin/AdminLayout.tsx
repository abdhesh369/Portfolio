import { useState, ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface AdminLayoutProps {
    children: ReactNode;
    activeTab: string;
    onNavigate: (tab: string) => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

export default function AdminLayout({
    children,
    activeTab,
    onNavigate,
    sidebarCollapsed,
    setSidebarCollapsed,
}: AdminLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { data: settings, isFetching: isRefreshing } = useSiteSettings();

    return (
        <div className="min-h-screen bg-[var(--nm-bg)] text-[var(--admin-text-primary)] font-sans selection:bg-[var(--nm-accent)]/20 selection:text-[var(--nm-accent)]">
            {/* Sidebar Overlay (Mobile) */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Animated Grid Background */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(var(--glass-border) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                activeTab={activeTab}
                onNavigate={onNavigate}
                mobileOpen={mobileMenuOpen}
                setMobileOpen={setMobileMenuOpen}
            />

            {/* Main Content */}
            <div className={cn(
                "transition-all duration-300 relative z-10",
                sidebarCollapsed ? "lg:ml-[var(--admin-sidebar-collapsed)]" : "lg:ml-[var(--admin-sidebar-width)]"
            )}>
                <TopBar
                    activeTab={activeTab}
                    setMobileMenuOpen={setMobileMenuOpen}
                    sidebarCollapsed={sidebarCollapsed}
                    isRefreshing={isRefreshing}
                />

                <main className="admin-content animate-in">
                    {children}
                </main>
            </div>

            {/* Notifications Container */}
            <div id="admin-notifications" className="fixed bottom-8 right-8 z-[70] flex flex-col gap-4" />
        </div>
    );
}
