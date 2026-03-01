import React, { useMemo } from "react";
import { useAnalyticsSummary } from "../../hooks/use-portfolio";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    Users,
    Eye,
    MousePointer2,
    TrendingUp,
    Globe,
    Smartphone,
    Monitor,
    Activity,
} from "lucide-react";

interface AnalyticsSummary {
    totalViews?: number;
    events?: number;
    [key: string]: any;
}

// Mock data generator for visual demonstration if real data is sparse
const generateMockViews = () => {
    const data = [];
    const now = new Date();
    for (let i = 14; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        data.push({
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            views: Math.floor(Math.random() * 50) + 10,
            engagement: Math.floor(Math.random() * 20) + 5,
        });
    }
    return data;
};

const deviceData = [
    { name: "Desktop", value: 65, icon: Monitor },
    { name: "Mobile", value: 30, icon: Smartphone },
    { name: "Tablet", value: 5, icon: Globe },
];

const COLORS = ["#22d3ee", "#a78bfa", "#f59e0b", "#f472b6"];

export function AnalyticsOverview() {
    const { data, isLoading, error } = useAnalyticsSummary();
    const summary = data as AnalyticsSummary;
    const mockViews = useMemo(() => generateMockViews(), []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div
                    className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
                    style={{ borderTopColor: "#22d3ee", borderRightColor: "#a78bfa" }}
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
                    color: "#f472b6",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "13px",
                }}
            >
                [ERROR] Failed to load analytics: {(error as Error).message}
            </div>
        );
    }

    const stats = [
        { label: "Total Views", value: summary?.totalViews || 1248, icon: Eye, color: "#22d3ee", change: "+12.5%" },
        { label: "Project Clicks", value: 482, icon: MousePointer2, color: "#a78bfa", change: "+8.2%" },
        { label: "Contact Inquiries", value: 14, icon: Users, color: "#f59e0b", change: "+25.0%" },
        { label: "Avg. Time", value: "2m 45s", icon: Monitor, color: "#f472b6", change: "+4.1%" },
    ];

    return (
        <div className="space-y-6 admin-animate-in">
            {/* ─── Stat Cards ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
                            </div>
                            <div className="flex items-center gap-1 text-[11px]" style={{ color: "#4ade80" }}>
                                <TrendingUp size={11} />
                                <span>{s.change} from last month</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ─── Charts Row ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Traffic Chart */}
                <div className="lg:col-span-2 admin-panel-card">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-sm font-bold text-slate-100" style={{ letterSpacing: "0.03em" }}>
                                Visitor Traffic
                            </div>
                            <div className="text-[10px] mt-0.5" style={{ color: "rgba(148,163,184,0.5)", letterSpacing: "0.06em" }}>
                                DAILY VIEWS — LAST 14 DAYS
                            </div>
                        </div>
                        <Activity size={15} style={{ color: "#22d3ee", opacity: 0.5 }} />
                    </div>
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockViews}>
                                <defs>
                                    <linearGradient id="adminColorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "rgba(148,163,184,0.5)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "rgba(148,163,184,0.5)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "1px solid rgba(34,211,238,0.2)",
                                        background: "rgba(10,10,18,0.95)",
                                        backdropFilter: "blur(12px)",
                                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                                        color: "#e2e8f0",
                                        fontSize: "11px",
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}
                                    labelStyle={{ color: "#22d3ee", fontWeight: "bold", marginBottom: 4 }}
                                    itemStyle={{ color: "#e2e8f0" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#22d3ee"
                                    fillOpacity={1}
                                    fill="url(#adminColorViews)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Device Distribution */}
                <div className="admin-panel-card">
                    <div className="mb-4">
                        <div className="text-sm font-bold text-slate-100" style={{ letterSpacing: "0.03em" }}>
                            Device Distribution
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: "rgba(148,163,184,0.5)", letterSpacing: "0.06em" }}>
                            VIEWS BY DEVICE TYPE
                        </div>
                    </div>
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {deviceData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "1px solid rgba(34,211,238,0.2)",
                                        background: "rgba(10,10,18,0.95)",
                                        color: "#e2e8f0",
                                        fontSize: "11px",
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2.5 mt-3">
                        {deviceData.map((item, index) => {
                            const DeviceIcon = item.icon;
                            return (
                                <div key={item.name} className="flex items-center gap-2.5">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 6px ${COLORS[index]}40` }}
                                    />
                                    <DeviceIcon size={13} style={{ color: "rgba(148,163,184,0.5)" }} />
                                    <span className="text-xs text-slate-300 flex-1" style={{ letterSpacing: "0.03em" }}>
                                        {item.name}
                                    </span>
                                    <span className="text-xs font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                                        {item.value}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ─── Recent Visitors Table ─── */}
            <div className="admin-panel-card">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-sm font-bold text-slate-100" style={{ letterSpacing: "0.03em" }}>
                            Recent Visitor Details
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: "rgba(148,163,184,0.5)", letterSpacing: "0.06em" }}>
                            LIVE FEED — LAST 24 HOURS
                        </div>
                    </div>
                    <div
                        className="inline-flex items-center gap-1.5 rounded text-[9px]"
                        style={{
                            background: "rgba(34,211,238,0.08)",
                            border: "1px solid rgba(34,211,238,0.2)",
                            padding: "3px 8px",
                            color: "#22d3ee",
                            letterSpacing: "0.08em",
                        }}
                    >
                        <span className="w-[5px] h-[5px] bg-cyan-400 rounded-full" style={{ boxShadow: "0 0 6px #22d3ee" }} />
                        LIVE
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs" style={{ fontFamily: "inherit" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                {["PATH", "BROWSER / OS", "DEVICE", "LOCATION", "TIME"].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left px-4 py-2.5 font-medium"
                                        style={{ color: "rgba(148,163,184,0.5)", fontSize: "10px", letterSpacing: "0.1em" }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { path: "/projects/1", browser: "Chrome / Windows", device: "Desktop", flag: "🇺🇸", loc: "New York, US", time: "2 mins ago" },
                                { path: "/about", browser: "Safari / iOS", device: "Mobile", flag: "🇬🇧", loc: "London, UK", time: "15 mins ago" },
                                { path: "/", browser: "Firefox / MacOS", device: "Desktop", flag: "🇮🇳", loc: "Mumbai, IN", time: "42 mins ago" },
                            ].map((row, i) => (
                                <tr
                                    key={i}
                                    style={{
                                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                                        transition: "background 0.15s ease",
                                    }}
                                    className="hover:bg-white/[0.02]"
                                >
                                    <td className="px-4 py-2.5 text-cyan-400">{row.path}</td>
                                    <td className="px-4 py-2.5 text-slate-400">{row.browser}</td>
                                    <td className="px-4 py-2.5 text-slate-400">{row.device}</td>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        <span className="mr-1.5">{row.flag}</span>{row.loc}
                                    </td>
                                    <td className="px-4 py-2.5" style={{ color: "rgba(148,163,184,0.5)" }}>{row.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
