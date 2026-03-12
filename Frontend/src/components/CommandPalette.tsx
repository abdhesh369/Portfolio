import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, FileText, Code, FolderGit2, ArrowRight, Home, Mail, Palette } from "lucide-react";
import { useLocation } from "wouter";
import { m, AnimatePresence } from "framer-motion";
import { useProjects, useArticles, useSkills } from "@/hooks/use-portfolio";
import { useTheme } from "@/components/theme-provider";
import { TOGGLE_COMMAND_PALETTE } from "@/hooks/use-command-palette";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const { setTheme, theme } = useTheme();

  const { data: projects = [] } = useProjects();
  const { data: articles = [] } = useArticles("published");
  const { data: skills = [] } = useSkills();

  // Handle keyboard shortcut (Ctrl+K or Cmd+K) and custom events
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    const handleToggle = (e: any) => {
      if (e?.detail?.open !== undefined) {
        setOpen(e.detail.open);
      } else {
        setOpen((o) => !o);
      }
    };

    window.addEventListener(TOGGLE_COMMAND_PALETTE, handleToggle);
    document.addEventListener("keydown", down);
    return () => {
      window.removeEventListener(TOGGLE_COMMAND_PALETTE, handleToggle);
      document.removeEventListener("keydown", down);
    };
  }, []);

  // Reset query when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => setQuery(""), 200);
    }
  }, [open]);

  // Filter items based on query
  const searchResults = useCallback(() => {
    const staticCommands = [
      { id: "home", title: "Go Home", type: "action" as const, icon: Home, href: "/" },
      { id: "newsletter", title: "Subscribe to Newsletter", type: "action" as const, icon: Mail, href: "/blog#newsletter" },
      { id: "theme", title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`, type: "action" as const, icon: Palette, action: () => setTheme(theme === "dark" ? "light" : "dark") },
    ];

    if (!query.trim()) return staticCommands;

    const lowerQuery = query.toLowerCase();

    const filteredProjects = projects
      .filter((p) => p.title.toLowerCase().includes(lowerQuery) || p.description?.toLowerCase().includes(lowerQuery))
      .map((p) => ({
        id: `project-${p.id}`,
        title: p.title,
        type: "project" as const,
        icon: FolderGit2,
        href: `/project/${p.id}`,
      }));

    const filteredArticles = articles
      .filter((a) => a.title.toLowerCase().includes(lowerQuery) || a.excerpt?.toLowerCase().includes(lowerQuery))
      .map((a) => ({
        id: `article-${a.id}`,
        title: a.title,
        type: "article" as const,
        icon: FileText,
        href: `/blog/${a.slug}`,
      }));

    const filteredSkills = skills
      .filter((s) => s.name.toLowerCase().includes(lowerQuery) || s.category.toLowerCase().includes(lowerQuery))
      .map((s) => ({
        id: `skill-${s.id}`,
        title: s.name,
        type: "skill" as const,
        icon: Code,
        href: `/#skills`,
      }));

    const filteredStatic = staticCommands.filter(c => c.title.toLowerCase().includes(lowerQuery));

    return [...filteredStatic, ...filteredProjects, ...filteredArticles, ...filteredSkills].slice(0, 10);
  }, [query, projects, articles, skills, theme, setTheme]);

  const results = searchResults();

  const handleSelect = (item: any) => {
    setOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      setLocation(item.href);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background/80 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl">
        <div className="flex items-center border-b border-white/10 px-4">
          <Search className="w-5 h-5 text-white/40 shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, articles, or skills..."
            className="border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-white/40 h-14 w-full text-base sm:text-lg rounded-none shadow-none"
            autoFocus
          />
          <div className="hidden sm:flex items-center gap-1 shrink-0 text-xs text-white/40">
            <kbd className="bg-white/5 py-1 px-2 rounded-md font-sans">esc</kbd> to close
          </div>
        </div>

        <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <AnimatePresence mode="wait">
            {results.length === 0 ? (
              <m.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center text-white/40 text-sm"
              >
                No results found for <span className="text-white font-medium">"{query}"</span>
              </m.div>
            ) : (
              <m.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-1"
              >
                {results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/5 group transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 w-full min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <item.icon className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                      </div>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-white font-medium truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </span>
                        <span className="text-xs text-white/30 capitalize px-2 py-0.5 rounded-full bg-white/5 shrink-0">
                          {item.type}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                  </button>
                ))}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

