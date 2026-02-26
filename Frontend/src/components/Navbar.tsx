import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Code2, Terminal, Cpu } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith("#")) {
      if (location !== "/") {
        setLocation("/");
        // Wait for navigation then scroll
        setTimeout(() => {
          const element = document.querySelector(href);
          element?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: "smooth" });
      }
    } else if (href === "/") {
      if (location === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setLocation(href);
        // Wait for potential page transition then scroll
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
      }
    } else {
      setLocation(href);
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled
        ? "bg-[#050510]/80 backdrop-blur-md border-b border-white/10 shadow-lg shadow-cyan-500/5"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <div
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavClick("/")}
            aria-label="Abdhesh Sah Portfolio"
          >
            <div className="relative w-10 h-10 flex items-center justify-center bg-cyan-500/10 rounded-xl border border-cyan-500/30 overflow-hidden group">
              <Code2 className="w-6 h-6 text-cyan-400 relative z-10 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-cyan-500/20 blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white group">
              Abdhesh<span className="text-cyan-400">.</span>Dev
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-full group overflow-hidden"
              >
                <span className="relative z-10">{item.name}</span>
                {/* Hover Glow Background */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-cyan-400 group-hover:w-[60%] transition-all duration-300 shadow-[0_0_10px_#22d3ee]" />
              </button>
            ))}

            <div className="ml-4 pl-4 border-l border-white/10">
              <Button
                onClick={() => handleNavClick("#contact")}
                className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-full px-6 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all"
              >
                Hire Me
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0520]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="block w-full text-left px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all border-l-2 border-transparent hover:border-cyan-400"
                >
                  {item.name}
                </button>
              ))}
              <Button
                onClick={() => handleNavClick("#contact")}
                className="w-full mt-4 bg-cyan-500 text-black hover:bg-cyan-400"
              >
                Hire Me
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
