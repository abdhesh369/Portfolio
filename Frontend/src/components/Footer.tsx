import { Github, Linkedin, Twitter, Facebook, Instagram, Mail, Code2, Globe, Youtube, MessageCircle, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useVisitorCount } from "@/hooks/use-visitor-count";
import { TextHoverEffect, FooterBackgroundGradient } from "@/components/ui/hover-footer";

const defaultFooterNavItems = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Experience", href: "#experience" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "#contact" },
];

import { formatDate } from "@/lib/utils/date";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [location, setLocation] = useLocation();
  const { data: settings } = useSiteSettings();
  const visitorCount = useVisitorCount();

  // Build social links from settings
  const socialLinks = [
    settings?.socialGithub && { href: settings.socialGithub, icon: <Github size={20} />, label: "GitHub" },
    settings?.socialLinkedin && { href: settings.socialLinkedin, icon: <Linkedin size={20} />, label: "LinkedIn" },
    settings?.socialTwitter && { href: settings.socialTwitter, icon: <Twitter size={20} />, label: "Twitter" },
    settings?.socialInstagram && { href: settings.socialInstagram, icon: <Instagram size={20} />, label: "Instagram" },
    settings?.socialFacebook && { href: settings.socialFacebook, icon: <Facebook size={20} />, label: "Facebook" },
    settings?.socialYoutube && { href: settings.socialYoutube, icon: <Youtube size={20} />, label: "YouTube" },
    settings?.socialDiscord && { href: settings.socialDiscord, icon: <MessageCircle size={20} />, label: "Discord" },
    settings?.socialStackoverflow && { href: settings.socialStackoverflow, icon: <Globe size={20} />, label: "Stack Overflow" },
    settings?.socialDevto && { href: settings.socialDevto, icon: <Code2 size={20} />, label: "Dev.to" },
    settings?.socialMedium && { href: settings.socialMedium, icon: <Globe size={20} />, label: "Medium" },
  ].filter(Boolean) as Array<{ href: string; icon: React.ReactNode; label: string }>;

  // Contact info data
  const contactInfo = [
    {
      icon: <Mail size={18} className="text-[#3ca2fa]" />,
      text: settings?.socialEmail || "contact@example.com",
      href: `mailto:${settings?.socialEmail || "contact@example.com"}`,
    },
    // We don't have phone/location in settings natively, but keeping the structure for future or static use
    {
      icon: <MapPin size={18} className="text-[#3ca2fa]" />,
      text: "Remote, Global",
    },
  ];

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
    <footer className="bg-[#0F0F11]/10 relative h-fit rounded-[2rem] overflow-hidden m-4 sm:m-8 mt-20 border border-white/5">
      <div className="max-w-7xl mx-auto p-8 sm:p-14 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">

          {/* Brand section */}
          <div className="flex flex-col space-y-4 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="relative w-10 h-10 flex items-center justify-center bg-primary/10 rounded-xl border border-primary/30">
                <Code2 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-white text-2xl sm:text-3xl font-bold font-display tracking-tight">
                {settings?.personalName?.split(' ')[0] || "Portfolio"}<span className="text-[#3ca2fa]">.</span>{settings?.personalName?.split(' ')[1] || "Dev"}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {settings?.footerTagline || "Crafting robust digital systems with a focus on performance, scalability, and intuitive user experiences."}
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">Navigation</h4>
            <ul className="space-y-3">
              {defaultFooterNavItems.map((item) => (
                <li key={item.name} className="relative w-fit">
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="text-gray-400 hover:text-[#3ca2fa] transition-colors flex items-center gap-2 group text-sm sm:text-base"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect section */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-center space-x-3 text-gray-400">
                  {item.icon}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="hover:text-[#3ca2fa] transition-colors text-sm sm:text-base break-all"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="hover:text-[#3ca2fa] transition-colors text-sm sm:text-base">
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Live Status section */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">System Status</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm w-fit">
                <div className="relative flex items-center justify-center w-2 h-2">
                  <div className={`absolute inset-0 rounded-full blur-[2px] animate-pulse ${visitorCount.isPolling ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                  <div className={`relative w-1.5 h-1.5 rounded-full ${visitorCount.isPolling ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-none">
                    {visitorCount.count} Live Visitors
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-0.5">
                Updated: {settings?.updatedAt ? formatDate(settings.updatedAt, { month: 'short', day: '2-digit', year: 'numeric' }) : "Mar 05, 2026"}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-t border-white/10 my-8" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
          {/* Social icons */}
          <div className="flex flex-wrap justify-center gap-4 text-gray-400">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-[#3ca2fa] transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right text-gray-500">
            <p>{settings?.footerCopyright || `© ${currentYear} ${settings?.personalName || 'Portfolio'}. All rights reserved.`}</p>
          </div>
        </div>
      </div>

      {/* Text hover effect */}
      <div className="flex h-[20rem] sm:h-[25rem] md:h-[30rem] -mt-32 sm:-mt-40 md:-mt-52 mb-[-80px] sm:-mb-36 pointer-events-auto">
        <TextHoverEffect
          text={settings?.personalName ? settings.personalName.split(' ')[0].toUpperCase() : "PORTFOLIO"}
          className="z-50"
        />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
