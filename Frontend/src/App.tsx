import { Switch, Route, useRoute, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, Component, type ReactNode, useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, ProtectedRoute } from "@/hooks/auth-context";
import { ReloadPrompt } from "@/components/ReloadPrompt";
import { InstallPrompt } from "@/components/InstallPrompt";
import { LazyMotion, m } from "framer-motion";
const loadFramerFeatures = () => import("@/lib/framer-features").then(res => res.default);
import { pageTransition, withReducedMotion } from "@/lib/animation";
import { useTheme } from "@/components/theme-provider";
import { sanitizeCss } from "@/lib/utils";

// Lazy load heavy components
const PlexusBackground = lazy(() => import("@/components/PlexusBackground").then(m => ({ default: m.PlexusBackground })));
const AnalyticsTracker = lazy(() => import("@/components/AnalyticsTracker").then(m => ({ default: m.AnalyticsTracker })));
const Chatbot = lazy(() => import("@/components/Chatbot").then(m => ({ default: m.Chatbot })));

// Eager-load Home for fast LCP — it no longer imports framer-motion directly
import Home from "@/pages/Home";
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const BlogList = lazy(() => import("@/pages/BlogList"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
import NotFound from "@/pages/not-found";

// Lazy load admin pages
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

import { ErrorBoundary } from "./components/ErrorBoundary";
import { ServerStatusBanner } from "./components/ServerStatusBanner";
import { useSiteSettings } from "@/hooks/use-site-settings";

// SettingsApplicator: Applies dynamic CSS variables and custom CSS from site settings
function SettingsApplicator() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // Apply color variables
    if (settings.colorBackground) {
      root.style.setProperty("--background", settings.colorBackground);
    }
    if (settings.colorSurface) {
      root.style.setProperty("--card", settings.colorSurface);
    }

    // Apply custom CSS if provided
    if (settings.customCss) {
      let styleEl = document.getElementById("custom-portfolio-styles");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "custom-portfolio-styles";
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = sanitizeCss(settings.customCss);
    }
  }, [settings]);

  return null;
}

// SettingsFontLoader: Dynamically loads Google Fonts based on settings
function SettingsFontLoader() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    const fonts = new Set<string>();
    if (settings.fontDisplay && settings.fontDisplay !== "Inter") {
      fonts.add(settings.fontDisplay);
    }
    if (settings.fontBody && settings.fontBody !== "Inter") {
      fonts.add(settings.fontBody);
    }

    if (fonts.size === 0) return;

    // Build Google Fonts URL
    const fontList = Array.from(fonts)
      .map(f => f.replace(/\s+/g, "+"))
      .join("&family=");
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontList}&display=swap`;

    // Apply font variables to root unconditionally
    const root = document.documentElement;
    if (settings.fontDisplay) {
      root.style.setProperty("--font-display", `"${settings.fontDisplay}", sans-serif`);
    }
    if (settings.fontBody) {
      root.style.setProperty("--font-body", `"${settings.fontBody}", sans-serif`);
    }

    // Check if link already exists
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (existingLink) return;

    // Remove old custom font links to prevent duplicates
    const oldFontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"][data-custom-font="true"]');
    oldFontLinks.forEach(link => link.remove());

    // Create and inject link tag
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    link.setAttribute("data-custom-font", "true");
    document.head.appendChild(link);
  }, [settings]);

  return null;
}

// Only show PlexusBackground on public routes
function ConditionalBackground() {
  const [isAdmin] = useRoute("/admin/*?");
  const [isAdminLogin] = useRoute("/admin/login");
  if (isAdmin || isAdminLogin) return null;
  return <PlexusBackground />;
}

// Load analytics after a short delay to avoid blocking first paint
function DeferredAnalytics() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(t);
  }, []);
  return show ? (
    <Suspense fallback={null}>
      <AnalyticsTracker />
    </Suspense>
  ) : null;
}

// Router component
function Router() {
  const [location] = useLocation();
  const { reducedMotion } = useTheme();
  const transition = withReducedMotion(pageTransition, reducedMotion);
  return (
    <Suspense fallback={<PageLoader />}>
      <m.div
        key={location}
        initial={transition.initial}
        animate={transition.animate}
        transition={transition.transition}
      >
        <Switch>
          {/* Public routes */}
          <Route path="/" component={Home} />
          <Route path="/project/:id" component={ProjectDetail} />
          <Route path="/blog" component={BlogList} />
          <Route path="/blog/:slug" component={BlogPost} />

          {/* Admin routes */}
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin">
            {() => (
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            )}
          </Route>

          <Route component={NotFound} />
        </Switch>
      </m.div>
    </Suspense>
  );
}

// Defer background loading to prioritize main content
function DeferredBackground() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Use requestIdleCallback to load 3D background after browser is idle
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(() => setShouldLoad(true));
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => setShouldLoad(true), 800);
      return () => clearTimeout(id);
    }
  }, []);

  if (!shouldLoad) return null;
  return (
    <Suspense fallback={null}>
      <ConditionalBackground />
    </Suspense>
  );
}

// Only show ChatBot on public routes — load on idle, not fixed timeout
function DeferredChatbot() {
  const [isAdmin] = useRoute("/admin/*?");
  const [isAdminLogin] = useRoute("/admin/login");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isAdmin || isAdminLogin) return;
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(() => setShow(true));
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(id);
    }
  }, [isAdmin, isAdminLogin]);

  if (isAdmin || isAdminLogin || !show) return null;

  return (
    <Suspense fallback={null}>
      <Chatbot />
    </Suspense>
  );
}

// framer-motion import moved to top of file

// Main App component
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="portfolio-theme">
          <AuthProvider>
            <LazyMotion features={loadFramerFeatures}>
              {/* Apply dynamic settings early */}
              <SettingsApplicator />
              <SettingsFontLoader />

              <a
                href="#main-content"
                className="skip-to-content sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
              >
                Skip to main content
              </a>
              <ServerStatusBanner />
              <DeferredAnalytics />
              <Router />
              <DeferredBackground />
              <DeferredChatbot />
              <ReloadPrompt />
              <InstallPrompt />
              <Toaster />
            </LazyMotion>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
