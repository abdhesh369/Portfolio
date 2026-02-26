import { Github, Linkedin, Twitter, Facebook, Instagram, ArrowUp, Mail, Code2, Cpu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

const footerNavItems = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Experience", href: "#experience" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "#contact" },
];

const socialLinks = [
  { href: "https://github.com/abdhesh369", icon: Github, label: "Github", color: "#6e5494" },
  { href: "https://www.linkedin.com/in/abdhesh369", icon: Linkedin, label: "LinkedIn", color: "#0077b5" },
  { href: "https://x.com/abdhesh369", icon: Twitter, label: "Twitter", color: "#1da1f2" },
  { href: "https://www.instagram.com/abdhesh.369", icon: Instagram, label: "Instagram", color: "#e1306c" },
  { href: "https://www.facebook.com/abdhesh.369", icon: Facebook, label: "Facebook", color: "#1877f2" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [location, setLocation] = useLocation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      if (location !== "/") {
        setLocation("/");
        setTimeout(() => {
          document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setLocation(href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative mt-20 pt-20 pb-10 overflow-hidden">
      {/* Sci-fi Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-[#0a0520] to-[#050510]" />

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to top, black 40%, transparent 100%)'
          }}
        />

        {/* Glowing Top Border */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent box-shadow-glow" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2"
            >
              <div className="relative w-10 h-10 flex items-center justify-center bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                <Code2 className="w-6 h-6 text-cyan-400" />
                <div className="absolute -inset-1 bg-cyan-500/20 blur-lg rounded-full opacity-50" />
              </div>
              <h3 className="text-2xl font-bold font-display tracking-tight text-white">
                Abdhesh<span className="text-cyan-400">.</span>Dev
              </h3>
            </motion.div>

            <p className="text-base text-gray-400 leading-relaxed max-w-sm">
              Crafting robust digital systems with a focus on performance, scalability, and intuitive user experiences.
            </p>

            <div className="flex flex-wrap gap-3">
              <Badge icon={Cpu} text="System Design" color="cyan" />
              <Badge icon={Globe} text="Web Dev" color="purple" />
              <Badge icon={Code2} text="Algorithms" color="pink" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-3">
              {footerNavItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 group-hover:scale-150 transition-transform" />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Column */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Connect</h4>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social) => (
                <FooterLink
                  key={social.label}
                  {...social}
                />
              ))}
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm mt-6">
              <div className="flex items-center gap-3 text-gray-300 mb-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium">Get in touch</span>
              </div>
              <a
                href="mailto:abdheshshah111@gmail.com?subject=Contact%20from%20Portfolio"
                className="text-lg font-bold text-white hover:text-cyan-400 transition-colors"
              >
                abdheshshah111@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            <p>© 2025–{currentYear} Abdhesh Sah. All rights reserved.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="p-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] group"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}

function Badge({ icon: Icon, text, color }: { icon: React.ElementType, text: string, color: 'cyan' | 'purple' | 'pink' }) {
  const colors = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colors[color]}`}>
      <Icon className="w-3 h-3" />
      {text}
    </span>
  );
}

function FooterLink({ href, icon: Icon, label, color }: { href: string, icon: React.ElementType, label: string, color: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1, y: -3 }}
      whileTap={{ scale: 0.95 }}
      className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all relative group overflow-hidden"
      aria-label={label}
      style={{ '--hover-color': color } as React.CSSProperties}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
        style={{ backgroundColor: color }}
      />
      <Icon className="w-5 h-5 relative z-10 group-hover:text-[var(--hover-color)] transition-colors" />
    </motion.a>
  );
}
