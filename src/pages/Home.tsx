import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import WhyHireMe from "@/components/WhyHireMe";
import EngineeringMindset from "@/components/EngineeringMindset";
import Projects from "@/components/Projects";
import CodeAndPractice from "@/components/CodeAndPractice";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { motion, useScroll, useSpring } from "framer-motion";

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

      <Navbar />

      <main>
        <Hero />
        <About />
        <Skills />
        <WhyHireMe />
        <EngineeringMindset />
        <Projects />
        <CodeAndPractice />
        <Experience />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
