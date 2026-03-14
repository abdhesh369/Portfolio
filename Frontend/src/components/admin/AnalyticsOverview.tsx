import type { ReactNode } from "react";
import { useAnalyticsSummary, useVitalsSummary } from "../../hooks/use-portfolio";
import { VisitorGlobe } from "./VisitorGlobe";
import { formatDate } from "@/lib/utils/date";
import {
    Eye,
    Activity,
    BarChart3,
    Monitor,
    Smartphone,
    Globe,
    FolderKanban,
    Gauge,
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

interface DailyView {
    date: string;
    views: number;
}

interface TopProject {
    targetId: number;
    views: number;
}

interface DeviceBreakdown {
    device: string;
    count: number;
    percentage: number;
}

interface TopCountry {
    country: string;
    visits: number;
}

interface AnalyticsSummary {
    totalViews?: number;
    totalEvents?: number;
    dailyViews?: DailyView[];
    topProjects?: TopProject[];
    deviceBreakdown?: DeviceBreakdown[];
    topCountries?: TopCountry[];
    // Legacy fields
    events?: number;
    [key: string]: unknown;
}

type AnalyticsOverviewProps = Record<string, never>;

const COLORS = {
    cyan: "var(--color-cyan)",
    purple: "var(--color-purple-light)",
    green: "#34d399",
    pink: "#f472b6",
    amber: "#fbbf24",
};

function DeviceIcon({ device }: { device: string }) {
    const d = device.toLowerCase();
    if (d === "mobile" || d === "tablet") return <Smartphone size={14} />;
    return <Monitor size={14} />;
}

export function AnalyticsOverview(_props: AnalyticsOverviewProps) {
    const { data, isLoading, error } = useAnalyticsSummary();
    const summary = data as AnalyticsSummary;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div
                    className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
                    style={{ borderTopColor: COLORS.cyan, borderRightColor: COLORS.purple }}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="p-8 text-center rounded-lg"
                style={{
                    background: "rgba(244,114,182,0.06)",
                    border: "1px solid rgba(244,114,182,0.2)",
                    color: COLORS.pink,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "13px",
                }}
            >
                [ERROR] Failed to load analytics: {(error as Error).message}
            </div>
        );
    }

    const totalViews = summary?.totalViews ?? 0;
    const totalEvents = summary?.totalEvents ?? summary?.events ?? 0;
    const dailyViews = summary?.dailyViews ?? [];
    const topProjects = summary?.topProjects ?? [];
    const deviceBreakdown = summary?.deviceBreakdown ?? [];
    const topCountries = summary?.topCountries ?? [];

    const stats = [
        { label: "Total Page Views", value: totalViews, icon: Eye, color: COLORS.cyan },
        { label: "Total Events", value: totalEvents, icon: Activity, color: COLORS.purple },
    ];

    return (
        <div className="space-y-6 admin-animate-in">
            {/* ─── Visitor Globe ─── */}
            <div className="admin-panel-card p-0 overflow-hidden">
                <VisitorGlobe data={topCountries} />
            </div>

            {/* ─── Stat Cards ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="admin-stat-card" style={{ borderColor: `${s.color}20` }}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] uppercase" style={{ color: "rgba(148,163,184,0.6)", letterSpacing: "0.1em" }}>
                                    {s.label}
                                </span>
                                <Icon size={15} style={{ color: s.color, opacity: 0.7 }} />
                            </div>
                            <div className="text-2xl font-bold text-slate-100 mb-1">
                                {s.value.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 text-[11px]" style={{ color: "rgba(148,163,184,0.4)" }}>
                                <BarChart3 size={11} />
                                <span>From tracked analytics events</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ─── Daily Views Chart ─── */}
            {dailyViews.length > 0 && (
                <div className="admin-panel-card">
                    <h3 className="text-sm font-bold text-slate-100 mb-4" style={{ letterSpacing: "0.03em" }}>
                        Page Views — Last 30 Days
                    </h3>
                    <div style={{ width: "100%", height: 240 }}>
                        <ResponsiveContainer>
                            <AreaChart data={dailyViews} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fill: "rgba(148,163,184,0.5)" }}
                                    tickFormatter={(v: string) => v.slice(5)} /* MM-DD */
                                    stroke="rgba(148,163,184,0.1)"
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "rgba(148,163,184,0.5)" }}
                                    stroke="rgba(148,163,184,0.1)"
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "rgba(15,23,42,0.95)",
                                        border: "1px solid rgba(34,211,238,0.2)",
                                        borderRadius: 8,
                                        fontSize: 12,
                                        color: 'var(--foreground-hex, #e2e8f0)',
                                    }}
                                    labelFormatter={(v: ReactNode) => `Date: ${formatDate(v as string)}`}
                                    formatter={(value: number | undefined) => [value != null ? value.toLocaleString() : '0', "Views"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke={COLORS.cyan}
                                    strokeWidth={2}
                                    fill="url(#viewsGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ─── Breakdowns Grid ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Top Projects */}
                {topProjects.length > 0 && (
                    <div className="admin-panel-card">
                        <div className="flex items-center gap-2 mb-3">
                            <FolderKanban size={14} style={{ color: COLORS.purple }} />
                            <h4 className="text-xs font-bold text-slate-100 uppercase" style={{ letterSpacing: "0.08em" }}>
                                Top Projects
                            </h4>
                        </div>
                        <ul className="space-y-2">
                            {topProjects.map((p, i) => (
                                <li key={p.targetId} className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">
                                        <span className="text-slate-500 mr-1.5">#{i + 1}</span>
                                        Project {p.targetId}
                                    </span>
                                    <span className="font-mono text-slate-200">{p.views.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Device Breakdown */}
                {deviceBreakdown.length > 0 && (
                    <div className="admin-panel-card">
                        <div className="flex items-center gap-2 mb-3">
                            <Monitor size={14} style={{ color: COLORS.green }} />
                            <h4 className="text-xs font-bold text-slate-100 uppercase" style={{ letterSpacing: "0.08em" }}>
                                Devices
                            </h4>
                        </div>
                        <ul className="space-y-2">
                            {deviceBreakdown.map((d) => (
                                <li key={d.device} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5 text-slate-400 capitalize">
                                            <DeviceIcon device={d.device} />
                                            {d.device}
                                        </span>
                                        <span className="font-mono text-slate-200">{d.percentage}%</span>
                                    </div>
                                    <div className="h-1 rounded-full" style={{ background: "rgba(148,163,184,0.1)" }}>
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${d.percentage}%`,
                                                background: COLORS.green,
                                                opacity: 0.7,
                                            }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Top Countries */}
                {topCountries.length > 0 && (
                    <div className="admin-panel-card">
                        <div className="flex items-center gap-2 mb-3">
                            <Globe size={14} style={{ color: COLORS.amber }} />
                            <h4 className="text-xs font-bold text-slate-100 uppercase" style={{ letterSpacing: "0.08em" }}>
                                Top Countries
                            </h4>
                        </div>
                        <ul className="space-y-2">
                            {topCountries.map((c, i) => (
                                <li key={c.country} className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">
                                        <span className="text-slate-500 mr-1.5">#{i + 1}</span>
                                        {c.country}
                                    </span>
                                    <span className="font-mono text-slate-200">{c.visits.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* ─── Core Web Vitals ─── */}
            <VitalsPanel />
        </div>
    );
}

/* ────── Vitals thresholds per metric ────── */
const VITAL_THRESHOLDS: Record<string, { good: number; poor: number; unit: string }> = {
    LCP: { good: 2500, poor: 4000, unit: "ms" },
    CLS: { good: 0.1, poor: 0.25, unit: "" },
    INP: { good: 200, poor: 500, unit: "ms" },
    FCP: { good: 1800, poor: 3000, unit: "ms" },
    TTFB: { good: 800, poor: 1800, unit: "ms" },
};

function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
    const t = VITAL_THRESHOLDS[name];
    if (!t) return "good";
    if (value <= t.good) return "good";
    if (value <= t.poor) return "needs-improvement";
    return "poor";
}

const RATING_COLORS: Record<string, string> = {
    good: "#34d399",
    "needs-improvement": "#fbbf24",
    poor: "#f87171",
};

function VitalsPanel() {
    const { data, isLoading, error } = useVitalsSummary(7);
    const vitals = (data as { vitals?: { name: string; avg: number; p75: number; good: number; needsImprovement: number; poor: number; total: number }[] })?.vitals ?? [];

    if (isLoading) {
        return (
            <div className="admin-panel-card">
                <div className="flex items-center gap-2 mb-3">
                    <Gauge size={14} style={{ color: COLORS.cyan }} />
                    <h3 className="text-sm font-bold text-slate-100" style={{ letterSpacing: "0.03em" }}>
                        Core Web Vitals — Last 7 Days
                    </h3>
                </div>
                <div className="flex items-center justify-center p-8">
                    <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: COLORS.cyan }} />
                </div>
            </div>
        );
    }

    if (error || vitals.length === 0) {
        return (
            <div className="admin-panel-card">
                <div className="flex items-center gap-2 mb-3">
                    <Gauge size={14} style={{ color: COLORS.cyan }} />
                    <h3 className="text-sm font-bold text-slate-100" style={{ letterSpacing: "0.03em" }}>
                        Core Web Vitals — Last 7 Days
                    </h3>
                </div>
                <p className="text-xs text-slate-500 text-center py-4">
                    {error ? `Failed to load vitals: ${(error as Error).message}` : "No vitals data collected yet."}
                </p>
            </div>
        );
    }

    return (
        <div className="admin-panel-card">
            <div className="flex items-center gap-2 mb-4">
                <Gauge size={14} style={{ color: COLORS.cyan }} />
                <h3 className="text-sm font-bold text-slate-100" style={{ letterSpacing: "0.03em" }}>
                    Core Web Vitals — Last 7 Days
                </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {vitals.map((v) => {
                    const rating = getRating(v.name, v.avg);
                    const t = VITAL_THRESHOLDS[v.name];
                    return (
                        <div
                            key={v.name}
                            className="rounded-lg p-3"
                            style={{ background: "rgba(15,23,42,0.4)", border: `1px solid ${RATING_COLORS[rating]}30` }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-200 uppercase">{v.name}</span>
                                <span
                                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase"
                                    style={{ background: `${RATING_COLORS[rating]}20`, color: RATING_COLORS[rating] }}
                                >
                                    {rating === "needs-improvement" ? "Needs Work" : rating}
                                </span>
                            </div>
                            <div className="text-lg font-bold" style={{ color: RATING_COLORS[rating] }}>
                                {v.name === "CLS" ? v.avg.toFixed(3) : `${v.avg}${t?.unit ?? ""}`}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">
                                p75: {v.name === "CLS" ? v.p75.toFixed(3) : `${v.p75}${t?.unit ?? ""}`}
                                {" · "}
                                {v.total} samples
                            </div>
                            {/* Distribution bar */}
                            {v.total > 0 && (
                                <div className="flex h-1.5 rounded-full overflow-hidden mt-2 gap-px">
                                    <div style={{ width: `${(v.good / v.total) * 100}%`, background: RATING_COLORS.good }} />
                                    <div style={{ width: `${(v.needsImprovement / v.total) * 100}%`, background: RATING_COLORS["needs-improvement"] }} />
                                    <div style={{ width: `${(v.poor / v.total) * 100}%`, background: RATING_COLORS.poor }} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
