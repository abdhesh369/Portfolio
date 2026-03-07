import { Github, Linkedin, Twitter, Facebook, Instagram, Mail, Code2, Cpu, Globe, Youtube, MessageCircle } from "lucide-react";
import { m } from "framer-motion";
import { useLocation } from "wouter";
import { useSiteSettings } from "@/hooks/use-site-settings";

const defaultFooterNavItems = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Experience", href: "#experience" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "#contact" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [location, setLocation] = useLocation();
  const { data: settings } = useSiteSettings();

  // Build social links from settings
  const socialLinks = [
    settings?.socialGithub && { href: settings.socialGithub, icon: Github, label: "GitHub", color: "#333" },
    settings?.socialLinkedin && { href: settings.socialLinkedin, icon: Linkedin, label: "LinkedIn", color: "#0077b5" },
    settings?.socialTwitter && { href: settings.socialTwitter, icon: Twitter, label: "Twitter", color: "#1da1f2" },
    settings?.socialInstagram && { href: settings.socialInstagram, icon: Instagram, label: "Instagram", color: "#e1306c" },
    settings?.socialFacebook && { href: settings.socialFacebook, icon: Facebook, label: "Facebook", color: "#1877f2" },
    settings?.socialYoutube && { href: settings.socialYoutube, icon: Youtube, label: "YouTube", color: "#ff0000" },
    settings?.socialDiscord && { href: settings.socialDiscord, icon: MessageCircle, label: "Discord", color: "#5865F2" },
    settings?.socialStackoverflow && { href: settings.socialStackoverflow, icon: Globe, label: "Stack Overflow", color: "#F48024" },
    settings?.socialDevto && { href: settings.socialDevto, icon: Code2, label: "Dev.to", color: "#0A0A0A" },
    settings?.socialMedium && { href: settings.socialMedium, icon: Globe, label: "Medium", color: "#000000" },
  ].filter(Boolean) as Array<{ href: string; icon: React.ElementType; label: string; color: string }>;

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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-card to-background" />

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
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent box-shadow-glow" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <m.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2"
            >
              <div className="relative w-10 h-10 flex items-center justify-center bg-primary/10 rounded-xl border border-primary/30">
                <Code2 className="w-6 h-6 text-primary" />
                <div className="absolute -inset-1 bg-primary/20 blur-lg rounded-full opacity-50" />
              </div>
              <h3 className="text-2xl font-bold font-display tracking-tight text-white">
                {settings?.personalName?.split(' ')[0] || "Portfolio"}<span className="text-primary">.</span>{settings?.personalName?.split(' ')[1] || "Dev"}
              </h3>
            </m.div>

            <p className="text-base text-gray-400 leading-relaxed max-w-sm">
              {settings?.footerTagline || "Crafting robust digital systems with a focus on performance, scalability, and intuitive user experiences."}
            </p>

            <div className="flex flex-wrap gap-3">
              <Badge icon={Cpu} text="System Design" color="primary" />
              <Badge icon={Globe} text="Web Dev" color="secondary" />
              <Badge icon={Code2} text="Algorithms" color="accent" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-3">
              {defaultFooterNavItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:scale-150 transition-transform" />
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
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Get in touch</span>
              </div>
              <a
                href={`mailto:${settings?.socialEmail || "contact@example.com"}?subject=Contact%20from%20Portfolio`}
                className="text-lg font-bold text-white hover:text-primary transition-colors truncate block"
              >
                {settings?.socialEmail || "contact@example.com"}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 space-y-1 text-center md:text-left">
            <p>{settings?.footerCopyright || `© ${currentYear} Portfolio. All rights reserved.`}</p>
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-tighter">
              System last updated: {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : "Mar 05, 2026"} • Build: v3.2.0-stable
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Badge({ icon: Icon, text, color }: { icon: React.ElementType, text: string, color: 'primary' | 'secondary' | 'accent' }) {
  const colors = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    accent: 'bg-accent/10 text-accent border-accent/20',
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
    <m.a
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
    </m.a>
  );
}
