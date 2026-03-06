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
        <div className="nm-flat rounded-[2rem] flex flex-col h-full overflow-hidden">
            <div className="p-7 flex items-center justify-between">
                <h2 className="text-xl font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">
                    ACTIVITY_LOG
                </h2>
                <button className="text-[10px] font-black text-[var(--admin-text-secondary)] hover:text-indigo-500 transition-colors uppercase tracking-[0.2em] nm-button px-4 py-2 rounded-full">
                    FETCH_ALL
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-[var(--admin-text-secondary)]">
                        <span className="animate-pulse font-bold tracking-widest text-xs">SYNCHRONIZING...</span>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-widest">
                        EMPTY_BUFFER
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((item, idx) => {
                            const Icon = ICON_MAP[item.type] || Clock;
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-5 p-5 rounded-2xl transition-all duration-300 group hover:nm-inset cursor-default animate-nm-in"
                                    style={{ animationDelay: `${idx * 150}ms` }}
                                >
                                    <div className="w-10 h-10 rounded-xl nm-inset flex items-center justify-center shrink-0 text-[var(--admin-text-secondary)] group-hover:text-indigo-500 transition-colors">
                                        <Icon size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] text-[var(--admin-text-primary)] font-bold leading-relaxed">
                                            {item.content}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[9px] font-black text-indigo-500/60 uppercase tracking-[0.2em]">
                                                {item.timestamp}
                                            </span>
                                            {item.metadata && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-[var(--nm-dark)]" />
                                                    <span className="text-[10px] font-bold text-[var(--admin-text-secondary)] italic truncate">
                                                        {item.metadata}
                                                    </span>
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
