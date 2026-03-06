import { useState, ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";
import { cn } from "@/lib/utils";

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

    return (
        <div className="min-h-screen bg-[var(--nm-bg)] text-[var(--admin-text-primary)] font-sans selection:bg-blue-100 selection:text-blue-700">
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
                />

                <main className="flex-1 p-4 lg:p-8 animate-in">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>

                <footer className="py-6 px-4 lg:px-8 text-center text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} ABDHESH | NEUMORPHIC_OS_v3.0
                </footer>
            </div>
        </div>
    );
}
