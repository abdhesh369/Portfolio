import { Mail, Zap, Rocket, Clock, LucideIcon, ChevronRight } from "lucide-react";

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
    onFetchAll?: () => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
    message: Mail,
    project: Rocket,
    skill: Zap,
    system: Clock,
};

export default function ActivityFeed({ activities, loading, onFetchAll }: ActivityFeedProps) {
    return (
        <div className="nm-flat flex flex-col h-full overflow-hidden">
            <div className="p-8 flex items-center justify-between border-b border-black/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 nm-inset flex items-center justify-center text-indigo-500 rounded-xl">
                        <Activity size={20} />
                    </div>
                    <h2 className="text-xl font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">
                        Activity_Stream
                    </h2>
                </div>
                <button
                    onClick={onFetchAll}
                    className="nm-button px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500"
                >
                    View_Archive
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                            <span className="font-bold tracking-[0.3em] text-[10px] text-[var(--admin-text-muted)] animate-pulse uppercase">Syncing_Buffer...</span>
                        </div>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-[var(--admin-text-muted)] text-[10px] font-black uppercase tracking-[0.3em]">
                        Empty_Buffer_Zero_State
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((item, idx) => {
                            const Icon = ICON_MAP[item.type] || Clock;
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-6 p-4 rounded-2xl transition-all duration-500 group cursor-pointer hover:bg-black/5"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <div className="icon-container-inset shrink-0 group-hover:scale-110 transition-transform">
                                        <Icon size={18} strokeWidth={2.5} className="group-hover:text-indigo-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[13px] text-[var(--admin-text-primary)] font-bold leading-none tracking-tight">
                                                {item.content}
                                            </p>
                                            <span className="text-[9px] font-black text-indigo-500/60 uppercase tracking-[0.2em]">
                                                {item.timestamp}
                                            </span>
                                        </div>
                                        {item.metadata && (
                                            <p className="text-[11px] font-medium text-[var(--admin-text-secondary)] mt-2 italic truncate opacity-70 group-hover:opacity-100 transition-opacity">
                                                {item.metadata}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-8 h-8 nm-inset rounded-lg flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transform translate-x-0 md:translate-x-4 md:group-hover:translate-x-0 transition-all duration-500 text-indigo-500">
                                        <ChevronRight size={14} />
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

import { Activity } from "lucide-react";
