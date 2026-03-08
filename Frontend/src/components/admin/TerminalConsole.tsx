import { useState, useEffect, useRef } from "react";
import { Terminal, Shield, Cpu } from "lucide-react";
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
        { id: 1, text: "KERNEL_INIT_SEQUENCE_STARTING...", type: "info" as const },
        { id: 2, text: "MOUNTING_REMOTE_STORAGE_RESOURCES... [OK]", type: "success" as const },
        { id: 3, text: "ETABLISHING_ENCRYPTED_HANDSHAKE_WITH_API... [CONNECTED]", type: "info" as const },
        { id: 4, text: "VIRTUAL_DOM_SYNC_INITIALIZED... [STABLE]", type: "success" as const },
        { id: 5, text: "NEUMORPHIC_LAYER_RENDER_COMPLETE... [LOADED]", type: "info" as const },
        { id: 6, text: "ADMIN_CORE_INTERFACE_READY. AUTHORIZED_SESSION_ACTIVE.", type: "success" as const },
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
        }, 600);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    return (
        <div className="nm-flat p-8 flex flex-col h-[450px] overflow-hidden group">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl nm-inset flex items-center justify-center text-indigo-500">
                        <Terminal size={24} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[var(--admin-text-primary)] tracking-tight uppercase italic">Kernel_Console</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Cpu size={10} /> Stable
                            </span>
                            <span className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">Runtime: v4.0.0-soft</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 nm-inset p-3 rounded-2xl border border-black/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                </div>
            </div>

            <div className="flex-1 terminal-inset overflow-hidden flex flex-col border border-black/10">
                <div className="flex-1 overflow-y-auto custom-terminal-scrollbar space-y-2.5 pr-2" ref={scrollRef}>
                    {lines.map((line) => (
                        <div key={line.id} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-500">
                            <span className="text-indigo-500/50 shrink-0 font-bold">[{line.timestamp.toLocaleTimeString([], { hour12: false })}]</span>
                            <span className={cn(
                                "tracking-wide font-medium",
                                line.type === "success" && "text-emerald-500",
                                line.type === "info" && "text-indigo-500",
                                line.type === "warning" && "text-amber-500",
                                line.type === "error" && "text-rose-500"
                            )}>
                                {">"} {line.text}
                            </span>
                        </div>
                    ))}
                    <div className="flex items-center gap-3 text-indigo-500/50 pl-1">
                        <span className="text-indigo-500 font-bold">{">"}</span>
                        <span className="w-2 h-4 bg-indigo-500/80 cursor-blink rounded-sm" />
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">
                        <Shield size={12} strokeWidth={3} />
                        <span>Encrypted_Link</span>
                    </div>
                    <div className="h-4 w-px bg-black/10" />
                    <div className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">Buffer: 1024KB</div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Protocol: SSH-RSA</span>
                    <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                </div>
            </div>
        </div>
    );
}
