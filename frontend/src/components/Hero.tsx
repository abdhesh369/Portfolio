import { m, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { ArrowRight, Github, Linkedin, Mail, ChevronDown, Sparkles, Terminal, Cpu, Globe } from "lucide-react";
import Typewriter from "typewriter-effect";
// ...existing code... (profile image moved to public/images/hero.svg)
import { Button } from "@/components/ui/button";

// Mouse Follower Gradient
const MouseGradient = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <m.div
      className="fixed inset-0 pointer-events-none z-0"
      style={{ x, y }}
    >
      <div
        className="absolute w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 60%)",
        }}
      />
    </m.div>
  );
};

// Profile Image with Sci-Fi Hologram Effect
const ProfileCard = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateXValue = (e.clientY - centerY) / 20;
    const rotateYValue = (centerX - e.clientX) / 20;
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <m.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative hidden lg:block perspective-1000"
      style={{
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.1s ease-out",
      }}
    >
      {/* Glow Ring */}
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 opacity-20 blur-2xl animate-pulse" />

      {/* Main Card Container */}
      <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/10 aspect-square max-w-md mx-auto bg-[#0a0520]/80 backdrop-blur-sm">
        {/* Profile Image */}
        <img
          src="/images/Myphoto.webp"
          srcSet="/images/Myphoto-500.webp 500w, /images/Myphoto-800.webp 800w, /images/Myphoto.webp 1080w"
          sizes="(max-width: 1024px) 80vw, 450px"
          alt="Abdhesh Sah - Full Stack Engineer & System Designer"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width={800}
          height={800}
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay grayscale hover:grayscale-0 transition-all duration-700"
        />

        {/* HUD Overlay */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
          {/* Top HUD */}
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse delay-75" />
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150" />
            </div>
            <div className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/30 text-[10px] text-cyan-400 font-mono">
              SYS.ONLINE
            </div>
          </div>

          {/* Holographic Code Stream */}
          <div className="space-y-2 font-mono text-[10px] text-cyan-500/50 overflow-hidden h-32 opacity-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <m.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                {`> initializing module_0${i + 1} ... OK`}
              </m.div>
            ))}
          </div>

          {/* Bottom Details */}
          <div className="bg-[#050510]/80 p-6 rounded-xl border border-white/10 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Active Protocols
            </div>
            <div className="flex gap-2 flex-wrap">
              {["React", "Node.js", "TypeScript", "System Design"].map((tech, i) => (
                <m.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="px-2 py-1 bg-cyan-500/10 rounded text-[10px] border border-cyan-500/20 font-mono text-cyan-300"
                >
                  {tech}
                </m.span>
              ))}
            </div>
          </div>
        </div>

        {/* Scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none animate-scan" style={{ backgroundSize: '100% 3px' }} />
      </div>

      {/* Floating Orbital Elements */}
      <OrbitItem icon={Cpu} label="System Arch" color="cyan" delay={0} x={-20} y={-20} />
      <OrbitItem icon={Globe} label="Full Stack" color="purple" delay={1} x={20} y={20} />
      <OrbitItem icon={Terminal} label="DevOps" color="pink" delay={2} x={-20} y={20} />

    </m.div>
  );
};

interface OrbitItemProps {
  icon: React.ElementType;
  label: string;
  color: "cyan" | "purple" | "pink";
  delay: number;
  x: number;
  y: number;
}

const OrbitItem = ({ icon: Icon, label, color, delay, x, y }: OrbitItemProps) => {
  const colors = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    pink: "text-pink-400 bg-pink-500/10 border-pink-500/30"
  };

  return (
    <m.div
      animate={{
        y: [0, y, 0],
        x: [0, x, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute ${y < 0 ? '-top-4' : '-bottom-4'} ${x < 0 ? '-left-4' : '-right-4'} p-3 rounded-xl border backdrop-blur-md shadow-lg z-20 flex items-center gap-3 ${colors[color]}`}
    >
      <Icon className="w-5 h-5 pointer-events-none" />
      <span className="text-xs font-bold pointer-events-none">{label}</span>
    </m.div>
  )
}

export default function Hero() {
  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <MouseGradient />
      <MouseGradient />

      <div className="section-container relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          <m.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 text-center lg:text-left"
          >
            {/* Status Pill */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs backdrop-blur-sm mx-auto lg:mx-0"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
              SYSTEM_READY_FOR_WORK
            </m.div>

            <div className="space-y-4">
              <m.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight font-display tracking-tight"
              >
                <span className="sr-only">Abdhesh Sah - </span>
                Start building <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x relative inline-block pb-2">
                  The Future
                  <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-4 -right-8 animate-pulse" />
                </span>
              </m.h1>

              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl text-gray-400 font-light h-[60px] flex items-center justify-center lg:justify-start"
              >
                <span className="text-cyan-400 mr-2">{">"}</span>
                <Typewriter
                  options={{
                    strings: [
                      "Engineering scalable systems.",
                      "Crafting intuitive interfaces.",
                      "Bridging hardware & software.",
                      "Solving complex problems."
                    ],
                    autoStart: true,
                    loop: true,
                    delay: 40,
                    deleteSpeed: 20,
                    cursor: "█"
                  }}
                />
              </m.div>
            </div>

            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-gray-400 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              I'm <strong className="text-white">Abdhesh Sah</strong>, a Full-Stack Engineer passionate about performance, precision, and building digital experiences that feel alive.
            </m.p>

            {/* CTA Buttons */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                onClick={scrollToProjects}
                size="lg"
                className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold rounded-full px-8 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
              >
                View My Work <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              <Button
                onClick={scrollToContact}
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 backdrop-blur-sm"
              >
                Contact Me <Mail className="ml-2 w-4 h-4" />
              </Button>
            </m.div>

            {/* Social Proof */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-6 justify-center lg:justify-start pt-4"
            >
              <SocialLink href="https://github.com/abdhesh369" icon={Github} label="GitHub" />
              <SocialLink href="https://www.linkedin.com/in/abdhesh369" icon={Linkedin} label="LinkedIn" />
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050510] bg-gray-700 flex items-center justify-center text-[10px] text-white">
                    Dev
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium">Trusted by peers</span>
            </m.div>

          </m.div>

          {/* Hero Visual */}
          <ProfileCard />
        </div>

        {/* Scroll Indicator */}
        <m.div
          animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer hidden md:block"
          onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown className="w-8 h-8 text-cyan-500/50" />
        </m.div>
      </div>
    </section>
  );
}

function SocialLink({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-white transition-colors"
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}
