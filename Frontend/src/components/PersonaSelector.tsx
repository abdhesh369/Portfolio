import { m, AnimatePresence } from "framer-motion";
import { User, Briefcase, Code, MousePointer2, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { usePersona, Persona } from "@/hooks/use-persona";
import { cn } from "@/lib/utils";

export function PersonaSelector() {
    const { persona, setPersona } = usePersona();
    const [isOpen, setIsOpen] = useState(false);
    const [hasSeenChoice, setHasSeenChoice] = useState(() => {
        if (typeof window === "undefined") return true;
        return localStorage.getItem("portfolio_has_seen_persona") === "true";
    });

    useEffect(() => {
        if (!hasSeenChoice) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [hasSeenChoice]);

    const handleChoice = (choice: Persona) => {
        setPersona(choice);
        setHasSeenChoice(true);
        localStorage.setItem("portfolio_has_seen_persona", "true");
        setIsOpen(false);
    };

    const personas: { id: Persona; label: string; icon: any; color: string; desc: string }[] = [
        { 
            id: 'recruiter', 
            label: "Recruiter", 
            icon: Briefcase, 
            color: "text-blue-400", 
            desc: "Focus on Experience & Skills" 
        },
        { 
            id: 'client', 
            label: "Potential Client", 
            icon: MousePointer2, 
            color: "text-emerald-400", 
            desc: "Show Services & Results" 
        },
        { 
            id: 'developer', 
            label: "Developer", 
            icon: Code, 
            color: "text-purple-400", 
            desc: "Architecture & Code Quality" 
        }
    ];

    return (
        <>
            {/* Floating Trigger */}
            <m.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-[4.5rem] left-6 z-[var(--z-dock)] p-4 rounded-2xl glass-cyber group",
                    persona !== 'default' && "neon-border ring-4 ring-primary/10"
                )}
            >
                <div className="relative flex items-center gap-3">
                    <div className="relative">
                        <User size={18} className={cn("text-muted-foreground group-hover:text-primary transition-colors", persona !== 'default' && "text-primary")} />
                        {persona === 'default' && (
                            <m.div 
                                animate={{ scale: [1, 1.2, 1] }} 
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" 
                            />
                        )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-500">
                        {persona === 'default' ? "Who are you?" : persona}
                    </span>
                </div>
            </m.button>

            {/* Selection Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
                        />
                        
                        <m.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-xl bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
                        >
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center space-y-3 mb-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                    <Sparkles size={10} /> Personalize_Your_Visit
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter">Choose Your Path</h2>
                                <p className="text-sm text-muted-foreground">The portfolio will reconfigure itself to prioritize what matters most to you.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {personas.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleChoice(p.id)}
                                        className={cn(
                                            "group flex items-center gap-6 p-6 rounded-3xl border transition-all duration-300",
                                            persona === p.id 
                                                ? "bg-primary/5 border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]" 
                                                : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center bg-background border transition-all duration-500",
                                            persona === p.id ? "scale-110 border-primary shadow-lg" : "border-white/10 group-hover:scale-105"
                                        )}>
                                            <p.icon size={24} className={p.color} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h4 className="font-bold text-base mb-0.5">{p.label}</h4>
                                            <p className="text-xs text-muted-foreground">{p.desc}</p>
                                        </div>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full border flex items-center justify-center transition-all",
                                            persona === p.id ? "bg-primary border-primary text-black" : "border-white/10"
                                        )}>
                                            {persona === p.id ? <User size={14} className="fill-current" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handleChoice('default')}
                                className="w-full mt-8 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
                            >
                                Continue with standard layout
                            </button>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
