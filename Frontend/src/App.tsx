import { Switch, Route, useRoute, useLocation } from "wouter";
import { QueryClientProvider, useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Suspense, lazy, Component, type ReactNode, useEffect, useState, useMemo } from "react";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, ProtectedRoute } from "@/hooks/auth-context";
import { ReloadPrompt } from "@/components/ReloadPrompt";
import { InstallPrompt } from "@/components/InstallPrompt";
import { LazyMotion, m, AnimatePresence } from "framer-motion";
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
import type { SiteSettings } from "@shared/schema";

// SettingsApplicator: Applies dynamic CSS variables and custom CSS from site settings
function SettingsApplicator() {
  const { data: settings } = useSiteSettings() as { data: SiteSettings | undefined };

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // Helper to normalize and convert colors
    const normalizeHex = (hex: string) => {
      if (!/^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(hex)) return hex;
      let normalized = hex.replace("#", "");
      if (normalized.length === 3) {
        normalized = normalized.split('').map(c => c + c).join('');
      }
      return `#${normalized}`;
    };

    const hexToRgb = (hex: string) => {
      const fullHex = normalizeHex(hex);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      return result ?
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
        null;
    };

    const hexToHslComponents = (hex: string) => {
      const fullHex = normalizeHex(hex);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      if (!result) return null;

      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;

      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const applyColor = (varName: string, hex?: string | null) => {
      if (!hex) return;
      const normalized = normalizeHex(hex);
      const hsl = hexToHslComponents(normalized);
      if (hsl) {
        root.style.setProperty(`--${varName}`, hsl);
        root.style.setProperty(`--${varName}-hex`, normalized);
      } else {
        root.style.setProperty(`--${varName}`, hex);
      }
    };

    // Apply theme colors from dynamic settings
    applyColor("background", settings.colorBackground);
    applyColor("card", settings.colorSurface);
    applyColor("secondary", settings.colorSecondary);
    applyColor("accent", settings.colorAccent);
    applyColor("border", settings.colorBorder);
    applyColor("foreground", settings.colorText);
    applyColor("muted-foreground", settings.colorMuted);

    if (settings.colorPrimary) {
      const normalized = normalizeHex(settings.colorPrimary);
      const hsl = hexToHslComponents(normalized);
      const rgb = hexToRgb(normalized);

      if (hsl) {
        root.style.setProperty("--primary", hsl);
        root.style.setProperty("--primary-hsl", hsl);
        root.style.setProperty("--primary-hex", normalized);

        // Derived versions using HSL for transparency support
        root.style.setProperty("--primary-muted", `hsl(${hsl} / 0.1)`);
        root.style.setProperty("--primary-faint", `hsl(${hsl} / 0.05)`);
      }

      if (rgb) {
        root.style.setProperty("--primary-rgb", rgb);
        root.style.setProperty("--primary-rgb-20", `rgba(${rgb}, 0.2)`);
        root.style.setProperty("--primary-glow", `rgba(${rgb}, 0.3)`);
      }
    } else {
      // Fallbacks if no primary color is set
      root.style.setProperty("--primary-muted", "hsl(var(--primary) / 0.1)");
      root.style.setProperty("--primary-faint", "hsl(var(--primary) / 0.05)");
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
  const { data: settings } = useSiteSettings();
  const { reducedMotion } = useTheme();
  const transition = withReducedMotion(pageTransition, reducedMotion);
  // Feature toggles from settings
  const showBlog = settings?.featureBlog ?? true;
  const showGuestbook = settings?.featureGuestbook ?? true;

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

          {/* Feature-guarded routes */}
          {showBlog && (
            <>
              <Route path="/blog" component={BlogList} />
              <Route path="/blog/:slug" component={BlogPost} />
            </>
          )}

          {showGuestbook && (
            <Route path="/guestbook">
              {() => <Home />}
            </Route>
          )}

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

// Global loading indicator for query cache
function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const { reducedMotion } = useTheme();
  const active = isFetching > 0 || isMutating > 0;

  return (
    <AnimatePresence>
      {active && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[10000] pointer-events-none"
        >
          <div className="h-1 w-full bg-primary/20 overflow-hidden relative">
            {reducedMotion ? (
              <div className="h-full w-full bg-primary/50" />
            ) : (
              <m.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="h-full w-1/3 bg-primary shadow-[0_0_10px_var(--primary-glow)]"
              />
            )}
            <div className="absolute top-2 right-4 text-[10px] font-medium tracking-wider text-primary/70 uppercase">
              Refreshing...
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}


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

              <GlobalLoadingIndicator />

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
