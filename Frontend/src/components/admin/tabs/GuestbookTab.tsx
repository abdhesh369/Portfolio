import React, { useState } from "react";
import { useAdminGuestbook, useApproveGuestbook, useDeleteGuestbook } from "@/hooks/use-portfolio";

import { EmptyState, LoadingSkeleton, AdminButton } from "@/components/admin/AdminShared";
import {
    Trash2, Clock, MessageSquare,
    Search, RefreshCw, User, Mail, Calendar,
    ShieldCheck, X, Check
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { formatDate } from "@/lib/utils/date";
import { QUERY_KEYS } from "@/lib/query-keys";

export function GuestbookTab() {
    const { data: entriesData, isLoading } = useAdminGuestbook();
    const approveMutation = useApproveGuestbook();
    const deleteMutation = useDeleteGuestbook();
    const entries = entriesData ?? [];
    const [searchQuery, setSearchQuery] = useState("");
    const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

    if (isLoading) return <LoadingSkeleton />;

    const sortedEntries = [...entries].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const filtered = sortedEntries.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleApprove = async (id: number) => {
        await approveMutation.mutateAsync(id);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guestbook.admin });
    };

    const handleDeleteConfirm = async (id: number) => {
        await deleteMutation.mutateAsync(id);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guestbook.admin });
        setIsDeletingId(null);
    };

    return (
        <div className="animate-in fade-in duration-700 space-y-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 nm-inset rounded-xl flex items-center justify-center text-indigo-500">
                            <MessageSquare size={20} strokeWidth={3} />
                        </div>
                        <h1 className="text-4xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic">
                            Guestbook
                        </h1>
                    </div>
                    <p className="text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 ml-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_var(--nm-accent)]" />
                        COMM_LOGS: {entries.length} RECORDS
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="FILTER_RECORDS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 pl-12 pr-6 nm-inset rounded-2xl text-[10px] font-black tracking-widest focus:outline-none w-64 transition-all focus:w-80"
                        />
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 opacity-50" />
                    </div>
                    <AdminButton
                        onClick={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guestbook.admin })}
                        variant="secondary"
                        icon={RefreshCw}
                        className="w-14 h-14 rounded-2xl nm-button flex items-center justify-center text-[var(--admin-text-secondary)]"
                    >
                    </AdminButton>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="nm-flat p-24 text-center">
                    <EmptyState
                        icon={MessageSquare}
                        text={searchQuery ? "No matching communication records" : "No guestbook transmissions received"}
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((entry) => (
                            <motion.div
                                key={entry.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="nm-flat p-6 flex flex-col md:flex-row md:items-start gap-8 group relative overflow-hidden"
                            >
                                <div className="hidden md:flex flex-col items-center gap-4 shrink-0">
                                    <div className="w-14 h-14 nm-inset rounded-2xl flex items-center justify-center text-indigo-500/50">
                                        <User size={24} />
                                    </div>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        entry.isApproved ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
                                    )} />
                                </div>

                                <div className="flex-1 min-w-0 space-y-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h4 className="text-sm font-black text-[var(--admin-text-primary)] uppercase tracking-tight">
                                            {entry.name}
                                        </h4>
                                        {entry.email && (
                                            <span className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                                                <Mail size={12} className="text-indigo-400" />
                                                {entry.email}
                                            </span>
                                        )}
                                        <div className="md:hidden ml-auto">
                                            <span className={cn(
                                                "text-[8px] font-black px-2 py-0.5 rounded-full nm-inset",
                                                entry.isApproved ? "text-emerald-500" : "text-amber-500"
                                            )}>
                                                {entry.isApproved ? "APPROVED" : "PENDING"}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-[var(--admin-text-secondary)] font-medium leading-relaxed bg-[var(--nm-bg)]/50 p-4 rounded-xl nm-inset italic">
                                        "{entry.content}"
                                    </p>

                                    {entry.reactions && Object.keys(entry.reactions).length > 0 && (
                                        <div className="flex flex-wrap gap-3">
                                            {Object.entries(entry.reactions || {}).map(([emoji, count]) => (
                                                <div key={emoji} className="nm-inset px-3 py-1 rounded-full flex items-center gap-2">
                                                    <span className="text-xs">{emoji}</span>
                                                    <span className="text-[10px] font-black text-indigo-500">{count as React.ReactNode}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={12} />
                                            {formatDate(entry.createdAt)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={12} />
                                            {formatDate(entry.createdAt, { hour: '2-digit', minute: '2-digit', includeTime: true })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4 shrink-0 md:pt-1">
                                    {!entry.isApproved && (
                                        <AdminButton
                                            onClick={() => handleApprove(entry.id)}
                                            isLoading={approveMutation.isPending}
                                            variant="secondary"
                                            icon={Check}
                                            className="w-12 h-12 nm-button rounded-2xl text-emerald-500 flex items-center justify-center hover:scale-110 transition-transform"
                                            title="Authorize Transmission"
                                        >
                                        </AdminButton>
                                    )}

                                    {isDeletingId === entry.id ? (
                                        <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                                            <AdminButton
                                                onClick={() => handleDeleteConfirm(entry.id)}
                                                isLoading={deleteMutation.isPending}
                                                variant="secondary"
                                                className="h-12 px-4 nm-button bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                CONFIRM
                                            </AdminButton>
                                            <AdminButton
                                                onClick={() => setIsDeletingId(null)}
                                                variant="secondary"
                                                icon={X}
                                                className="w-12 h-12 nm-button text-[var(--admin-text-muted)] flex items-center justify-center"
                                            >
                                            </AdminButton>
                                        </div>
                                    ) : (
                                        <AdminButton
                                            onClick={() => setIsDeletingId(entry.id)}
                                            variant="secondary"
                                            icon={Trash2}
                                            className="w-12 h-12 nm-button rounded-2xl text-rose-500/70 flex items-center justify-center hover:scale-110 hover:text-rose-500 transition-all"
                                            title="Purge Record"
                                        >
                                        </AdminButton>
                                    )}
                                </div>

                                {/* Decorative Background Icon */}
                                <div className="absolute -right-4 -bottom-4 opacity-[0.02] text-indigo-500 pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                                    <ShieldCheck size={120} strokeWidth={1} />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
