import React, { useState, useEffect, useCallback } from "react";
import { useProjects, useSkills, useExperiences } from "@/hooks/use-portfolio";
import { apiFetch, API_BASE_URL } from "@/lib/api-helpers";
import type { Message } from "@shared/schema";
import {
    Rocket, Mail, Zap, Briefcase, PenTool, FolderKanban,
    Plus, ArrowUpRight, Clock, Database, Server, Shield, Activity,
} from "lucide-react";

interface HealthData {
    status: string;
    database: string;
    environment: string;
    timestamp: string;
    responseTimeMs: number;
}

// Color config
const ACCENTS = {
    cyan: { hex: "#22d3ee", rgb: "34,211,238", glow: "rgba(34,211,238,0.15)" },
    purple: { hex: "#a78bfa", rgb: "167,139,250", glow: "rgba(167,139,250,0.15)" },
    green: { hex: "#34d399", rgb: "52,211,153", glow: "rgba(52,211,153,0.15)" },
    pink: { hex: "#f472b6", rgb: "244,114,182", glow: "rgba(244,114,182,0.15)" },
    amber: { hex: "#fbbf24", rgb: "251,191,36", glow: "rgba(251,191,36,0.15)" },
};

type TabKey = "overview" | "analytics" | "messages" | "templates" | "projects" | "skills" | "experiences" | "services" | "seo" | "articles" | "testimonials";

interface OverviewTabProps {
    token: string | null;
    onNavigate?: (tab: TabKey) => void;
}

export function OverviewTab({ token, onNavigate }: OverviewTabProps) {
    const { data: projects } = useProjects();
    const { data: skills } = useSkills();
    const { data: experiences } = useExperiences();
    const [messages, setMessages] = useState<Message[]>([]);
    const [msgCount, setMsgCount] = useState<number | null>(null);
    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [healthLoading, setHealthLoading] = useState(true);

    useEffect(() => {
        apiFetch("/api/messages", token)
            .then((d: Message[]) => {
                setMessages(d ?? []);
                setMsgCount(d?.length ?? 0);
            })
            .catch(() => {
                setMessages([]);
                setMsgCount(0);
            });
    }, [token]);

    const fetchHealth = useCallback(async () => {
        setHealthLoading(true);
        try {
            const start = performance.now();
            const res = await fetch(`${API_BASE_URL}/health`);
            const elapsed = Math.round(performance.now() - start);
            const data = await res.json();
            setHealthData({ ...data, responseTimeMs: elapsed });
        } catch {
            setHealthData({
                status: "unreachable",
                database: "unknown",
                environment: "unknown",
                timestamp: new Date().toISOString(),
                responseTimeMs: -1,
            });
        } finally {
            setHealthLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealth();
    }, [fetchHealth]);

    const stats = [
        {
            label: "Projects",
            value: projects?.length ?? 0,
            icon: Rocket,
            accent: ACCENTS.cyan,
            delta: `${projects?.length ?? 0} total`,
        },
        {
            label: "Messages",
            value: msgCount ?? 0,
            icon: Mail,
            accent: ACCENTS.purple,
            delta: `${msgCount ?? 0} received`,
        },
        {
            label: "Skills",
            value: skills?.length ?? 0,
            icon: Zap,
            accent: ACCENTS.green,
            delta: "Active stack",
        },
        {
            label: "Experiences",
            value: experiences?.length ?? 0,
            icon: Briefcase,
            accent: ACCENTS.pink,
            delta: `${experiences?.length ?? 0} positions`,
        },
    ];

    const quickActions: { label: string; icon: React.ElementType; accent: typeof ACCENTS.cyan; tab: TabKey }[] = [
        { label: "Add Project", icon: FolderKanban, accent: ACCENTS.cyan, tab: "projects" },
        { label: "New Article", icon: PenTool, accent: ACCENTS.purple, tab: "articles" },
        { label: "View Messages", icon: Mail, accent: ACCENTS.green, tab: "messages" },
        { label: "Add Skill", icon: Zap, accent: ACCENTS.pink, tab: "skills" },
    ];

    // Recent activity from real messages
    const recentActivity = messages.slice(0, 5).map((msg) => ({
        action: `Message from ${msg.name}: "${(msg.message ?? "").slice(0, 40)}${(msg.message ?? "").length > 40 ? "..." : ""}"`,
        time: msg.createdAt ? formatTimeAgo(new Date(msg.createdAt)) : "Recently",
        icon: Mail,
        accent: ACCENTS.purple.hex,
    }));

    // Pad with system entries if less than 5
    if (recentActivity.length < 5) {
        const fillerEntries = [
            { action: `${projects?.length ?? 0} projects in portfolio`, time: "Current", icon: Rocket, accent: ACCENTS.cyan.hex },
            { action: `${skills?.length ?? 0} skills in active stack`, time: "Current", icon: Zap, accent: ACCENTS.green.hex },
            { action: `${experiences?.length ?? 0} experience entries`, time: "Current", icon: Briefcase, accent: ACCENTS.pink.hex },
            { action: "Dashboard loaded successfully", time: "Just now", icon: ArrowUpRight, accent: ACCENTS.amber.hex },
        ];
        for (const entry of fillerEntries) {
            if (recentActivity.length >= 5) break;
            recentActivity.push(entry);
        }
    }

    // Compute content coverage: how many sections have data
    const sections = [
        { name: "Projects", hasData: (projects?.length ?? 0) > 0 },
        { name: "Skills", hasData: (skills?.length ?? 0) > 0 },
        { name: "Experiences", hasData: (experiences?.length ?? 0) > 0 },
        { name: "Messages", hasData: (msgCount ?? 0) > 0 },
    ];
    const filledSections = sections.filter((s) => s.hasData).length;
    const coveragePct = Math.round((filledSections / sections.length) * 100);

    const apiMs = healthData?.responseTimeMs ?? 0;
    const apiBarValue = apiMs > 0 ? Math.max(5, Math.min(100, 100 - apiMs)) : 0;

    const systemBars = [
        {
            label: "API Response Time",
            value: apiBarValue,
            accent: ACCENTS.cyan.hex,
            text: healthLoading ? "pinging..." : apiMs > 0 ? `${apiMs}ms` : "offline",
            icon: Activity,
        },
        {
            label: "Database",
            value: healthData?.database === "connected" ? 100 : 0,
            accent: ACCENTS.green.hex,
            text: healthLoading ? "checking..." : healthData?.database ?? "unknown",
            icon: Database,
        },
        {
            label: "Content Coverage",
            value: coveragePct,
            accent: ACCENTS.purple.hex,
            text: `${filledSections}/${sections.length} sections`,
            icon: Shield,
        },
        {
            label: "Environment",
            value: healthData?.environment ? 100 : 0,
            accent: ACCENTS.amber.hex,
            text: healthLoading ? "checking..." : healthData?.environment ?? "unknown",
            icon: Server,
        },
    ];

    return (
        <div className="admin-animate-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="admin-stat-card"
                            style={{
                                borderTop: `2px solid ${stat.accent.hex}`,
                                boxShadow: `0 4px 24px ${stat.accent.glow}`,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = `0 8px 32px ${stat.accent.glow}`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = `0 4px 24px ${stat.accent.glow}`;
                            }}
                        >
                            {/* Corner glow */}
                            <div
                                className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
                                style={{
                                    background: `radial-gradient(circle at top right, ${stat.accent.glow}, transparent 70%)`,
                                }}
                            />
                            <div className="flex justify-between items-start mb-3">
                                <div
                                    className="text-4xl font-extrabold text-slate-100"
                                    style={{ lineHeight: 1 }}
                                >
                                    {stat.value}
                                </div>
                                <span
                                    className="text-lg rounded-md p-1.5"
                                    style={{
                                        background: `rgba(${stat.accent.rgb},0.12)`,
                                    }}
                                >
                                    <Icon size={18} style={{ color: stat.accent.hex }} />
                                </span>
                            </div>
                            <div
                                className="text-[11px] mb-2"
                                style={{
                                    color: "rgba(148,163,184,0.6)",
                                    letterSpacing: "0.1em",
                                }}
                            >
                                {stat.label.toUpperCase()}
                            </div>
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-[10px]"
                                    style={{ color: stat.accent.hex, opacity: 0.85 }}
                                >
                                    {stat.delta}
                                </span>

                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
                <div
                    className="text-[10px] mb-3"
                    style={{
                        color: "rgba(148,163,184,0.5)",
                        letterSpacing: "0.15em",
                    }}
                >
                    &gt; QUICK_ACTIONS
                </div>
                <div className="flex gap-2.5 flex-wrap">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.label}
                                onClick={() => onNavigate?.(action.tab)}
                                className="admin-quick-action"
                                style={{
                                    border: `1px solid ${action.accent.hex}30`,
                                    color: action.accent.hex,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = `${action.accent.hex}15`;
                                    e.currentTarget.style.borderColor = action.accent.hex;
                                    e.currentTarget.style.boxShadow = `0 0 16px ${action.accent.hex}30`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(10,10,20,0.7)";
                                    e.currentTarget.style.borderColor = `${action.accent.hex}30`;
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <Icon size={14} />
                                {action.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Grid: Activity + System */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Activity */}
                <div className="admin-panel-card">
                    <div
                        className="text-[10px] mb-4"
                        style={{
                            color: "rgba(148,163,184,0.5)",
                            letterSpacing: "0.15em",
                        }}
                    >
                        &gt; RECENT_ACTIVITY
                    </div>
                    {recentActivity.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={i}
                                className="flex items-center gap-3 py-2.5"
                                style={{
                                    borderBottom:
                                        i < recentActivity.length - 1
                                            ? "1px solid rgba(255,255,255,0.04)"
                                            : "none",
                                }}
                            >
                                <div
                                    className="w-[30px] h-[30px] rounded-md flex-shrink-0 flex items-center justify-center"
                                    style={{
                                        background: `${item.accent}15`,
                                        border: `1px solid ${item.accent}30`,
                                    }}
                                >
                                    <Icon size={13} style={{ color: item.accent }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div
                                        className="text-xs text-slate-300 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis"
                                    >
                                        {item.action}
                                    </div>
                                    <div
                                        className="text-[10px] flex items-center gap-1"
                                        style={{
                                            color: "rgba(148,163,184,0.4)",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        <Clock size={9} />
                                        {item.time}
                                    </div>
                                </div>
                                <div
                                    className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                                    style={{
                                        background: item.accent,
                                        boxShadow: `0 0 6px ${item.accent}`,
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* System Status */}
                <div className="admin-panel-card">
                    <div
                        className="text-[10px] mb-4"
                        style={{
                            color: "rgba(148,163,184,0.5)",
                            letterSpacing: "0.15em",
                        }}
                    >
                        &gt; SYSTEM_STATUS
                    </div>

                    {systemBars.map((bar) => {
                        const BarIcon = bar.icon;
                        return (
                            <div key={bar.label} className="mb-4">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span
                                        className="text-[11px] flex items-center gap-1.5"
                                        style={{
                                            color: "rgba(148,163,184,0.6)",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        <BarIcon size={11} style={{ color: bar.accent, opacity: 0.7 }} />
                                        {bar.label}
                                    </span>
                                    <span className="text-[11px] font-mono" style={{ color: bar.accent }}>
                                        {bar.text}
                                    </span>
                                </div>
                                <div className="admin-progress-bar">
                                    <div
                                        className="admin-progress-fill"
                                        style={{
                                            width: `${bar.value}%`,
                                            background: `linear-gradient(90deg, ${bar.accent}80, ${bar.accent})`,
                                            boxShadow: `0 0 8px ${bar.accent}60`,
                                            transition: "width 0.6s ease",
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    {/* Terminal-style footer */}
                    <div className="admin-terminal">
                        <div className="text-cyan-400 mb-1">&gt; system.check()</div>
                        <div className={healthData?.status === "healthy" ? "text-emerald-400" : "text-red-400"}>
                            {healthLoading
                                ? "⏳ Checking..."
                                : healthData?.status === "healthy"
                                    ? "✓ All systems operational"
                                    : healthData?.status === "unreachable"
                                        ? "✗ API unreachable"
                                        : "⚠ System degraded"}
                        </div>
                        <div
                            className="mt-1"
                            style={{ color: "rgba(148,163,184,0.4)" }}
                        >
                            {healthData?.timestamp
                                ? `Last checked: ${new Date(healthData.timestamp).toLocaleTimeString()}`
                                : "Last checked: --"}
                        </div>
                    </div>
                </div>
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
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
}
