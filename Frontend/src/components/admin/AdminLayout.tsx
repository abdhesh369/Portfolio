import { useState, ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface AdminLayoutProps {
    children: ReactNode;
    activeTab: string;
    onNavigate: (tab: any) => void;
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
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out min-h-screen flex flex-col",
                    sidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[288px]"
                )}
            >
                <TopBar
                    activeTab={activeTab}
                    setMobileMenuOpen={setMobileMenuOpen}
                    sidebarCollapsed={sidebarCollapsed}
                    isRefreshing={isRefreshing}
                />

                <main className="flex-1 p-4 lg:p-8 animate-in">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>

                <footer className="py-6 px-4 lg:px-8 text-center text-[var(--admin-text-secondary)] text-xs font-bold uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} {settings?.personalName?.toUpperCase() || "ABDHESH"} | NEUMORPHIC_OS_v3.0                </footer>
            </div>
        </div>
    );
}
