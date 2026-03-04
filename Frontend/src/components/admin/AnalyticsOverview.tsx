import { useAnalyticsSummary } from "../../hooks/use-portfolio";
import {
    Eye,
    Activity,
    BarChart3,
    Monitor,
    Smartphone,
    Globe,
    FolderKanban,
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
    [key: string]: any;
}

interface AnalyticsOverviewProps {
    // Token no longer needed — credentials are sent via cookies
}

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
                                    labelFormatter={(v: string) => `Date: ${v}`}
                                    formatter={(value: number) => [value.toLocaleString(), "Views"]}
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
        </div>
    );
}
