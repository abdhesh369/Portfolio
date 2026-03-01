import { Switch, Route, useRoute } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, Component, type ReactNode, useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, ProtectedRoute } from "@/hooks/auth-context";

// Lazy load heavy components
const PlexusBackground = lazy(() => import("@/components/PlexusBackground").then(m => ({ default: m.PlexusBackground })));
const AnalyticsTracker = lazy(() => import("@/components/AnalyticsTracker").then(m => ({ default: m.AnalyticsTracker })));
const Chatbot = lazy(() => import("@/components/Chatbot").then(m => ({ default: m.Chatbot })));

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/Home"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const BlogList = lazy(() => import("@/pages/BlogList"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const NotFound = lazy(() => import("@/pages/not-found"));

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
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

// Defer background loading to prioritize main content
function DeferredBackground() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Use requestIdleCallback to load 3D background after browser is idle
    const schedule = typeof requestIdleCallback === "function"
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 800);
    const id = schedule(() => setShouldLoad(true));
    return () => {
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(id as number);
    };
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
    // Use requestIdleCallback to load chatbot when browser is idle
    const schedule = typeof requestIdleCallback === "function"
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 3000);
    const id = schedule(() => setShow(true));
    return () => {
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(id as number);
    };
  }, [isAdmin, isAdminLogin]);

  if (isAdmin || isAdminLogin || !show) return null;

  return (
    <Suspense fallback={null}>
      <Chatbot />
    </Suspense>
  );
}

import { LazyMotion, domAnimation } from "framer-motion";

// Main App component
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="portfolio-theme">
          <AuthProvider>
            <LazyMotion features={domAnimation}>
              <DeferredAnalytics />
              <Router />
              <DeferredBackground />
              <DeferredChatbot />
              <Toaster />
            </LazyMotion>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
