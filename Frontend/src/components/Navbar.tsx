import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Menu, X, Code2 } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PerformanceToggle } from "@/components/PerformanceToggle";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { useScrollStore } from "@/hooks/use-scroll-store";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { DEFAULT_SECTION_ORDER } from "@portfolio/shared";

const DEFAULT_NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "#contact" },
];

const SECTION_IDS = [...DEFAULT_SECTION_ORDER];

export default function Navbar() {
  const { data: settings } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();

  // Merge default nav items with admin links to prevent overwriting
  const navItems = (() => {
    if (!settings?.navbarLinks || !Array.isArray(settings.navbarLinks)) return DEFAULT_NAV_ITEMS;
    
    // Normalize admin links to handle both `url` and `href` properties (schema mismatch fix)
    const adminLinks = settings.navbarLinks.map((link: any) => ({
      name: link.label || "Link",
      href: link.href || link.url || "#",
    })).filter(link => link.name !== "New Link" && link.name.trim() !== "");

    // Exclude custom links that clash with default ones
    const newLinks = adminLinks.filter(adminLink => 
      !DEFAULT_NAV_ITEMS.some(defaultLink => defaultLink.name === adminLink.name || defaultLink.href === adminLink.href)
    );

    return [...DEFAULT_NAV_ITEMS, ...newLinks];
  })();

  const dynamicSectionIds = settings?.sectionOrder || SECTION_IDS;
  const activeSection = useScrollSpy(dynamicSectionIds, 80);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { scrollY, scrollDirection } = useScrollStore();

  const scrolled = scrollY > 20;
  const isVisible = scrollDirection === "up" || scrollY <= 80;


  const handleNavClick = (href: string) => {
    setIsOpen(false);

    if (href.startsWith("#")) {
      if (location !== "/") {
        // Navigate to home first, the hash scroll will be handled by Home component
        setLocation("/");
        // We set the hash manually to ensure it's picked up
        window.location.hash = href;
      } else {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          // Update hash without triggering reload
          window.history.pushState(null, "", href);
        }
      }
    } else if (href === "/") {
      if (location === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/");
      } else {
        setLocation("/");
      }
    } else {
      setLocation(href);
    }
  };

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && mobileMenuRef.current) {
        const focusableElements = mobileMenuRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${scrolled
        ? "bg-background/80 backdrop-blur-md border-b border-white/10 shadow-lg shadow-cyan-500/5"
        : "bg-transparent"
        } ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <button
            className="flex-shrink-0 flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl transition-all group"
            onClick={() => handleNavClick("/")}
            aria-label={`${settings?.logoText || "Portfolio"} - Home`}
          >
            <div className="relative w-10 h-10 flex items-center justify-center bg-primary/10 rounded-xl border border-primary/30 overflow-hidden">
              <Code2 className="w-6 h-6 text-primary relative z-10 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-primary/20 blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
              {settings?.logoText ? (
                <>
                  {settings.logoText.split('.')[0]}<span className="text-primary">.</span>{settings.logoText.split('.')[1] || "Dev"}
                </>
              ) : (
                <>
                  Portfolio<span className="text-primary">.</span>Dev
                </>
              )}
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = (item.href === "/" && activeSection === "hero") ||
                (item.href.startsWith("#") && activeSection === item.href.slice(1));
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full group overflow-hidden ${isActive
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                    }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  {/* Hover Glow Background */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300" />
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-primary transition-all duration-300 shadow-[0_0_10px_var(--primary)] ${isActive
                    ? "w-[60%]"
                    : "w-0 group-hover:w-[60%]"
                    }`} />
                </button>
              )
            })}

            <div className="ml-4 pl-4 border-l border-white/10 flex items-center gap-2">
              <PerformanceToggle />
              <Button
                onClick={() => handleNavClick(settings?.heroCtaPrimaryUrl || "#contact")}
                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/50 rounded-full px-6 shadow-[0_0_15px_var(--primary-glow)] hover:shadow-[0_0_25px_var(--primary-glow)] transition-all"
              >
                {settings?.heroCtaPrimary || "Hire Me"}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                setIsOpen(false);
              }
            }}
            className="md:hidden bg-card/80 backdrop-blur-3xl shadow-2xl border-b border-white/10 overflow-hidden touch-none"
          >
            {/* Grab handle for swipe */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-white/10" />
            </div>
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => {
                const isActive = (item.href === "/" && activeSection === "hero") ||
                  (item.href.startsWith("#") && activeSection === item.href.slice(1));
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    aria-current={isActive ? "page" : undefined}
                    className={`block w-full text-left px-4 py-3 text-base font-medium transition-all border-l-2 rounded-lg ${isActive ? "text-white bg-white/5 border-primary" : "text-gray-300 border-transparent hover:text-white hover:bg-white/5 hover:border-primary"}`}
                  >
                    {item.name}
                  </button>
                )
              })}
              <Button
                onClick={() => handleNavClick(settings?.heroCtaPrimaryUrl || "#contact")}
                className="w-full mt-4 bg-primary text-black hover:bg-primary/90 font-bold"
              >
                {settings?.heroCtaPrimary || "Hire Me"}
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
