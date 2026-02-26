import { m, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { User, GraduationCap, MapPin, Mail, Code, Calendar, Zap, Heart, Target, BookOpen, Layers, Monitor, Terminal, Cpu, Sparkles } from "lucide-react";
// ...existing code... (profile image moved to public/images/hero.svg)

// Glitch Text Component
const GlitchText = ({ text }: { text: string }) => {
  return (
    <div className="relative inline-block group">
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-cyan-400 opacity-0 group-hover:opacity-70 group-hover:translate-x-[2px] transition-all duration-100">
        {text}
      </span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-red-400 opacity-0 group-hover:opacity-70 group-hover:-translate-x-[2px] transition-all duration-100 delay-75">
        {text}
      </span>
    </div>
  );
};

// 3D Tilt Card Component
const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative w-full h-full perspective-1000"
    >
      {children}
    </m.div>
  );
};

// Animated Counter
const AnimatedCounter = ({ value, suffix = "", label, icon: Icon }: { value: number; suffix?: string; label: string; icon: React.ElementType }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className="relative group p-[1px] rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative p-6 h-full bg-[#0a0520]/80 backdrop-blur-sm rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 group-hover:border-cyan-500/30 transition-all">
        <div className="p-3 rounded-full bg-white/5 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors shadow-lg group-hover:shadow-cyan-500/20">
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-3xl font-bold text-white font-display text-shadow-glow flex items-baseline gap-1">
          {count}<span className="text-cyan-400 text-lg">{suffix}</span>
        </div>
        <span className="text-xs text-gray-400 font-mono tracking-wider uppercase">{label}</span>
      </div>
    </m.div>
  );
};

// Holographic Info Card
const InfoCard = ({ icon: Icon, label, value, delay, color = "cyan" }: { icon: React.ElementType; label: string; value: string; delay: number, color?: "cyan" | "purple" }) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="relative group h-full"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color === "cyan" ? "from-cyan-500/20" : "from-purple-500/20"} to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl blur-lg`} />

      <div className="h-full bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-white/20 transition-all relative overflow-hidden group-hover:translate-x-1">

        {/* Scanline */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

        <div className={`p-3 rounded-lg ${color === "cyan" ? "bg-cyan-500/10 text-cyan-400" : "bg-purple-500/10 text-purple-400"}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-mono tracking-wide mb-0.5">{label}</p>
          <p className="font-semibold text-gray-200 group-hover:text-white transition-colors">{value}</p>
        </div>
      </div>
    </m.div>
  );
};

// Timeline Node
const TimelineItem = ({ year, title, description, delay }: { year: string; title: string; description: string; delay: number }) => (
  <m.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="relative pl-8 pb-12 last:pb-0 group"
  >
    {/* Animated Beam */}
    <div className="absolute left-[3px] top-0 h-full w-[2px] bg-white/5 overflow-hidden group-last:hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500 via-purple-500 to-transparent -translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
    </div>

    <div className="absolute left-[-4px] top-0 w-4 h-4 rounded-full border-2 border-cyan-500/50 bg-[#050510] group-hover:scale-125 group-hover:border-cyan-400 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] z-10" />

    <div className="px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 inline-block font-mono mb-2 group-hover:bg-cyan-500/20 transition-colors">
      {year}
    </div>

    <div className="font-bold text-white text-lg mb-2 group-hover:text-cyan-300 transition-colors flex items-center gap-2">
      {title}
    </div>
    <div className="text-sm text-gray-400 leading-relaxed font-light group-hover:text-gray-300 transition-colors">{description}</div>
  </m.div>
);

const Highlight = ({ children, color = "cyan" }: { children: React.ReactNode, color?: "cyan" | "purple" }) => (
  <span className={`relative inline-block px-1 rounded transition-colors duration-300 group hover:text-white cursor-default`}>
    <span className={`absolute inset-0 ${color === "cyan" ? "bg-cyan-500/20" : "bg-purple-500/20"} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded origin-left -z-10`} />
    <span className={color === "cyan" ? "text-cyan-300" : "text-purple-300"}>{children}</span>
  </span>
);

export default function About() {
  return (
    <section id="about" className="section-container scroll-mt-20 overflow-hidden py-24 relative">
      <div className="text-center mb-20 relative z-10">
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-mono mb-4 backdrop-blur-md"
        >
           // SYSTEM_PROFILE_LOADED
        </m.div>

        <m.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold font-display"
        >
          <span className="text-white">About</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"><GlitchText text="Me" /></span>
        </m.h2>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* Left Column - Holographic Card (5 cols) */}
          <div className="lg:col-span-5 space-y-8 sticky top-24">
            <TiltCard>
              <div
                className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0a0520]/80 backdrop-blur-xl group h-full shadow-2xl"
              >
                {/* Profile Image Area */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0520] via-transparent to-transparent z-10" />

                  {/* Hologram Overlay */}
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 z-10 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 z-10 mix-blend-color-dodge opacity-50" />

                  <img
                    src="/images/Myphoto.webp"
                    srcSet="/images/Myphoto-500.webp 500w, /images/Myphoto-800.webp 800w, /images/Myphoto.webp 1080w"
                    sizes="(max-width: 1024px) 80vw, 450px"
                    alt="Abdhesh Sah - Full-Stack Engineer"
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={500}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  />

                  {/* Floating Stats */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20 space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded uppercase border border-green-500/30 backdrop-blur-md">
                        Online
                      </span>
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded uppercase border border-cyan-500/30 backdrop-blur-md animate-pulse">
                        Coding
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white font-display">Abdhesh Sah</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      Kathmandu, Nepal
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 border-t border-white/10 bg-white/5 space-y-4 relative z-30">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Position</span>
                    <span className="text-white font-medium">Student Engineer</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Availability</span>
                    <span className="text-green-400 font-medium">Open to Work</span>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <a href="https://github.com/abdhesh369" target="_blank" rel="noreferrer" className="flex-1 py-2 rounded bg-white/5 hover:bg-cyan-500/20 text-white hover:text-cyan-400 transition-all border border-transparent hover:border-cyan-500/30 flex items-center justify-center gap-2">
                      <Code className="w-4 h-4" /> <span className="text-xs">GitHub</span>
                    </a>
                    <a href="mailto:abdheshshah111@gmail.com?subject=Project%20Inquiry%20from%20Portfolio&body=Hi%20Abdhesh," className="flex-1 py-2 rounded bg-white/5 hover:bg-purple-500/20 text-white hover:text-purple-400 transition-all border border-transparent hover:border-purple-500/30 flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" /> <span className="text-xs">Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Right Column - Content & Timeline (7 cols) */}
          <div className="lg:col-span-7 space-y-12">

            {/* Bio Section */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 relative"
            >
              {/* Decorative Corner */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-lg" />

              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Terminal className="w-6 h-6 text-cyan-400" />
                <span className="font-mono text-lg text-cyan-500">./bio_init</span>
              </h3>

              <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed font-light">
                <p>
                  I'm currently pursuing my <Highlight>Bachelor's in Electronics & Communication Engineering</Highlight> at Tribhuvan University. My journey began with a fascination for how hardware meets software, which inevitably led me down the rabbit hole of Full-Stack Development.
                </p>
                <p>
                  Today, I focus on building <Highlight color="purple">scalable web systems</Highlight> and analyzing complex algorithms. I don't just write code; I design systems that resolve real-world inefficiencies. My approach is rooted in engineering fundamentals—understanding <Highlight>memory, complexity, and architecture</Highlight> before typing a single line of syntax.
                </p>
              </div>
            </m.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <AnimatedCounter value={10} suffix="+" label="Skills" icon={Zap} />
              <AnimatedCounter value={5} suffix="+" label="Projects" icon={Layers} />
              <AnimatedCounter value={100} suffix="%" label="Uptime" icon={Monitor} />
            </div>

            {/* Info Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoCard icon={GraduationCap} label="Status" value="B.E. Student" delay={0.1} />
              <InfoCard icon={Code} label="Focus Area" value="Full Stack System Design" delay={0.2} color="purple" />
              <InfoCard icon={Cpu} label="Hardware" value="Electronics & Comms" delay={0.3} color="purple" />
              <InfoCard icon={Target} label="Goal" value="Software Engineer" delay={0.4} />
            </div>

            {/* Timeline */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#0a0520]/50 p-8 rounded-3xl border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Calendar className="w-32 h-32 text-white" />
              </div>

              <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                <Calendar className="w-5 h-5 text-purple-400" />
                Development Log
              </h3>

              <div className="relative z-10">
                <TimelineItem
                  year="2024 - Present"
                  title="Advanced System Design"
                  description="Deep diving into distributed systems, Docker, and Microservices architecture while building complex full-stack applications."
                  delay={0}
                />
                <TimelineItem
                  year="2023"
                  title="Engineering Core"
                  description="Mastering Data Structures, Algorithms, and Object-Oriented Programming (C++, Java) at Tribhuvan University."
                  delay={0.1}
                />
                <TimelineItem
                  year="2022"
                  title="Hello World"
                  description="Started the journey with Python scripting and basic web development. Built my first static websites."
                  delay={0.2}
                />
              </div>
            </m.div>

          </div>
        </div>
      </div>
    </section>
  );
}
