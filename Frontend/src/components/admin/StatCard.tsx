import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string | number;
        isUp?: boolean;
        label?: string;
    };
    color?: "blue" | "green" | "purple" | "orange";
}

export default function StatCard({ label, value, icon: Icon, trend, color = "blue" }: StatCardProps) {
    const colorMap = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        green: "text-emerald-600 bg-emerald-50 border-emerald-100",
        purple: "text-purple-600 bg-purple-50 border-purple-100",
        orange: "text-orange-600 bg-orange-50 border-orange-100",
    };

    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className={cn("p-2.5 rounded-xl border", colorMap[color])}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                        trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                        <span>{trend.isUp ? "↑" : "↓"}</span>
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
                <h3 className="text-3xl font-bold font-heading mt-1 text-slate-900">{value}</h3>
                {trend?.label && (
                    <p className="text-xs text-slate-400 mt-1 capitalize">{trend.label}</p>
                )}
            </div>
        </div>
    );
}
