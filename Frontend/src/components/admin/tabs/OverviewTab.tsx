import { useProjects, useSkills, useExperiences, useMessages } from "@/hooks/use-portfolio";
import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api-helpers";
import {
    Rocket, Mail, Zap, Briefcase, Plus
} from "lucide-react";
import StatCard from "../StatCard";
import ActivityFeed from "../ActivityFeed";
import SystemStatus from "../SystemStatus";
import TerminalConsole from "../TerminalConsole";
import type { AdminTabProps } from "./types";

interface HealthData {
    status: "healthy" | "unreachable" | "degraded" | "loading";
    database: string;
    redis: string;
    timestamp: string;
    responseTimeMs: number;
}

export function OverviewTab({ onNavigate }: AdminTabProps) {
    const { data: projects } = useProjects();
    const { data: skills } = useSkills();
    const { data: experiences } = useExperiences();
    const { data: messages = [] } = useMessages();

    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [healthLoading, setHealthLoading] = useState(true);
    const abortRef = useRef<AbortController | null>(null);

    const fetchHealth = useCallback(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setHealthLoading(true);
        try {
            const start = performance.now();
            const data = await apiFetch("/health", { signal: controller.signal });
            const elapsed = Math.round(performance.now() - start);
            setHealthData({ ...data, responseTimeMs: elapsed });
        } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") return;
            setHealthData({
                status: "unreachable",
                database: "unknown",
                redis: "unknown",
                timestamp: new Date().toISOString(),
                responseTimeMs: -1,
            });
        } finally {
            setHealthLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealth();
        return () => { abortRef.current?.abort(); };
    }, [fetchHealth]);

    const activities: any[] = (messages || []).slice(0, 5).map((msg, idx) => ({
        id: msg.id || idx,
        type: "message" as const,
        content: `New message from ${msg.name}`,
        timestamp: msg.createdAt ? formatTimeAgo(new Date(msg.createdAt)) : "Recently",
        metadata: (msg.message || "").slice(0, 50) + ((msg.message || "").length > 50 ? "..." : "")
    }));

    // Pad with system activities if empty
    if (activities.length === 0) {
        activities.push({
            id: "system-1",
            type: "system" as const,
            content: "System initialized",
            timestamp: "Today",
            metadata: "All modules loaded successfully"
        });
    }

    return (
        <div className="space-y-8 animate-in">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--admin-text-primary)] tracking-tight uppercase">
                        Unified_Dashboard
                    </h1>
                    <p className="text-[var(--admin-text-secondary)] text-xs mt-2 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        System_Status: Operational
                    </p>
                </div>
                <button
                    onClick={() => onNavigate?.("projects")}
                    className="h-12 px-8 rounded-2xl nm-button text-[11px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-primary)] hover:text-[var(--nm-accent)] transition-all flex items-center gap-3"
                >
                    <Plus size={18} strokeWidth={3} />
                    Deploy_Module
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    label="Total Projects"
                    value={projects?.length ?? 0}
                    icon={Rocket}
                    color="blue"
                    trend={{ value: "12%", isUp: true, label: "this month" }}
                    delay="100ms"
                />
                <StatCard
                    label="Active Messages"
                    value={messages.length}
                    icon={Mail}
                    color="green"
                    trend={{ value: messages.length > 0 ? "LIVE" : "NULL", isUp: true }}
                    delay="200ms"
                />
                <StatCard
                    label="Skill Modules"
                    value={skills?.length ?? 0}
                    icon={Zap}
                    color="purple"
                    delay="300ms"
                />
                <StatCard
                    label="Experience Logs"
                    value={experiences?.length ?? 0}
                    icon={Briefcase}
                    color="orange"
                    delay="400ms"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-2">
                    <ActivityFeed activities={activities} onFetchAll={() => onNavigate?.("messages")} />
                </div>

                {/* System Health */}
                <div className="lg:col-span-1">
                    <SystemStatus
                        apiHealth={healthLoading ? "loading" : (healthData?.status || "unreachable")}
                        database={healthLoading ? "checking" : (healthData?.database || "unknown")}
                        redis={healthLoading ? "checking" : (healthData?.redis || "unknown")}
                        responseTime={healthData?.responseTimeMs}
                        lastChecked={healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : undefined}
                        onRefresh={fetchHealth}
                    />
                </div>
            </div>

            {/* System Console */}
            <div className="animate-nm-in" style={{ animationDelay: '500ms' }}>
                <TerminalConsole />
            </div>
        </div>
    );
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
}
