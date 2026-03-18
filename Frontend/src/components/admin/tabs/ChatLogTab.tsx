import React, { useState } from "react";
import { useAdminChatLogs } from "@/hooks/use-portfolio";
import { MessageSquare, Calendar, ExternalLink, X, User, Bot, Clock, Filter, Search } from "lucide-react";
import { 
    AdminButton, 
    EmptyState, 
    LoadingSkeleton 
} from "@/components/admin/AdminShared";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import type { ChatConversation } from "@portfolio/shared/schema";
import type { AdminTabProps } from "./types";
import { AnimatePresence, motion } from "framer-motion";

export function ChatLogTab(_props: AdminTabProps) {
    const { data: logs, isLoading } = useAdminChatLogs();
    const [selectedLog, setSelectedLog] = useState<ChatConversation | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = logs?.filter(log => 
        log.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

    return (
        <div className="animate-in fade-in duration-700 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 nm-inset rounded-xl flex items-center justify-center text-rose-500">
                            <MessageSquare size={20} strokeWidth={3} />
                        </div>
                        <h1 className="text-4xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic">
                            Chat_Logs
                        </h1>
                    </div>
                    <p className="text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 ml-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_var(--nm-accent)]" />
                        AI_Interactions_Logged: {logs?.length ?? 0}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="SEARCH_CONVERSATIONS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 pl-12 pr-6 nm-inset rounded-2xl text-[10px] font-black tracking-widest focus:outline-none w-64 transition-all focus:w-80"
                        />
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 opacity-50" />
                    </div>
                    <div className="w-14 h-14 nm-flat rounded-2xl flex items-center justify-center text-[var(--admin-text-muted)]">
                        <Filter size={20} />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <LoadingSkeleton className="h-28" />
            ) : !logs?.length ? (
                <EmptyState 
                    icon={MessageSquare} 
                    text="No chatbot interactions have been logged yet." 
                />
            ) : (
                <div className="grid gap-6">
                    {filtered.map((log) => (
                        <div 
                            key={log.id}
                            className="nm-flat rounded-[2rem] p-8 flex items-center justify-between group hover:translate-y-[-4px] transition-all cursor-pointer border border-transparent hover:border-rose-500/30"
                            onClick={() => setSelectedLog(log)}
                        >
                            <div className="flex items-center gap-8">
                                <div className="w-16 h-16 nm-inset rounded-2xl flex items-center justify-center text-rose-500/40 group-hover:text-rose-500 transition-colors">
                                    <MessageSquare size={28} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-[var(--admin-text-primary)] uppercase tracking-tight">
                                            Session_{log.sessionId.slice(0, 8)}
                                        </span>
                                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full nm-inset text-indigo-400 uppercase">
                                            {log.messages.length} MESSAGES
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={12} />
                                            {formatDate(log.createdAt)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={12} />
                                            {new Date(log.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {/* Preview message roles badge */}
                                    <div className="w-8 h-8 rounded-full nm-flat border-2 border-[var(--nm-bg)] flex items-center justify-center text-indigo-400 bg-[var(--nm-bg)]">
                                        <User size={14} />
                                    </div>
                                    <div className="w-8 h-8 rounded-full nm-flat border-2 border-[var(--nm-bg)] flex items-center justify-center text-rose-400 bg-[var(--nm-bg)]">
                                        <Bot size={14} />
                                    </div>
                                </div>
                                <AdminButton 
                                    variant="ghost" 
                                    size="sm" 
                                    icon={ExternalLink}
                                    className="rounded-2xl h-12 w-12"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Log Detail Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="nm-flat w-full max-w-3xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-[var(--nm-light)] flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 nm-inset rounded-2xl flex items-center justify-center text-rose-500">
                                        <MessageSquare size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic leading-none">
                                            Inspection_Log
                                        </h2>
                                        <p className="text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
                                            Session: {selectedLog.sessionId}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedLog(null)}
                                    className="w-12 h-12 nm-flat rounded-2xl flex items-center justify-center text-[var(--admin-text-muted)] hover:text-rose-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Chat History */}
                            <div className="overflow-y-auto p-8 space-y-6 flex-1 bg-black/10">
                                {selectedLog.messages.map((msg, i) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "flex gap-4 max-w-[85%]",
                                            msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl nm-inset shrink-0 flex items-center justify-center",
                                            msg.role === 'user' ? "text-indigo-400" : "text-rose-400"
                                        )}>
                                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={cn(
                                            "p-5 rounded-3xl text-sm leading-relaxed",
                                            msg.role === 'user' 
                                                ? "nm-flat bg-indigo-500/5 text-[var(--admin-text-primary)] rounded-tr-none" 
                                                : "nm-inset bg-black/20 text-[var(--admin-text-primary)] rounded-tl-none font-medium"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-[var(--nm-light)] shrink-0 flex items-center justify-between">
                                <div className="flex items-center gap-6 text-[10px] font-black tracking-widest uppercase text-[var(--admin-text-muted)]">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-rose-500" />
                                        {formatDate(selectedLog.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-rose-500" />
                                        {new Date(selectedLog.createdAt).toLocaleTimeString()}
                                    </div>
                                </div>
                                <AdminButton 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={() => setSelectedLog(null)}
                                    className="px-8"
                                >
                                    Close_Viewer
                                </AdminButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
