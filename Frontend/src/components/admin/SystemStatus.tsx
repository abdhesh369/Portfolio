import { Database, Server, Shield, Activity, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRipple } from "@/hooks/use-ripple";

interface SystemStatusProps {
    apiHealth: "healthy" | "unreachable" | "degraded" | "loading";
    database: string;
    redis: string;
    responseTime?: number;
    lastChecked?: string;
    onRefresh?: () => void;
}

export default function SystemStatus({
    apiHealth,
    database,
    redis,
    responseTime,
    lastChecked,
    onRefresh
}: SystemStatusProps) {
    const ripple = useRipple();

    const getIndicatorColor = (status: string) => {
        if (status === "healthy" || status === "connected") return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
        if (status === "loading" || status === "checking") return "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]";
        return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
    };

    return (
        <div className="nm-flat rounded-[2rem] flex flex-col h-full overflow-hidden">
            <div className="p-7 flex items-center justify-between">
                <h2 className="text-xl font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">
                    HEARTBEAT
                </h2>
                <button
                    onClick={(e) => { ripple(e); onRefresh?.(); }}
                    className="w-10 h-10 nm-button text-[var(--admin-text-secondary)] hover:text-[var(--nm-accent)] transition-all flex items-center justify-center p-0"
                    title="Refresh Heartbeat"
                >
                    <RefreshCw size={16} strokeWidth={3} className={cn(apiHealth === "loading" && "animate-spin")} />
                </button>
            </div>

            <div className="p-7 pt-0 space-y-8 flex-1">
                {/* API Health */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-secondary)]">
                        <div className="flex items-center gap-2.5">
                            <Activity size={14} strokeWidth={3} className="text-[var(--nm-accent)]" />
                            <span>CORE_API</span>
                        </div>
                        <span className={cn(
                            "px-3 py-1 rounded-full nm-inset",
                            apiHealth === "healthy" ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {apiHealth === "healthy" ? "NOMINAL" : apiHealth.toUpperCase()}
                        </span>
                    </div>
                    <div className="progress-track h-2.5 rounded-full overflow-hidden">
                        <div
                            className="progress-fill h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: apiHealth === "healthy" ? "100%" : (apiHealth === "loading" ? "40%" : "15%") }}
                        />
                    </div>
                    {responseTime !== undefined && responseTime > 0 && (
                        <div className="flex items-center gap-2">
                            <Clock size={10} className="text-[var(--admin-text-secondary)]" />
                            <p className="text-[10px] text-[var(--admin-text-secondary)] font-bold uppercase tracking-widest">
                                LATENCY: <span className="text-[var(--nm-accent)]">{responseTime}ms</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Database & Redis */}
                <div className="grid grid-cols-2 gap-5">
                    <div className="p-5 rounded-2xl nm-inset space-y-4">
                        <div className="flex items-center gap-2.5 text-[9px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em]">
                            <Database size={12} strokeWidth={3} className="text-purple-500" />
                            <span>STORAGE</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={cn("w-2.5 h-2.5 rounded-full", getIndicatorColor(database))} />
                            <span className="text-[11px] font-black text-[var(--admin-text-primary)] uppercase tracking-wider">{database}</span>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl nm-inset space-y-4">
                        <div className="flex items-center gap-2.5 text-[9px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em]">
                            <Server size={12} strokeWidth={3} className="text-orange-500" />
                            <span>CACHE</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={cn("w-2.5 h-2.5 rounded-full", getIndicatorColor(redis))} />
                            <span className="text-[11px] font-black text-[var(--admin-text-primary)] uppercase tracking-wider">{redis}</span>
                        </div>
                    </div>
                </div>

                {/* Security Placeholder */}
                <div className="p-5 rounded-2xl nm-inset flex items-center justify-between border-l-2 border-[var(--nm-accent)]/30">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl nm-flat flex items-center justify-center text-[var(--nm-accent)]">
                            <Shield size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em]">NETWORK_DEFENSE</p>
                            <p className="text-xs font-black text-[var(--admin-text-primary)] tracking-widest uppercase">SSL_ENCRYPTED</p>
                        </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[var(--nm-accent)] shadow-[0_0_10px_rgba(var(--nm-accent-rgb),0.5)]" />
                </div>
            </div>

            {lastChecked && (
                <div className="p-5 border-t border-[var(--nm-dark)]/20 flex items-center justify-center gap-2">
                    <span className="text-[9px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-[0.3em]">SYNCHRONIZED_AT: {lastChecked}</span>
                </div>
            )}
        </div>
    );
}
