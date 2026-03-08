import { useState, ReactNode, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface AdminLayoutProps {
    children: ReactNode;
    activeTab: string;
    onNavigate: (tab: string) => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
    children,
    activeTab,
    onNavigate,
    sidebarCollapsed,
    setSidebarCollapsed
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { isFetching: isRefreshing } = useSiteSettings();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <div className="admin-mode min-h-screen relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Ambient background glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Container */}
            <div className="flex relative z-10">
                {/* Sidebar */}
                <Sidebar
                    collapsed={sidebarCollapsed}
                    setCollapsed={setSidebarCollapsed}
                    activeTab={activeTab}
                    onNavigate={onNavigate}
                    mobileOpen={mobileMenuOpen}
                    setMobileOpen={setMobileMenuOpen}
                />

                {/* Content Area */}
                <div className="flex-1 min-h-screen flex flex-col relative transition-all duration-500 ease-in-out">
                    <TopBar
                        activeTab={activeTab}
                        setMobileMenuOpen={setMobileMenuOpen}
                        sidebarCollapsed={sidebarCollapsed}
                        isRefreshing={isRefreshing}
                    />

                    <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </main>

                    {/* Subtle Neumorphic Footer */}
                    <footer className="px-8 py-6 opacity-40">
                        <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-[var(--admin-text-muted)]">
                            <span className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Kernel Operational
                            </span>
                            <span>v4.0.0-SoftUI</span>
                        </div>
                    </footer>
                </div>
            </div>

            {/* Notifications Portal */}
            <div id="admin-notifications" className="fixed bottom-8 right-8 z-[70] flex flex-col gap-4" />
        </div>
    );
};

export default AdminLayout;
