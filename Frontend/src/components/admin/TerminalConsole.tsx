import { useState, useEffect, useRef } from "react";
import { Terminal, Maximize2, Minimize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalLine {
    id: number;
    text: string;
    type: "info" | "success" | "warning" | "error";
    timestamp: Date;
}

export default function TerminalConsole() {
    const [lines, setLines] = useState<TerminalLine[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const initialLines = [
        { id: 1, text: "INITIALIZING_SYSTEM_CORE... [OK]", type: "info" as const },
        { id: 2, text: "MOUNTING_DRIVE_PORTFOLIO... [SUCCESS]", type: "success" as const },
        { id: 3, text: "CONNECTING_TO_DATABASE_RELAY... [ESTABLISHED]", type: "info" as const },
        { id: 4, text: "SYNCING_VIRTUAL_DOM_STATE... [READY]", type: "info" as const },
        { id: 5, text: "DASHBOARD_LIVE_BROADCAST_START... [ONLINE]", type: "success" as const },
    ];

    useEffect(() => {
        let currentIdx = 0;
        const interval = setInterval(() => {
            if (currentIdx < initialLines.length) {
                const lineToAdd = { ...initialLines[currentIdx], timestamp: new Date() };
                setLines(prev => [...prev, lineToAdd]);
                currentIdx++;
            } else {
                clearInterval(interval);
            }
        }, 800);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    return (
        <div className="nm-flat rounded-[2rem] p-7 flex flex-col h-[400px] overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl nm-inset flex items-center justify-center text-indigo-500">
                        <Terminal size={18} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-[var(--admin-text-primary)] tracking-widest uppercase">System_Console</h3>
                        <p className="text-[9px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-[0.2em]">Runtime: v2.4.0-stable</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400 opacity-40" />
                    <div className="w-3 h-3 rounded-full bg-amber-400 opacity-40" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400 opacity-40" />
                </div>
            </div>

            <div className="flex-1 nm-inset rounded-2xl p-5 font-mono text-[11px] overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto custom-terminal-scrollbar space-y-1.5" ref={scrollRef}>
                    {lines.filter(Boolean).map((line) => (
                        <div key={line.id} className="flex gap-3 animate-nm-in">
                            <span className="text-[var(--admin-text-secondary)] shrink-0">[{line.timestamp.toLocaleTimeString([], { hour12: false })}]</span>
                            <span className={cn(
                                "tracking-wider",
                                line.type === "success" && "text-emerald-400",
                                line.type === "info" && "text-indigo-400",
                                line.type === "warning" && "text-amber-400",
                                line.type === "error" && "text-rose-400"
                            )}>
                                {line.text}
                            </span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 text-[var(--admin-text-secondary)]">
                        <span className="w-1.5 h-3 bg-[var(--admin-text-secondary)] animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-[9px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.3em]">
                <span>STATUS: MONITORED</span>
                <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    LOCAL_DEBUGMODE
                </span>
            </div>
        </div>
    );
}
