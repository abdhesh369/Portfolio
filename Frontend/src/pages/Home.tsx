import { lazy, Suspense, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { SEO } from "@/components/SEO";
import SectionDivider from "@/components/SectionDivider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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

// Lightweight scroll progress bar — no framer-motion needed
function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${progress})`;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 h-1 z-[100] origin-left"
      style={{
        transform: "scaleX(0)",
        willChange: "transform",
        background: "linear-gradient(90deg, #06b6d4, #3b82f6, #a855f7)",
      }}
    />
  );
}

function SafeSection({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<SectionFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Robust hash scroll handler
function useHashScroll() {
  useEffect(() => {
    const handleHashScroll = () => {
      const { hash } = window.location;
      if (hash) {
        // Delay slightly to allow lazy-loaded sections to potentially start mounting
        // and for the browser to finish rendering the initial frame
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    };

    // Run once on mount
    handleHashScroll();

    // Also listen for hash changes
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);
}

export default function Home() {
  useHashScroll();
  return (
    <div className="min-h-screen selection:bg-primary/20">
      {/* Scroll Progress Bar — pure JS, no framer-motion */}
      <ScrollProgressBar />

      <SEO
        slug="home"
        title="Abdhesh Sah - Full-Stack Engineer Portfolio"
        description="Portfolio of Abdhesh Sah, a Full Stack Developer specializing in modern web technologies."
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Abdhesh Sah",
            url: "https://abdheshsah.com.np",
            sameAs: [
              "https://github.com/abdhesh369",
              "https://www.linkedin.com/in/abdhesh369",
              "https://x.com/abdhesh369",
            ],
            jobTitle: "Full-Stack Engineer",
            worksFor: {
              "@type": "Organization",
              name: "Freelance",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Abdhesh Sah Portfolio",
            url: "https://abdheshsah.com.np",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://abdheshsah.com.np/blog?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          }
        ]}
      />

      <Navbar />

      <main id="main-content">
        <Hero />
        <SectionDivider />
        <SafeSection><About /></SafeSection>
        <SectionDivider />
        <SafeSection><Skills /></SafeSection>
        <SectionDivider />
        <SafeSection><WhyHireMe /></SafeSection>
        <SectionDivider />
        <SafeSection><Services /></SafeSection>
        <SectionDivider />
        <SafeSection><EngineeringMindset /></SafeSection>
        <SectionDivider />
        <SafeSection><Projects /></SafeSection>
        <SectionDivider />
        <SafeSection><CodeAndPractice /></SafeSection>
        <SectionDivider />
        <SafeSection><Experience /></SafeSection>
        <SectionDivider />
        <SafeSection><Testimonials /></SafeSection>
        <SectionDivider />
        <SafeSection><Contact /></SafeSection>
      </main>

      <ErrorBoundary>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </ErrorBoundary>

      <Suspense fallback={null}>
        <BackToTop />
      </Suspense>
    </div>
  );
}
