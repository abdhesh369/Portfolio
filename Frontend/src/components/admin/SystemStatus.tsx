import { Database, Server, Shield, Activity, RefreshCw, Clock } from "lucide-react";
import { cn } from "#src/lib/utils";

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

    const getIndicatorStyles = (status: string) => {
        if (status === "healthy" || status === "connected")
            return "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]";
        if (status === "loading" || status === "checking")
            return "bg-amber-400 animate-pulse";
        return "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]";
    };

    return (
        <div className="nm-flat flex flex-col h-full overflow-hidden">
            <div className="p-8 flex items-center justify-between border-b border-black/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 nm-inset flex items-center justify-center text-indigo-500 rounded-xl">
                        <Activity size={20} className="animate-pulse" />
                    </div>
                    <h2 className="text-xl font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">
                        Heartbeat
                    </h2>
                </div>
                <button
                    onClick={onRefresh}
                    className={cn(
                        "w-10 h-10 nm-button text-[var(--admin-text-secondary)] hover:text-indigo-500 transition-all",
                        apiHealth === "loading" && "nm-inset"
                    )}
                    title="Force Refresh"
                >
                    <RefreshCw size={16} strokeWidth={3} className={cn(apiHealth === "loading" && "animate-spin")} />
                </button>
            </div>

            <div className="p-8 space-y-10 flex-1">
                {/* Core API Health */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.25em] text-[var(--admin-text-muted)]">
                        <div className="flex items-center gap-3">
                            <Activity size={14} strokeWidth={3} className="text-indigo-500" />
                            <span>Endpoint_Stability</span>
                        </div>
                        <span className={cn(
                            "px-4 py-1.5 rounded-full nm-inset text-[9px] font-black tracking-widest",
                            apiHealth === "healthy" ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {apiHealth === "healthy" ? "NOMINAL" : apiHealth.toUpperCase()}
                        </span>
                    </div>

                    <div className="progress-track h-2.5">
                        <div
                            className="progress-fill"
                            style={{
                                width: apiHealth === "healthy" ? "100%" : (apiHealth === "loading" ? "45%" : "20%"),
                                background: apiHealth === "healthy" ? undefined : 'linear-gradient(90deg, #f43f5e, #fb7185)'
                            }}
                        />
                    </div>

                    {responseTime !== undefined && responseTime > 0 && (
                        <div className="flex items-center gap-2 nm-inset w-fit px-4 py-1.5 rounded-lg border border-black/5">
                            <Clock size={12} className="text-indigo-500" />
                            <p className="text-[10px] text-[var(--admin-text-primary)] font-black uppercase tracking-widest">
                                Latency: <span className="text-indigo-500">{responseTime}ms</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Persistence Layers */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl nm-inset space-y-4 border border-black/5 hover:bg-black/[0.02] transition-colors group">
                        <div className="flex items-center gap-3 text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">
                            <Database size={14} className="text-purple-500 group-hover:rotate-12 transition-transform" />
                            <span>Storage</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={cn("w-2.5 h-2.5 rounded-full", getIndicatorStyles(database))} />
                            <span className="text-xs font-black text-[var(--admin-text-primary)] uppercase tracking-wider">{database}</span>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl nm-inset space-y-4 border border-black/5 hover:bg-black/[0.02] transition-colors group">
                        <div className="flex items-center gap-3 text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">
                            <Server size={14} className="text-orange-500 group-hover:rotate-12 transition-transform" />
                            <span>Cache</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={cn("w-2.5 h-2.5 rounded-full", getIndicatorStyles(redis))} />
                            <span className="text-xs font-black text-[var(--admin-text-primary)] uppercase tracking-wider">{redis}</span>
                        </div>
                    </div>
                </div>

                {/* Security Perimeter */}
                <div className="p-6 rounded-2xl nm-inset flex items-center justify-between border-l-4 border-indigo-500/50 bg-indigo-500/5">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl nm-button flex items-center justify-center text-indigo-500 border border-white/40">
                            <Shield size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.25em] mb-1">Defense_Perimeter</p>
                            <p className="text-sm font-black text-[var(--admin-text-primary)] tracking-widest uppercase italic">TLS_1.3_Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {lastChecked && (
                <div className="py-5 bg-black/[0.02] flex items-center justify-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.3em]">Last_Handshake: {lastChecked}</span>
                </div>
            )}
        </div>
    );
}
