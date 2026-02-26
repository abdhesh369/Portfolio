import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { motion, useScroll, useSpring } from "framer-motion";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { SEO } from "@/components/SEO";

// Lazy-load below-the-fold sections to reduce initial bundle
const About = lazy(() => import("@/components/About"));
const Skills = lazy(() => import("@/components/Skills"));
const WhyHireMe = lazy(() => import("@/components/WhyHireMe"));
const EngineeringMindset = lazy(() => import("@/components/EngineeringMindset"));
const Projects = lazy(() => import("@/components/Projects"));
const CodeAndPractice = lazy(() => import("@/components/CodeAndPractice"));
const Experience = lazy(() => import("@/components/Experience"));
const Contact = lazy(() => import("@/components/Contact"));
const Footer = lazy(() => import("@/components/Footer"));

// Minimal placeholder while sections load
function SectionFallback() {
  return <div className="min-h-[200px]" />;
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen selection:bg-primary/20">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
        style={{ scaleX }}
      />


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
            "https://github.com/abdheshnayak",
            "https://linkedin.com/in/abdhesh-sah-06900a266",
            "https://twitter.com/SahAbdhesh",
          ],
          jobTitle: "Full Stack Developer",
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
          <Contact />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
