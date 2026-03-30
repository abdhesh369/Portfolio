import { useState, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon, X, Cpu, Shield } from "lucide-react";
import { useSiteSettings } from "#src/hooks/use-site-settings";
import { useSkills } from "#src/hooks/portfolio/use-skills";
import { useProjects } from "#src/hooks/portfolio/use-projects";
import { useLocation } from "wouter";

interface TerminalLine {
  id: string;
  text: string;
  type: "cmd" | "out" | "err" | "success";
}

export function TerminalOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { data: settings } = useSiteSettings();
  const { data: skills } = useSkills();
  const { data: projects } = useProjects();
  const [history, setHistory] = useState<TerminalLine[]>([
    { id: "init", text: `SYSTEM_INITIALIZED: ${settings?.personalName?.toUpperCase() || "PORTFOLIO"}_OS v1.0.0`, type: "success" },
    { id: "help", text: 'Type "help" for available commands.', type: "out" },
  ]);

  // Update initial line when settings load
  useEffect(() => {
    if (settings?.personalName) {
      const name = settings.personalName;
      setHistory(prev => prev.map(line => 
        line.id === "init" 
          ? { ...line, text: `SYSTEM_INITIALIZED: ${name.toUpperCase()}_OS v1.0.0` }
          : line
      ));
    }
  }, [settings]);
  const [, setLocation] = useLocation();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Global Hotkey Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "`" || e.key === "~") && !e.ctrlKey && !e.metaKey) {
        // Prevent typing the char into focused inputs
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
           // only toggle if not already focused in terminal
           if (document.activeElement !== inputRef.current) return;
        }
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const addLine = (text: string, type: TerminalLine["type"] = "out") => {
    setHistory(prev => [...prev.slice(-49), { id: crypto.randomUUID(), text, type }]);
  };

  const processCommand = (cmd: string) => {
    const args = cmd.toLowerCase().trim().split(" ");
    const primary = args[0];

    addLine(`> ${cmd}`, "cmd");

    switch (primary) {
      case "help":
        addLine("Available commands:");
        addLine("  whoami   - Display current user profile");
        addLine("  skills   - List technical competencies");
        addLine("  projects - Show portfolio highlights");
        addLine("  contact  - Switch to contact section");
        addLine("  clear    - Flush terminal buffer");
        addLine("  exit     - Shutdown console");
        break;

      case "whoami":
        addLine(`Identity: ${settings?.personalName || "Portfolio Owner"}`);
        addLine(`Title: ${settings?.personalTitle || "Full Stack Engineer"}`);
        addLine(`Status: ${settings?.availabilityStatus || "Active"}`);
        break;

      case "skills":
        if (!skills) {
          addLine("Retrieving skill matrix...", "err");
        } else {
          const categories = Array.from(new Set(skills.map(s => s.category)));
          categories.forEach(cat => {
            const list = skills.filter(s => s.category === cat).map(s => s.name).join(", ");
            addLine(`[${cat}]: ${list}`);
          });
        }
        break;

      case "projects":
        if (!projects) {
          addLine("Scanning repository...", "err");
        } else {
          projects.slice(0, 5).forEach(p => {
             addLine(`* ${p.title} - ${p.techStack.slice(0, 3).join("/")}`);
          });
          addLine(`(+ ${Math.max(0, projects.length - 5)} more)`);
        }
        break;

      case "contact":
        addLine("Redirecting to uplink node...");
        setLocation("/");
        setTimeout(() => {
          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
        }, 500);
        break;

      case "clear":
        setHistory([]);
        break;

      case "exit":
        setIsOpen(false);
        break;

      case "":
        break;

      default:
        addLine(`Command not recognized: ${primary}. Type "help" for a list of operations.`, "err");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processCommand(input);
    setInput("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10 pointer-events-none"
        >
          {/* Backdrop */}
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />

          {/* Terminal Box */}
          <m.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl h-[80vh] bg-[#0a0a0b] border border-cyan-500/30 rounded-lg overflow-hidden flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.15)] pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/50 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  <TerminalIcon className="w-3.5 h-3.5" />
                  root@{(settings?.personalName?.toLowerCase().replace(/\s+/g, "-") || "portfolio")}:~
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Output */}
            <div className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-2 custom-terminal-scrollbar">
              <AnimatePresence initial={false}>
                {history.map((line) => (
                  <m.div
                    key={line.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`
                      ${line.type === "cmd" ? "text-cyan-400 font-bold" : ""}
                      ${line.type === "err" ? "text-red-400" : ""}
                      ${line.type === "success" ? "text-green-400" : ""}
                      ${line.type === "out" ? "text-neutral-300" : ""}
                    `}
                  >
                    {line.text}
                  </m.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} className="h-2" />
            </div>

            {/* Input Line */}
            <form onSubmit={handleSubmit} className="p-4 bg-neutral-900/30 border-t border-white/5 flex items-center gap-3 font-mono">
              <span className="text-cyan-400 font-bold shrink-0">{">"}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-neutral-200 placeholder:text-neutral-700 text-sm"
                placeholder="Type a command..."
              />
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground/50 uppercase tracking-tighter">
                <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU: 0.2%</span>
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> SSL: V3</span>
              </div>
            </form>

            {/* Footer Hud */}
            <div className="px-4 py-2 bg-neutral-950 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em]">
               <span>PORTFOLIO_CORE_v7.4.2</span>
               <span>CONNECTION: STABLE [GIGABIT]</span>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
