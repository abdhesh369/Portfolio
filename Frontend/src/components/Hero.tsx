import { m, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { fadeUp, scaleIn, scaleInSubtle, fadeIn, floatTransition, SPRING, DURATION, EASE } from "@/lib/animation";
import { ArrowRight, Github, Linkedin, Mail, ChevronDown, Sparkles, Terminal, Cpu, Globe, Twitter, Instagram, Youtube, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects, useSkills, useExperiences } from "@/hooks/use-portfolio";
import { useServerStatus } from "@/hooks/use-server-status";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useTheme } from "./theme-provider";
import { OptimizedImage } from "@/components/OptimizedImage";
import type { SiteSettings } from "@portfolio/shared";

// Mouse Follower Gradient
const MouseGradient = () => {
  const prefersReducedMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <m.div
      className="fixed inset-0 pointer-events-none z-0"
      style={{ x, y }}
    >
      <div
        className="absolute w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_var(--primary-rgb-20)_0%,_transparent_60%)]"
      />
    </m.div>
  );
};

// Lightweight rotating text — replaces heavy typewriter-effect library
const RotatingText = ({ strings }: { strings: string[] }) => {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const stringsJson = JSON.stringify(strings);

  // Reset state when strings prop changes
  useEffect(() => {
    setDisplayed("");
    setIsDeleting(false);
    setIndex(0);
  }, [stringsJson]);

  useEffect(() => {
    const current = strings[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed === current) {
      // pause at full text
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayed === "") {
      // move to next string
      setIsDeleting(false);
      setIndex((i) => (i + 1) % strings.length);
    } else {
      const speed = isDeleting ? 20 : 40;
      timeout = setTimeout(() => {
        setDisplayed(
          isDeleting
            ? current.slice(0, displayed.length - 1)
            : current.slice(0, displayed.length + 1)
        );
      }, speed);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, index, stringsJson, strings.length]);

  return (
    <span className="inline-flex items-center">
      {displayed}
      <span className="ml-0.5 w-[0.6em] h-[1.1em] bg-gray-400 inline-block animate-blink" />
    </span>
  );
};

// Profile Image with Sci-Fi Hologram Effect
const ProfileCard = ({ settings }: { settings: SiteSettings | undefined | null }) => {
  const { reducedMotion } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current) return; // throttle to animation frame
    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) { rafRef.current = 0; return; }
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setRotateX((e.clientY - centerY) / 20);
      setRotateY((centerX - e.clientX) / 20);
      rafRef.current = 0;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <m.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={scaleInSubtle.initial}
      animate={scaleInSubtle.animate}
      transition={scaleInSubtle.transition}
      className="relative hidden lg:block perspective-1000"
      style={{
        transform: reducedMotion
          ? "none"
          : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: "preserve-3d",
        transition: reducedMotion ? "none" : "transform 0.1s ease-out",
      }}
    >
      {/* Glow Ring */}
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-primary via-secondary to-accent opacity-20 blur-2xl animate-pulse" />

      {/* Main Card Container */}
      <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10 aspect-square max-w-md mx-auto bg-card/80 backdrop-blur-sm">
        {/* Profile Image */}
        <OptimizedImage
          src={settings?.personalAvatar || "/images/Myphoto.webp"}
          alt={`Portrait of ${settings?.personalName || "Abdhesh Sah"} - ${settings?.personalTitle || "Senior Full Stack Engineer & System Designer"}`}
          width={800}
          height={800}
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover opacity-85 mix-blend-luminosity grayscale-[30%] hover:grayscale-0 transition-all duration-700"
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
            <div className="px-2 py-1 rounded bg-primary/20 border border-primary/30 text-[10px] text-primary font-mono">
              SYS.ONLINE
            </div>
          </div>

          {/* Holographic Code Stream */}
          <div className="space-y-2 font-mono text-[10px] text-primary/50 overflow-hidden h-32 opacity-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <m.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                {`> initializing module_0${i + 1} ...OK`}
              </m.div>
            ))}
          </div>

          {/* Bottom Details */}
          <div className="bg-background/80 p-6 rounded-xl border border-white/10 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none animate-scan bg-[length:100%_3px]" />
      </div>

      {/* Floating Orbital Elements */}
      {!reducedMotion && (
        <>
          <OrbitItem icon={Cpu} label="System Arch" color="primary" delay={0} x={-20} y={-20} />
          <OrbitItem icon={Globe} label="Full Stack" color="secondary" delay={1} x={20} y={20} />
          <OrbitItem icon={Terminal} label="DevOps" color="accent" delay={2} x={-20} y={20} />
        </>
      )}

    </m.div>
  );
};

interface OrbitItemProps {
  icon: React.ElementType;
  label: string;
  color: "primary" | "secondary" | "accent";
  delay: number;
  x: number;
  y: number;
}

const OrbitItem = ({ icon: Icon, label, color, delay, x, y }: OrbitItemProps) => {
  const colors = {
    primary: "text-primary bg-primary/10 border-primary/30",
    secondary: "text-secondary bg-secondary/10 border-secondary/30",
    accent: "text-accent bg-accent/10 border-accent/30"
  };

  return (
    <m.div
      animate={{
        y: [0, y, 0],
        x: [0, x, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ ...floatTransition, delay }}
      className={`absolute ${y < 0 ? '-top-4' : '-bottom-4'} ${x < 0 ? '-left-4' : '-right-4'} p-3 rounded-xl border backdrop-blur-md shadow-lg z-20 flex items-center gap-3 ${colors[color]}`}
    >
      <Icon className="w-5 h-5 pointer-events-none" />
      <span className="text-xs font-bold pointer-events-none">{label}</span>
    </m.div>
  );
};

const OpenToWorkBanner = () => {
  return (
    <m.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="relative group mb-8 inline-block"
    >
      {/* Dynamic Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />

      {/* Banner Body */}
      <div className="relative flex items-center gap-3 px-6 py-2 bg-black/60 backdrop-blur-xl border border-white/20 rounded-full leading-none transition duration-200 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] group-hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.3)]">
        <span className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-[0_0_8px_var(--primary)]"></span>
          </span>
          <span className="text-primary/90 font-mono text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase whitespace-nowrap">
            Status: Open for opportunities
          </span>
        </span>

        <div className="h-4 w-[1px] bg-white/20 mx-1" />

        <span className="flex items-center gap-1.5 text-secondary font-display text-xs font-semibold group-hover:text-secondary/80 transition-colors">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Hiring? Let's Talk</span>
          <span className="sm:hidden text-[10px]">Hiring?</span>
        </span>

        {/* Diagonal Scanline Overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-full">
          <div className="absolute inset-x-0 h-full w-[200%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-30deg] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        </div>
      </div>
    </m.div>
  );
};

import { LiveVisitorCount } from "./LiveVisitorCount";

export default function Hero() {
  const status = useServerStatus();
  const { data: projects } = useProjects();
  const { data: skills } = useSkills();
  const { data: experiences } = useExperiences();
  const { data: settings } = useSiteSettings();

  const showBanner = settings?.isOpenToWork ?? true; // Default to true if loading or error

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <MouseGradient />

      <div className="section-container relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          <m.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: DURATION.slow, ease: EASE.easeOut }}
            className="space-y-8 text-center lg:text-left"
          >
            {/* Mobile Profile Avatar — visible on small screens only */}
            <m.div
              initial={scaleIn.initial}
              animate={scaleIn.animate}
              transition={{ delay: 0.1, ...SPRING.gentle }}
              className="flex justify-center lg:hidden"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-60 blur-md animate-pulse" />
                <OptimizedImage
                  src={settings?.personalAvatar || "/images/Myphoto-500.webp"}
                  alt={`${settings?.personalName || "Abdhesh Sah"} Avatar`}
                  width={120}
                  height={120}
                  loading="eager"
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-white/20 shadow-xl"
                />
              </div>
            </m.div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              {showBanner && <OpenToWorkBanner />}
              <LiveVisitorCount />
            </div>

            {/* Status Pill */}
            <m.div
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono backdrop-blur-sm mx-auto lg:mx-0 transition-colors duration-500 ${status === "online"
                ? "bg-primary/10 border-primary/20 text-primary"
                : status === "waking"
                  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                  : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}
            >
              <div className={`w-2 h-2 rounded-full animate-pulse shadow-glow ${status === "online" ? "bg-primary" : status === "waking" ? "bg-yellow-500" : "bg-red-500"
                }`} />
              {status === "online" ? "SYSTEM_ACTIVE" : status === "checking" ? "SEARCHING_FOR_UPLINK" : status === "waking" ? "WAKING_UP" : "SYSTEM_DEGRADED"}
            </m.div>

            <div className="space-y-4">
              <m.h1
                initial={fadeUp.initial}
                animate={fadeUp.animate}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight font-display tracking-tight"
              >
                <span className="sr-only">{settings?.personalName || "Portfolio"} - </span>
                {settings?.heroGreeting || "Start building"} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x relative inline-block pb-2">
                  {settings?.personalName || "The Future"}
                  <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-4 -right-8 animate-pulse" />
                </span>
              </m.h1>

              <m.div
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl text-gray-400 font-light h-[60px] flex items-center justify-center lg:justify-start"
              >
                <span className="text-primary mr-2">{">"}</span>
                <RotatingText
                  strings={settings?.heroTaglines?.length ? settings.heroTaglines : [
                    "Engineering scalable systems.",
                    "Crafting intuitive interfaces.",
                    "Bridging hardware & software.",
                    "Solving complex problems."
                  ]}
                />
              </m.div>
            </div>

            {/* LCP element — no animation delay so it paints immediately */}
            <p className="text-lg text-gray-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              I'm <strong className="text-white">{settings?.personalName || "Abdhesh Sah"}</strong>, {settings?.personalBio || "a Full-Stack Engineer passionate about performance, precision, and building digital experiences that feel alive."}
            </p>

            <m.div
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                onClick={() => {
                  const url = settings?.heroCtaPrimaryUrl || "#projects";
                  if (url.startsWith("#")) {
                    const target = document.getElementById(url.slice(1));
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }
                }}
                size="lg"
                className="w-full sm:w-auto bg-primary text-black hover:bg-primary/90 font-bold rounded-full px-8 shadow-[0_0_20px_var(--primary-glow)] hover:shadow-[0_0_30px_var(--primary-glow)] transition-all"
              >
                {settings?.heroCtaPrimary || "View My Work"} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              <Button
                onClick={() => {
                  const contactEl = document.getElementById("contact");
                  if (contactEl) {
                    contactEl.scrollIntoView({ behavior: 'smooth' });
                    // Trigger a custom event to switch form mode if needed
                    window.dispatchEvent(new CustomEvent("set-contact-mode", { detail: "wizard" }));
                  }
                }}
                size="lg"
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full px-8 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all border border-purple-400/30 group"
              >
                <Sparkles className="mr-2 w-4 h-4 animate-pulse group-hover:scale-125 transition-transform" />
                AI Project Scope
              </Button>

              <Button
                onClick={() => {
                  const url = settings?.heroCtaSecondaryUrl || "#contact";
                  if (url.startsWith("#")) {
                    const target = document.getElementById(url.slice(1));
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }
                }}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 rounded-full px-8 backdrop-blur-sm"
              >
                {settings?.heroCtaSecondary || "Contact Me"} <Mail className="ml-2 w-4 h-4" />
              </Button>
            </m.div>

            {/* Social Proof */}
            <m.div
              initial={fadeIn.initial}
              animate={fadeIn.animate}
              transition={{ delay: 1 }}
              className="flex items-center gap-5 justify-center lg:justify-start pt-4 flex-wrap"
            >
              <div className="flex items-center gap-4">
                {settings?.socialGithub && <SocialLink href={settings.socialGithub} icon={Github} label="GitHub" />}
                {settings?.socialLinkedin && <SocialLink href={settings.socialLinkedin} icon={Linkedin} label="LinkedIn" />}
                {settings?.socialTwitter && <SocialLink href={settings.socialTwitter} icon={Twitter} label="Twitter" />}
                {settings?.socialInstagram && <SocialLink href={settings.socialInstagram} icon={Instagram} label="Instagram" />}
                {settings?.socialYoutube && <SocialLink href={settings.socialYoutube} icon={Youtube} label="YouTube" />}
                {settings?.socialDevto && <SocialLink href={settings.socialDevto} icon={Code2} label="Dev.to" />}
                {settings?.socialMedium && <SocialLink href={settings.socialMedium} icon={Globe} label="Medium" />}
              </div>
              <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-4 py-2">
                <div className="text-center">
                  <span className="text-sm font-bold text-white">{(projects?.length ?? 0)}+</span>
                  <p className="text-[10px] text-gray-500">Projects</p>
                </div>
                <div className="h-4 w-[1px] bg-white/10" />
                <div className="text-center">
                  <span className="text-sm font-bold text-white">{(skills?.length ?? 0)}+</span>
                  <p className="text-[10px] text-gray-500">Technologies</p>
                </div>
                <div className="h-4 w-[1px] bg-white/10" />
                <div className="text-center">
                  <span className="text-sm font-bold text-white">{(experiences?.length ?? 0)}+</span>
                  <p className="text-[10px] text-gray-500">Experiences</p>
                </div>
              </div>
            </m.div>

          </m.div>

          {/* Hero Visual */}
          <ProfileCard settings={settings} />
        </div>

        {/* Scroll Indicator */}
        <m.div
          animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer hidden md:block group"
          onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown className="w-8 h-8 text-primary/50 group-hover:text-primary transition-colors" />
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
