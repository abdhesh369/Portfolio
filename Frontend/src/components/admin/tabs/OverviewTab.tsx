import { useProjects, useSkills, useExperiences, useMessages } from "@/hooks/use-portfolio";
import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api-helpers";
import {
    Rocket, Mail, Zap, Briefcase, Plus, Activity
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

    const activities: {
        id: string | number;
        type: "message" | "project" | "skill" | "system";
        content: string;
        timestamp: string;
        metadata?: string;
    }[] = (messages || []).slice(0, 5).map((msg, idx) => ({
        id: msg.id || idx,
        type: "message" as const,
        content: `New message from ${msg.name}`,
        timestamp: msg.createdAt ? formatTimeAgo(new Date(msg.createdAt)) : "Recently",
        metadata: (msg.message || "").slice(0, 50) + ((msg.message || "").length > 50 ? "..." : "")
    }));

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
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Soft Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 nm-inset rounded-xl flex items-center justify-center text-indigo-500">
                            <Activity size={20} strokeWidth={3} />
                        </div>
                        <h1 className="text-4xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic">
                            Overview
                        </h1>
                    </div>
                    <p className="text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 ml-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                        Kernel: Status_Active
                    </p>
                </div>

                <button
                    onClick={() => onNavigate?.("projects")}
                    className="nm-button nm-button-primary h-14 px-10 text-[12px] font-black uppercase tracking-[0.25em]"
                >
                    <Plus size={20} strokeWidth={3} className="mr-3" />
                    New_Project
                </button>
            </div>

            {/* Neumorphic Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                <StatCard
                    label="Active Projects"
                    value={projects?.length ?? 0}
                    icon={Rocket}
                    trend={{ value: "12%", isUp: true, label: "Growth" }}
                    delay="100ms"
                />
                <StatCard
                    label="Inbox Requests"
                    value={messages.length}
                    icon={Mail}
                    trend={{ value: messages.length > 0 ? "LIVE" : "0", isUp: messages.length > 0 }}
                    delay="200ms"
                />
                <StatCard
                    label="Core Skills"
                    value={skills?.length ?? 0}
                    icon={Zap}
                    delay="300ms"
                />
                <StatCard
                    label="Exp Entries"
                    value={experiences?.length ?? 0}
                    icon={Briefcase}
                    delay="400ms"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Activity Feed Section */}
                <div className="lg:col-span-2">
                    <ActivityFeed activities={activities} onFetchAll={() => onNavigate?.("messages")} />
                </div>

                {/* Heartbeat Monitoring */}
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

            {/* Interactive System Console */}
            <div className="animate-in slide-in-from-bottom-6 duration-1000" style={{ animationDelay: '600ms' }}>
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
