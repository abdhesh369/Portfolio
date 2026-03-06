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
        <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans selection:bg-blue-100 selection:text-blue-700">
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
                    sidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[260px]"
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

                <footer className="py-6 px-4 lg:px-8 border-t border-slate-200 text-center text-slate-400 text-xs tracking-wider">
                    &copy; {new Date().getFullYear()} ABDHESH | ADMIN_SYSTEM_v2.0
                </footer>
            </div>
        </div>
    );
}
