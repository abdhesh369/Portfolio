import React from "react";
import { useAnalyticsSummary } from "../../hooks/use-portfolio";
import {
    Eye,
    Activity,
    BarChart3,
    Info,
} from "lucide-react";

interface AnalyticsSummary {
    totalViews?: number;
    events?: number;
    [key: string]: any;
}

interface AnalyticsOverviewProps {
    // Token no longer needed — credentials are sent via cookies
}

export function AnalyticsOverview(_props: AnalyticsOverviewProps) {
    const { data, isLoading, error } = useAnalyticsSummary();
    const summary = data as AnalyticsSummary;


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

    const totalViews = summary?.totalViews ?? 0;
    const totalEvents = summary?.events ?? 0;

    const stats = [
        { label: "Total Page Views", value: totalViews, icon: Eye, color: "#22d3ee" },
        { label: "Total Events", value: totalEvents, icon: Activity, color: "#a78bfa" },
    ];

    return (
        <div className="space-y-6 admin-animate-in">
            {/* ─── Real Stat Cards ─── */}
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

            {/* ─── Info Panel ─── */}
            <div className="admin-panel-card">
                <div className="flex items-start gap-3">
                    <Info size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <div className="text-sm font-bold text-slate-100 mb-1" style={{ letterSpacing: "0.03em" }}>
                            Analytics Data
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Showing real data from your analytics tracking system. Page views and events are recorded
                            when visitors interact with your portfolio. For detailed visitor insights, device breakdown,
                            and traffic sources, consider integrating a service like Google Analytics or Plausible.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
