import { useState, useEffect, useRef } from "react";
import { Terminal, Shield, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects, useSkills, useExperiences, useMessages, useAuth } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-helpers";
import { TabKey } from "./tabs/types";

interface TerminalLine {
    id: number;
    text: string;
    type: "info" | "success" | "warning" | "error" | "input";
    timestamp: Date;
}

interface TerminalConsoleProps {
    onNavigate?: (tab: TabKey) => void;
}

export default function TerminalConsole({ onNavigate }: TerminalConsoleProps) {
    const [lines, setLines] = useState<TerminalLine[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { logout } = useAuth();

    // Data for stats command
    const { data: projects } = useProjects();
    const { data: skills } = useSkills();
    const { data: experiences } = useExperiences();
    const { data: messages } = useMessages();

    const initialLines = [
        { id: 1, text: "KERNEL_INIT_SEQUENCE_STARTING...", type: "info" as const },
        { id: 2, text: "MOUNTING_REMOTE_STORAGE_RESOURCES... [OK]", type: "success" as const },
        { id: 3, text: "ETABLISHING_ENCRYPTED_HANDSHAKE_WITH_API... [CONNECTED]", type: "info" as const },
        { id: 4, text: "ADMIN_CORE_INTERFACE_READY. AUTHORIZED_SESSION_ACTIVE.", type: "success" as const },
        { id: 5, text: "Type 'help' for available commands.", type: "info" as const },
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
        }, 300);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    const addLine = (text: string, type: TerminalLine["type"] = "info") => {
        setLines(prev => [...prev, {
            id: Date.now() + Math.random(),
            text,
            type,
            timestamp: new Date()
        }]);
    };

    const handleCommand = async (cmd: string) => {
        const fullCommand = cmd.trim();
        const [baseCmd, ...args] = fullCommand.split(" ");
        
        addLine(`> ${fullCommand}`, "input");

        switch (baseCmd.toLowerCase()) {
            case "help":
                addLine("AVAILABLE COMMANDS:", "info");
                addLine("  stats          - Display live portfolio statistics");
                addLine("  goto <tab>     - Navigate to specific admin tab");
                addLine("  clear          - Clear terminal buffer");
                addLine("  cache clear    - Flush system Redis cache");
                addLine("  logout         - Terminate admin session");
                addLine("  whoami         - Display current session info");
                break;

            case "stats":
                addLine("ORBITAL_STATISTICS_STREAM:", "success");
                addLine(`  Projects:    ${projects?.length || 0}`);
                addLine(`  Skills:      ${skills?.length || 0}`);
                addLine(`  Experience:  ${experiences?.length || 0}`);
                addLine(`  Messages:    ${messages?.length || 0}`);
                break;

            case "goto": {
                const target = args[0]?.toLowerCase();
                if (!target) {
                    addLine("Error: Destination required. Usage: goto <projects|messages|skills|...>", "error");
                } else if (onNavigate) {
                    addLine(`NAVIGATING_TO: ${target.toUpperCase()}...`, "success");
                    onNavigate(target as TabKey);
                }
                break;
            }

            case "clear":
                setLines([]);
                break;

            case "cache":
                if (args[0]?.toLowerCase() === "clear") {
                    setIsProcessing(true);
                    addLine("INITIATING_CACHE_FLUSH...", "warning");
                    try {
                        await apiFetch("/api/v1/admin/cache/clear", { method: "POST" });
                        addLine("CACHE_SYNC_PURGED_SUCCESSFULLY. [OK]", "success");
                        toast({ title: "Cache Cleared", description: "System cache has been flushed." });
                    } catch (_err) {
                        addLine("CACHE_FLUSH_FAILURE. CHECK_LOGS.", "error");
                    } finally {
                        setIsProcessing(false);
                    }
                } else {
                    addLine("Usage: cache clear", "warning");
                }
                break;

            case "logout":
                addLine("TERMINATING_SESSION...", "warning");
                setTimeout(() => logout(), 1000);
                break;

            case "whoami":
                addLine("IDENTITY_RESOLVED: ADMIN_ROOT", "info");
                addLine(`RUNTIME_VER: v4.0.0-soft`);
                addLine(`SESSION_STR: ${Math.random().toString(36).substring(7).toUpperCase()}`);
                break;

            case "":
                break;

            default:
                addLine(`Unknown command: ${baseCmd}. Type 'help' for assistance.`, "error");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isProcessing) return;
        
        handleCommand(inputValue);
        setInputValue("");
    };

    return (
        <div 
            className="nm-flat p-8 flex flex-col h-[450px] overflow-hidden group cursor-text"
            onClick={() => inputRef.current?.focus()}
        >
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

            <div className="flex-1 terminal-inset overflow-hidden flex flex-col border border-black/10 relative">
                <div className="flex-1 overflow-y-auto custom-terminal-scrollbar space-y-2.5 pr-2 p-4" ref={scrollRef}>
                    {lines.map((line) => (
                        <div key={line.id} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-indigo-500/30 shrink-0 font-mono text-[10px]">[{line.timestamp.toLocaleTimeString([], { hour12: false })}]</span>
                            <span className={cn(
                                "tracking-wide font-mono text-xs",
                                line.type === "success" && "text-emerald-500",
                                line.type === "info" && "text-indigo-400",
                                line.type === "warning" && "text-amber-500",
                                line.type === "error" && "text-rose-500",
                                line.type === "input" && "text-indigo-200 font-bold italic"
                            )}>
                                {line.type === "input" ? "" : "> "} {line.text}
                            </span>
                        </div>
                    ))}
                    
                    <form onSubmit={handleSubmit} className="flex items-center gap-3 text-indigo-500 pl-1">
                        <span className="text-indigo-500 font-bold font-mono text-sm">{">"}</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isProcessing}
                            className="flex-1 bg-transparent border-none outline-none text-indigo-200 font-mono text-sm caret-indigo-500"
                            autoFocus
                            spellCheck={false}
                        />
                        {isProcessing && (
                            <div className="w-2 h-4 bg-indigo-500/80 animate-pulse rounded-sm" />
                        )}
                    </form>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">
                        <Shield size={12} strokeWidth={3} />
                        <span>Encrypted_Link</span>
                    </div>
                    <div className="h-4 w-px bg-black/10" />
                    <div className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">Buffer: {lines.length * 64}B</div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Protocol: SSH-RSA</span>
                    <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                </div>
            </div>
        </div>
    );
}
