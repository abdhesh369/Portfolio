import { Mail, Zap, Rocket, Clock, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
    id: string | number;
    type: "message" | "project" | "skill" | "system";
    content: string;
    timestamp: string;
    metadata?: string;
}

interface ActivityFeedProps {
    activities: ActivityItem[];
    loading?: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
    message: Mail,
    project: Rocket,
    skill: Zap,
    system: Clock,
};

const COLOR_MAP: Record<string, string> = {
    message: "bg-blue-50 text-blue-600 border-blue-100",
    project: "bg-emerald-50 text-emerald-600 border-emerald-100",
    skill: "bg-purple-50 text-purple-600 border-purple-100",
    system: "bg-slate-50 text-slate-600 border-slate-100",
};

export default function ActivityFeed({ activities, loading }: ActivityFeedProps) {
    return (
        <div className="glass-card flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-heading font-bold text-slate-900 text-lg uppercase tracking-tight">Recent Activity</h2>
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">View All</button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-slate-400">
                        <span className="animate-pulse">Loading activities...</span>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-slate-400 text-sm italic">
                        No activity found.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {activities.map((item) => {
                            const Icon = ICON_MAP[item.type] || Clock;
                            return (
                                <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all group">
                                    <div className={cn("p-2 rounded-lg border mt-0.5", COLOR_MAP[item.type])}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                                            {item.content}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.timestamp}</span>
                                            {item.metadata && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className="text-[10px] font-medium text-slate-500 italic truncate">{item.metadata}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
