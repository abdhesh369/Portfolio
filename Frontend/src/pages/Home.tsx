import { lazy, Suspense, useEffect, useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { SEO } from "@/components/SEO";
import SectionDivider from "@/components/SectionDivider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useScrollStore } from "@/hooks/use-scroll-store";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { DEFAULT_SECTION_ORDER } from "@portfolio/shared";
import React from "react";
import { usePersona } from "@/hooks/use-persona";

// Lazy-load below-the-fold sections to reduce initial bundle
const About = lazy(() => import("@/components/About"));
const Skills = lazy(() => import("@/components/Skills"));
const WhyHireMe = lazy(() => import("@/components/WhyHireMe"));
const Services = lazy(() => import("@/components/Services"));
const EngineeringMindset = lazy(() => import("@/components/EngineeringMindset"));
const Projects = lazy(() => import("@/components/Projects"));
const CodeAndPractice = lazy(() => import("@/components/CodeAndPractice"));
const Experience = lazy(() => import("@/components/Experience"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const Contact = lazy(() => import("@/components/Contact"));
const Footer = lazy(() => import("@/components/Footer"));
const BackToTop = lazy(() => import("@/components/BackToTop"));
const SectionReveal = lazy(() => import("@/components/SectionReveal"));
const Guestbook = lazy(() => import("@/components/Guestbook").then(m => ({ default: m.Guestbook })));
import { GithubHeatmap } from "@/components/GithubHeatmap";
import { ReadingList } from "@/components/ReadingList";
import { StressTest } from "@/components/StressTest";
import { LiveActivityTicker } from "@/components/LiveActivityTicker";


// Skeleton loading states that match section shapes
function SectionFallback() {
  return (
    <div className="section-container">
      <div className="space-y-6 animate-pulse">
        {/* Heading skeleton */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-32 rounded-full bg-white/5" />
          <div className="h-10 w-64 rounded-lg bg-white/5" />
          <div className="h-4 w-96 max-w-full rounded bg-white/[0.03]" />
        </div>
        {/* Content skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
              <div className="h-40 bg-white/5" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-3/4 bg-white/5 rounded" />
                <div className="h-3 w-full bg-white/[0.03] rounded" />
                <div className="h-3 w-2/3 bg-white/[0.03] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


import { SuspenseErrorBoundary } from "@/components/SuspenseErrorBoundary";

function SafeSection({ children, name }: { children: React.ReactNode, name: string }) {
  return (
    <SuspenseErrorBoundary fallback={
      <div className="section-container py-16 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-8 rounded-2xl bg-destructive/10 border border-destructive/20">
          <h3 className="text-xl font-bold text-destructive">Failed to load the {name} module</h3>
          <p className="text-sm text-foreground/60">An internal error occurred. Our team has been notified. We apologize for the inconvenience.</p>
        </div>
      </div>
    }>
      <Suspense fallback={<SectionFallback />}>
        {children}
      </Suspense>
    </SuspenseErrorBoundary>
  );
}

// Robust hash scroll handler
function useHashScroll() {
  useEffect(() => {
    const handleHashScroll = () => {
      const { hash } = window.location;
      if (hash) {
        // Delay slighty to allow lazy-loaded sections to potentially start mounting
        // and for the browser to finish rendering the initial frame
        // Refactored to 250ms per code review recommendation to minimize race conditions.
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 250);
      }
    };

    // Run once on mount
    handleHashScroll();

    // Also listen for hash changes
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);
}
const ShortcutHint = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) setIsVisible(false);
      else setIsVisible(true);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 right-8 z-40 hidden lg:flex items-center gap-3 px-4 py-2 bg-background/40 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl pointer-events-none transition-all duration-500"
        >
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Quick Actions</span>
             <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 rounded bg-foreground/10 border border-border font-mono text-xs font-bold text-foreground/80">⌘</kbd>
                <span className="text-xs font-bold text-muted-foreground">+</span>
                <kbd className="px-2 py-1 rounded bg-foreground/10 border border-border font-mono text-xs font-bold text-foreground/80">K</kbd>
             </div>
          </div>
          <div className="w-[1px] h-8 bg-border/50 mx-1" />
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">Command Palette</span>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

// section mapping to components
const SECTION_MAP: Record<string, React.ReactNode> = {
  about: <SafeSection name="About"><About /></SafeSection>,
  skills: <SafeSection name="Skills"><Skills /></SafeSection>,
  whyhireme: <SafeSection name="Why Hire Me"><WhyHireMe /></SafeSection>,
  services: <SafeSection name="Services"><Services /></SafeSection>,
  mindset: <SafeSection name="Engineering Mindset"><EngineeringMindset /></SafeSection>,
  projects: <SafeSection name="Projects"><Projects /></SafeSection>,
  practice: <SafeSection name="Code and Practice"><CodeAndPractice /></SafeSection>,
  experience: <SafeSection name="Experience"><Experience /></SafeSection>,
  testimonials: <SafeSection name="Testimonials"><Testimonials /></SafeSection>,
  guestbook: <SafeSection name="Guestbook"><Guestbook /></SafeSection>,
  contact: <SafeSection name="Contact"><Contact /></SafeSection>,
  "stress-test": <SafeSection name="Stress Test"><StressTest /></SafeSection>,
  "live-activity": <SafeSection name="Live Activity"><LiveActivityTicker /></SafeSection>,
  "reading-list": <SafeSection name="Reading List"><ReadingList /></SafeSection>,
  "github-heatmap": <SafeSection name="Github Heatmap"><GithubHeatmap /></SafeSection>,
};

export default function Home() {
  const { data: settings } = useSiteSettings();
  const { progress } = useScrollStore();
  const { persona } = usePersona();
  useHashScroll();

  // Define persona-specific order overrides
  const PERSONA_ORDERS: Record<string, string[]> = {
    recruiter: ['hero', 'live-activity', 'github-heatmap', 'experience', 'skills', 'about', 'projects', 'testimonials', 'stress-test', 'contact', 'reading-list'],
    client: ['hero', 'live-activity', 'github-heatmap', 'services', 'whyhireme', 'testimonials', 'projects', 'experience', 'stress-test', 'contact', 'reading-list'],
    developer: ['hero', 'live-activity', 'github-heatmap', 'mindset', 'practice', 'about', 'skills', 'projects', 'experience', 'stress-test', 'contact', 'reading-list'],
  };

  // Build section order: admin-saved order takes priority, fall back to defaults
  // Always ensures any new sections from DEFAULT_SECTION_ORDER are included
    const sectionOrder = useMemo(() => {
        // 1. Start with persona override if it exists, otherwise admin order, otherwise defaults
        const personaOrder = persona !== 'default' ? PERSONA_ORDERS[persona] : null;
        const adminOrder = settings?.sectionOrder as string[] | undefined;
        
        const baseOrder = personaOrder ? [...personaOrder] : (adminOrder?.length ? [...adminOrder] : [...DEFAULT_SECTION_ORDER]);

        // 2. Append any sections from defaults that aren't already in the base order
        DEFAULT_SECTION_ORDER.forEach((id: string) => {
          if (!baseOrder.includes(id)) {
            baseOrder.push(id);
          }
        });

        // 3. Always ensure new v8 features are present for the "wow" factor
        if (!baseOrder.includes('stress-test')) baseOrder.push('stress-test');
        if (!baseOrder.includes('live-activity')) {
          // Insert live-activity after hero
          const heroIndex = baseOrder.indexOf('hero');
          if (heroIndex !== -1) {
            baseOrder.splice(heroIndex + 1, 0, 'live-activity');
          } else {
            baseOrder.unshift('live-activity');
          }
        }

        // 4. Always ensure hero is first
        const withoutHero = baseOrder.filter((id: string) => id !== "hero");
        return ["hero", ...withoutHero];
    }, [settings?.sectionOrder, persona]);


  const sectionVisibility = (settings?.sectionVisibility as Record<string, boolean>) || {};

  return (
    <div className="min-h-screen selection:bg-primary/20">
      {/* Top Reading Progress Bar */}
      <div aria-hidden="true" className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 origin-left will-change-transform transition-transform duration-75 ease-out"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>

      <SEO
        slug="home"
        title={settings?.personalName ? `${settings.personalName} - Portfolio` : "Abdhesh Sah - Full-Stack Engineer Portfolio"}
        description={settings?.personalBio || "Portfolio of Abdhesh Sah, a Full Stack Developer specializing in modern web technologies."}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Person",
            name: settings?.personalName || "Abdhesh Sah",
            url: import.meta.env.VITE_SITE_URL || "https://abdheshsah.com.np",
            sameAs: [
              settings?.socialGithub,
              settings?.socialLinkedin,
              settings?.socialTwitter,
              settings?.socialInstagram,
              settings?.socialStackoverflow,
              settings?.socialDevto,
              settings?.socialMedium,
              settings?.socialYoutube,
              settings?.socialDiscord,
            ].filter(Boolean) as string[],
            jobTitle: settings?.personalTitle || "Full-Stack Engineer",
            worksFor: {
              "@type": "Organization",
              name: "Freelance",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: `${settings?.personalName || "Abdhesh Sah"} Portfolio`,
            url: import.meta.env.VITE_SITE_URL || "https://abdheshsah.com.np",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${import.meta.env.VITE_SITE_URL || "https://abdheshsah.com.np"}/blog?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          }
        ]}
      />

      <Navbar />

      <main id="main-content">
        <Hero />
        
        <ShortcutHint />

        {sectionOrder
          .filter((sectionId: string) => sectionVisibility[sectionId] ?? true)
          .map((sectionId: string, index: number) => {
          const component = SECTION_MAP[sectionId];

          if (!component) return null;

          return (
            <React.Fragment key={sectionId}>
              {index > 0 && <SectionDivider />}
              <SectionReveal>{component}</SectionReveal>
            </React.Fragment>
          );
        })}
      </main>

      <ErrorBoundary>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </ErrorBoundary>

      <Suspense fallback={null}>
        <BackToTop />
      </Suspense>
    </div >
  );
}
