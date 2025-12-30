import { motion } from "framer-motion";
import { ArrowRight, Download, Github, Linkedin, Mail } from "lucide-react";
import Typewriter from "typewriter-effect";
import profileImg from "../../Resources/images/Myphoto.jpg";
export default function Hero() {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 left-[10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="section-container relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Available for opportunities
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Hi, I'm <br />
                <span className="text-gradient">Abdhesh</span>
              </h1>

              <div className="text-xl md:text-2xl text-muted-foreground font-light h-[60px]">
                <Typewriter
                  options={{
                    strings: [
                      "Building practical software systems.",
                      "Focused on strong fundamentals.",
                      "Electronics & Communication Engineer.",
                    ],
                    autoStart: true,
                    loop: true,
                    delay: 50,
                    deleteSpeed: 30,
                  }}
                />
              </div>
            </div>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Engineering student at Tribhuvan University passionate about bridging the gap between hardware and software. I build efficient, scalable solutions with modern web technologies.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={scrollToProjects}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center gap-2 group"
              >
                View Projects
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={scrollToContact}
                className="px-8 py-4 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-muted/50 transition-all flex items-center gap-2"
              >
                Contact Me
                <Mail className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="flex gap-6 pt-8 border-t border-border/50">
              <SocialLink href="https://github.com/abdhesh369" icon={<Github className="w-5 h-5" />} label="GitHub" />
              <SocialLink href="www.linkedin.com/in/abdhesh369" icon={<Linkedin className="w-5 h-5" />} label="LinkedIn" />
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden border border-border shadow-2xl shadow-primary/10 aspect-square max-w-md mx-auto rotate-3 hover:rotate-0 transition-all duration-500 bg-card">
              {/* Your photo as background */}
              <img
                src={profileImg}
                alt="Abdhesh"
                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
              />

              {/* Overlay content */}
              <div className="absolute inset-0 bg-gradient-to-br from-card/90 via-card/80 to-muted/90 p-8 flex flex-col justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="space-y-3 font-mono text-sm opacity-60">
                  <div className="h-4 bg-foreground/10 rounded w-3/4" />
                  <div className="h-4 bg-foreground/10 rounded w-1/2" />
                  <div className="h-4 bg-foreground/10 rounded w-5/6" />
                  <div className="h-4 bg-foreground/10 rounded w-2/3" />
                </div>
                <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 backdrop-blur-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Current Stack</div>
                  <div className="flex gap-2 flex-wrap">
                    {["React", "Node.js", "TypeScript", "PostgreSQL"].map(tech => (
                      <span key={tech} className="px-2 py-1 bg-background rounded text-xs border border-border">{tech}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 p-4 bg-card rounded-2xl shadow-xl border border-border z-20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="text-sm font-bold">System Design</div>
                  <div className="text-xs text-muted-foreground">Expertise</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-5 -left-5 p-4 bg-card rounded-2xl shadow-xl border border-border z-20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <div>
                  <div className="text-sm font-bold">Electronics</div>
                  <div className="text-xs text-muted-foreground">Background</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors flex items-center gap-2 group"
      aria-label={label}
    >
      {icon}
      <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block -ml-2 group-hover:ml-0 duration-300">
        {label}
      </span>
    </a>
  );
}