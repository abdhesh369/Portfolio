import { useProjects, useSkills, useExperiences, useMessages, useAnalyticsSummary, useAdminSubscribers, useArticles, useAdminGuestbook } from "@/hooks/use-portfolio";
import { formatTime, formatTimeAgo } from "@/lib/utils/date";
import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api-helpers";
import {
    Rocket, Mail, Zap, Briefcase, Plus, Activity, ChevronRight, PenTool, FolderKanban, Palette,
    Eye, Users, StickyNote, Signature
} from "lucide-react";
import { cn } from "@/lib/utils";
import StatCard from "../StatCard";
import ActivityFeed from "../ActivityFeed";
import SystemStatus from "../SystemStatus";
import TerminalConsole from "../TerminalConsole";
import { AdminButton } from "../AdminShared";
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
    const { data: analytics } = useAnalyticsSummary();
    const { data: subscribers } = useAdminSubscribers();
    const { data: articles } = useArticles();
    const { data: guestbook } = useAdminGuestbook();

    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [healthLoading, setHealthLoading] = useState(true);
    const [notes, setNotes] = useState(() => localStorage.getItem("admin_quick_notes") || "");
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        localStorage.setItem("admin_quick_notes", notes);
    }, [notes]);

    const fetchHealth = useCallback(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setHealthLoading(true);
        try {
            const start = performance.now();
            const data = await apiFetch("/api/v1/health", { signal: controller.signal });
            const elapsed = Math.round(performance.now() - start);
            setHealthData(prev => ({ ...prev, ...data, responseTimeMs: elapsed }));
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

                <AdminButton
                    onClick={() => onNavigate?.("projects")}
                    variant="primary"
                    icon={Plus}
                >
                    New_Project
                </AdminButton>
            </div>

            {/* Neumorphic Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                <StatCard
                    label="Active Projects"
                    value={projects?.length ?? 0}
                    icon={Rocket}
                    trend={{ 
                        value: (projects?.length || 0) > 0 ? "Active" : "Empty", 
                        isUp: (projects?.length || 0) > 0,
                        label: "Status"
                    }}
                    delay="100ms"
                />
                <StatCard
                    label="Inbox Requests"
                    value={messages.length}
                    icon={Mail}
                    trend={{ 
                        value: messages.length > 0 ? "LIVE" : "0", 
                        isUp: messages.length > 0,
                        label: "Incoming"
                    }}
                    delay="200ms"
                />
                <StatCard
                    label="Page Views"
                    value={analytics?.totalViews ?? 0}
                    icon={Eye}
                    trend={{ 
                        value: "Last 30d", 
                        isUp: true,
                        label: "Organic"
                    }}
                    delay="300ms"
                />
                <StatCard
                    label="Subscribers"
                    value={subscribers?.length ?? 0}
                    icon={Users}
                    delay="400ms"
                />
                <StatCard
                    label="Published Articles"
                    value={articles?.length ?? 0}
                    icon={PenTool}
                    delay="500ms"
                />
               <StatCard
                    label="Pending Guestbook"
                    value={guestbook?.filter(g => !g.isApproved).length ?? 0}
                    icon={Signature}
                    trend={{
                        value: guestbook?.some(g => !g.isApproved) ? "Pending" : "Clean",
                        isUp: !guestbook?.some(g => !g.isApproved),
                        label: "Moderation"
                    }}
                    delay="600ms"
                />
                <StatCard
                    label="Core Skills"
                    value={skills?.length ?? 0}
                    icon={Zap}
                    delay="700ms"
                />
                <StatCard
                    label="Exp Entries"
                    value={experiences?.length ?? 0}
                    icon={Briefcase}
                    delay="800ms"
                />
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "+ New Project", icon: FolderKanban, tab: "projects" as const, color: "text-blue-500" },
                    { label: "+ New Article", icon: PenTool, tab: "articles" as const, color: "text-emerald-500" },
                    { label: "View Messages", icon: Mail, tab: "messages" as const, color: "text-purple-500", badge: messages.length },
                    { label: "Edit Appearance", icon: Palette, tab: "customization" as const, color: "text-pink-500" }
                ].map((action, idx) => (
                    <button
                        key={action.label}
                        onClick={() => onNavigate?.(action.tab)}
                        className="nm-flat p-4 rounded-2xl flex items-center justify-between group hover:nm-inset transition-all duration-300 border border-[var(--nm-light)]"
                        style={{ animation: `fadeInUp 0.5s ease-out forwards ${0.5 + idx * 0.1}s`, opacity: 0 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn("p-2 rounded-xl bg-[var(--nm-light)] border border-[var(--nm-light)] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all", action.color)}>
                                <action.icon size={18} />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-secondary)] group-hover:text-[var(--admin-text-primary)] transition-colors">
                                    {action.label}
                                </span>
                                {action.badge !== undefined && action.badge > 0 && (
                                    <span className="text-[8px] font-black text-pink-500 tracking-tighter uppercase mt-0.5">
                                        {action.badge} UNREAD_TRACES
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronRight size={14} className="text-[var(--admin-text-muted)] group-hover:translate-x-1 group-hover:text-purple-400 transition-all" />
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Activity Feed Section */}
                <div className="lg:col-span-2">
                    <ActivityFeed activities={activities} onFetchAll={() => onNavigate?.("messages")} />
                </div>

                {/* Heartbeat Monitoring */}
                <div className="lg:col-span-1 space-y-10">
                    <SystemStatus
                        apiHealth={healthLoading ? "loading" : (healthData?.status || "unreachable")}
                        database={healthLoading ? "checking" : (healthData?.database || "unknown")}
                        redis={healthLoading ? "checking" : (healthData?.redis || "unknown")}
                        responseTime={healthData?.responseTimeMs}
                        lastChecked={healthData?.timestamp ? formatTime(healthData.timestamp) : undefined}
                        onRefresh={fetchHealth}
                    />

                    {/* Quick Notes Widget */}
                    <div className="nm-flat p-6 rounded-3xl space-y-4 group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 nm-inset rounded-lg flex items-center justify-center text-amber-500">
                                <StickyNote size={16} />
                            </div>
                            <h4 className="text-xs font-black text-[var(--admin-text-primary)] uppercase tracking-widest italic">Quick_Notes</h4>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Type something here... (Auto-saves to localStorage)"
                            className="w-full h-32 bg-transparent border-none outline-none text-xs font-medium text-[var(--admin-text-secondary)] resize-none custom-scrollbar nm-inset p-4 rounded-xl placeholder:opacity-50"
                        />
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">
                                Persistent_Memory_Active
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive System Console */}
            <div className="animate-in slide-in-from-bottom-6 duration-1000" style={{ animationDelay: '600ms' }}>
                <TerminalConsole onNavigate={onNavigate} />
            </div>
        </div>
    );
}
