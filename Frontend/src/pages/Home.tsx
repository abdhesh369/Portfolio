import { lazy, Suspense, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { SEO } from "@/components/SEO";

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

// Minimal placeholder while sections load
function SectionFallback() {
  return <div className="min-h-[200px]" />;
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
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
      style={{ transform: "scaleX(0)", willChange: "transform" }}
    />
  );
}

export default function Home() {
  return (
    <div className="min-h-screen selection:bg-primary/20">
      {/* Scroll Progress Bar — pure JS, no framer-motion */}
      <ScrollProgressBar />


      <SEO
        slug="home"
        title="Abdhesh Sah - Full-Stack Engineer Portfolio"
        description="Portfolio of Abdhesh Sah, a Full Stack Developer specializing in modern web technologies."
        structuredData={{
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
        }}
      />

      <Navbar />

      <main>
        <Hero />
        <Suspense fallback={<SectionFallback />}>
          <About />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Skills />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <WhyHireMe />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Services />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <EngineeringMindset />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Projects />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <CodeAndPractice />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Experience />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Contact />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
