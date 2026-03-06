import { Database, Server, Shield, Activity, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const getStatusColor = (status: string) => {
        if (status === "healthy" || status === "connected") return "status-healthy";
        if (status === "loading" || status === "checking") return "status-warning animate-pulse";
        return "status-error";
    };

    const getIndicatorColor = (status: string) => {
        if (status === "healthy" || status === "connected") return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]";
        if (status === "loading" || status === "checking") return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]";
        return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
    };

    return (
        <div className="glass-card flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-heading font-bold text-slate-900 text-lg uppercase tracking-tight">System Status</h2>
                <button
                    onClick={onRefresh}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Refresh Heartbeat"
                >
                    <RefreshCw size={16} className={cn(apiHealth === "loading" && "animate-spin")} />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* API Health */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                        <div className="flex items-center gap-2">
                            <Activity size={14} className="text-blue-500" />
                            <span>Core API</span>
                        </div>
                        <span className={cn("status-pill", getStatusColor(apiHealth))}>
                            {apiHealth === "healthy" ? "All Green" : apiHealth.toUpperCase()}
                        </span>
                    </div>
                    <div className="admin-progress">
                        <div
                            className="admin-progress-fill bg-emerald-500"
                            style={{ width: apiHealth === "healthy" ? "100%" : (apiHealth === "loading" ? "40%" : "10%") }}
                        />
                    </div>
                    {responseTime !== undefined && responseTime > 0 && (
                        <p className="text-[10px] text-slate-400 font-medium">Latency: <span className="text-slate-600 font-bold">{responseTime}ms</span></p>
                    )}
                </div>

                {/* Database & Redis */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Database size={12} className="text-purple-500" />
                            <span>Database</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", getIndicatorColor(database))} />
                            <span className="text-xs font-bold text-slate-700 capitalize">{database}</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Server size={12} className="text-orange-500" />
                            <span>Redis Cache</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", getIndicatorColor(redis))} />
                            <span className="text-xs font-bold text-slate-700 capitalize">{redis}</span>
                        </div>
                    </div>
                </div>

                {/* Security / SSL Placeholder */}
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white border border-blue-100 text-blue-600">
                            <Shield size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Environment</p>
                            <p className="text-xs font-bold text-blue-700 uppercase">Production SSL</p>
                        </div>
                    </div>
                    <div className="text-blue-600">
                        <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                    </div>
                </div>

                {lastChecked && (
                    <div className="pt-2 flex items-center gap-2 text-[10px] text-slate-400 font-medium italic border-t border-slate-50">
                        <Clock size={10} />
                        <span>Last checked: {lastChecked}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
