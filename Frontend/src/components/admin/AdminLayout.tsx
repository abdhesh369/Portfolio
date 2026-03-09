import { useState, ReactNode, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ThemeProvider, useTheme } from "@/components/theme-provider";

interface AdminLayoutProps {
    children: ReactNode;
    activeTab: string;
    onNavigate: (tab: string) => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

const AdminLayoutContent: React.FC<AdminLayoutProps> = ({
    children,
    activeTab,
    onNavigate,
    sidebarCollapsed,
    setSidebarCollapsed
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isFetching: isRefreshing } = useSiteSettings();
    const { theme } = useTheme();
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            setResolvedTheme(systemTheme);

            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => {
                setResolvedTheme(mediaQuery.matches ? "dark" : "light");
            };
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        } else {
            setResolvedTheme(theme as "light" | "dark");
        }
    }, [theme]);

    return (
        <div className={`admin-mode min-h-screen relative overflow-hidden selection:bg-purple-500/30 selection:text-white ${resolvedTheme}`}>
            {/* Ambient Technical Glows */}
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

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
                <div className="flex-1 min-h-screen flex flex-col relative transition-all duration-500 var(--nm-timing)">
                    <TopBar
                        activeTab={activeTab}
                        setMobileMenuOpen={setMobileMenuOpen}
                        sidebarCollapsed={sidebarCollapsed}
                        isRefreshing={isRefreshing}
                    />

                    <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-[1700px] mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                        {children}
                    </main>

                    {/* Technical Status Footer */}
                    <footer className="px-12 py-8 opacity-30">
                        <div className="flex items-center justify-between text-[9px] font-black tracking-[0.3em] uppercase text-[var(--admin-text-muted)] border-t border-white/5 pt-8">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-technical" />
                                    CORE_LINK_STABLE
                                </div>
                                <div className="w-px h-3 bg-white/10" />
                                <span>KERNEL_v5.0.4-LATEST</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <span>ENCRYPTED_SESSION</span>
                                <span>© 2026_CONFIG_ENGINE</span>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>

            {/* Notifications Portal */}
            <div id="admin-notifications" className="fixed bottom-10 right-10 z-[70] flex flex-col gap-4" />
        </div>
    );
};

const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <ThemeProvider defaultTheme="dark" storageKey="admin-theme" disableGlobalClass>
            <AdminLayoutContent {...props} />
        </ThemeProvider>
    );
};

export default AdminLayout;
