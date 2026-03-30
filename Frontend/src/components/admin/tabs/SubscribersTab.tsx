import React, { useState } from "react";
import { useAdminSubscribers } from "#src/hooks/use-portfolio";
import { useToast } from "#src/hooks/use-toast";
import { apiFetch } from "#src/lib/api-helpers";
import { 
    Users, Mail, Download, Send, Search, Trash2, 
    X, CheckCircle2, AlertTriangle, FileText
} from "lucide-react";
import { 
    AdminButton, 
    EmptyState, 
    LoadingSkeleton, 
    FormField
} from "#src/components/admin/AdminShared";
import { RichTextEditor } from "#src/components/admin/LazyRichTextEditor";
import { formatDate } from "#src/lib/utils/date";
import { cn } from "#src/lib/utils";
import type { AdminTabProps } from "./types";
import { AnimatePresence, motion } from "framer-motion";

export function SubscribersTab(_props: AdminTabProps) {
    const { data: subscribers, isLoading, refetch } = useAdminSubscribers();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [broadcastData, setBroadcastData] = useState({ subject: "", body: "" });
    const [isSending, setIsSending] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const filtered = subscribers?.filter(s => 
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const activeCount = subscribers?.filter(s => s.status === 'active').length || 0;

    const exportCSV = () => {
        if (!subscribers?.length) return;
        
        const headers = ["ID", "Email", "Status", "Source", "Created At"];
        const rows = subscribers.map(s => [
            s.id,
            s.email,
            s.status,
            s.source || "Unknown",
            s.createdAt
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBroadcast = async () => {
        if (!broadcastData.subject || !broadcastData.body) {
            toast({ 
                title: "Incomplete Data", 
                description: "Both subject and body are required.", 
                variant: "destructive" 
            });
            return;
        }

        setIsSending(true);
        try {
            const res = await apiFetch("/api/v1/admin/subscribers/broadcast", {
                method: "POST",
                body: JSON.stringify(broadcastData)
            });
            
            toast({ 
                title: "Broadcast Initiated", 
                description: res.message || "All active subscribers have been queued." 
            });
            setIsBroadcasting(false);
            setBroadcastData({ subject: "", body: "" });
        } catch (_err) {
            toast({ 
                title: "Broadcast Failed", 
                description: _err instanceof Error ? _err.message : "Internal error", 
                variant: "destructive" 
            });
        } finally {
            setIsSending(false);
        }
    };

    const deleteSubscriber = async (id: number) => {
        if (!confirm("Terminate this subscriber record? This cannot be undone.")) return;
        
        try {
            await apiFetch(`/api/v1/subscribers/${id}`, { method: "DELETE" });
            toast({ title: "Subscriber terminated" });
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            refetch();
        } catch (_err) {
            toast({ 
                title: "Action failed", 
                description: _err instanceof Error ? _err.message : "Internal error", 
                variant: "destructive" 
            });
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(s => s.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to terminate ${selectedIds.size} subscribers?`)) return;
        
        try {
            for (const id of selectedIds) {
                await apiFetch(`/api/v1/subscribers/${id}`, { method: "DELETE" });
            }
            toast({ title: "Bulk termination complete", description: `${selectedIds.size} records removed.` });
            setSelectedIds(new Set());
            refetch();
        } catch (_err) {
            toast({ title: "Bulk action partially failed", variant: "destructive" });
        }
    };

    const handleBulkUnsubscribe = async () => {
        try {
            for (const id of selectedIds) {
                await apiFetch(`/api/v1/subscribers/${id}/unsubscribe`, { method: "POST" });
            }
            toast({ title: "Bulk unsubscribe complete" });
            setSelectedIds(new Set());
            refetch();
        } catch (_err) {
            toast({ title: "Bulk action partially failed", variant: "destructive" });
        }
    };

    return (
        <div className="animate-in fade-in duration-700 space-y-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 nm-inset rounded-xl flex items-center justify-center text-purple-500">
                            <Users size={20} strokeWidth={3} />
                        </div>
                        <h1 className="text-4xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic">
                            Subscribers
                        </h1>
                    </div>
                    <p className="text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 ml-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_var(--nm-accent)]" />
                        Active_Reach: {activeCount} / Total: {subscribers?.length ?? 0}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="FIND_SUBSCRIBER..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 pl-12 pr-6 nm-inset rounded-2xl text-[10px] font-black tracking-widest focus:outline-none w-64 transition-all focus:w-80"
                        />
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 opacity-50" />
                    </div>
                    <AdminButton
                        onClick={exportCSV}
                        variant="secondary"
                        icon={Download}
                        disabled={!subscribers?.length}
                        className="h-14 px-6"
                    >
                        Export_CSV
                    </AdminButton>
                    <AdminButton
                        onClick={() => setIsBroadcasting(true)}
                        variant="primary"
                        icon={Send}
                        className="h-14 px-10"
                    >
                        Broadcast
                    </AdminButton>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <LoadingSkeleton className="h-24" />
            ) : !subscribers?.length ? (
                <EmptyState 
                    icon={Users} 
                    text="No subscribers found in database." 
                />
            ) : (
                <div className="grid gap-6">
                    <div className="nm-flat rounded-3xl overflow-hidden border border-[var(--nm-light)]">
                        <table className="w-full text-left">
                            <thead className="bg-black/20 text-[10px] font-black uppercase tracking-[.2em] text-[var(--admin-text-muted)]">
                                <tr>
                                    <th className="px-8 py-6 w-10">
                                        <button 
                                            onClick={toggleSelectAll}
                                            className={cn(
                                                "w-5 h-5 nm-inset rounded-md flex items-center justify-center transition-all",
                                                selectedIds.size === filtered.length && filtered.length > 0 ? "text-purple-500" : "text-transparent"
                                            )}
                                        >
                                            <CheckCircle2 size={12} />
                                        </button>
                                    </th>
                                    <th className="px-8 py-6">Subscriber</th>
                                    <th className="px-8 py-6">Status</th>
                                    <th className="px-8 py-6">Source</th>
                                    <th className="px-8 py-6">Engagement_Date</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--nm-light)]">
                                {filtered.map((s) => (
                                    <tr key={s.id} className={cn(
                                        "group hover:bg-white/[0.02] transition-colors",
                                        selectedIds.has(s.id) && "bg-purple-500/5"
                                    )}>
                                        <td className="px-8 py-6">
                                            <button 
                                                onClick={() => toggleSelection(s.id)}
                                                className={cn(
                                                    "w-5 h-5 nm-inset rounded-md flex items-center justify-center transition-all",
                                                    selectedIds.has(s.id) ? "text-purple-500" : "text-transparent hover:text-purple-500/30"
                                                )}
                                            >
                                                <CheckCircle2 size={12} />
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 nm-inset rounded-xl flex items-center justify-center text-slate-500">
                                                    <Mail size={16} />
                                                </div>
                                                <span className="text-sm font-bold text-[var(--admin-text-primary)]">
                                                    {s.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "text-[10px] font-black px-3 py-1 rounded-full nm-inset flex items-center gap-2 w-fit",
                                                s.status === 'active' ? "text-emerald-500" : "text-slate-400"
                                            )}>
                                                {s.status === 'active' ? <CheckCircle2 size={12} /> : <X size={12} />}
                                                {s.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                                                {s.source || "DIRECT_PORTAL"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-bold text-[var(--admin-text-muted)]">
                                                {formatDate(s.createdAt)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <AdminButton 
                                                variant="danger" 
                                                size="sm" 
                                                icon={Trash2} 
                                                onClick={() => deleteSubscriber(s.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Bulk Actions Toolbar */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[90] nm-flat px-8 py-4 rounded-2xl border border-purple-500/30 flex items-center gap-8 shadow-2xl"
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Selected_Targets</span>
                            <span className="text-sm font-bold text-slate-200">{selectedIds.size} Subscribers</span>
                        </div>
                        <div className="h-8 w-px bg-[var(--nm-light)]" />
                        <div className="flex items-center gap-4">
                            <AdminButton 
                                variant="secondary" 
                                size="sm" 
                                icon={X} 
                                onClick={handleBulkUnsubscribe}
                                className="text-amber-500 h-10 px-4"
                            >
                                Unsubscribe
                            </AdminButton>
                            <AdminButton 
                                variant="danger" 
                                size="sm" 
                                icon={Trash2} 
                                onClick={handleBulkDelete}
                                className="h-10 px-4"
                            >
                                Terminate_All
                            </AdminButton>
                            <AdminButton 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSelectedIds(new Set())}
                                className="h-10 px-4"
                            >
                                Deselect
                            </AdminButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Broadcast Modal */}
            <AnimatePresence>
                {isBroadcasting && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="nm-flat w-full max-w-4xl rounded-[2.5rem] overflow-hidden"
                        >
                            <div className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 nm-inset rounded-2xl flex items-center justify-center text-purple-500">
                                            <Send size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic">
                                                Newsletter_Broadcast
                                            </h2>
                                            <p className="text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.3em] ml-1">
                                                Target: {activeCount} Active_Subscribers
                                            </p>
                                        </div>
                                    </div>
                                    <AdminButton 
                                        variant="ghost" 
                                        onClick={() => setIsBroadcasting(false)}
                                        icon={X}
                                        className="w-12 h-12 rounded-2xl p-0"
                                    />
                                </div>

                                <div className="space-y-8">
                                    <FormField 
                                        label="Transmission_Subject *"
                                        placeholder="E.G. NEW PROJECT CASE STUDY: NEUMORPHISM 2024"
                                        value={broadcastData.subject}
                                        onChange={(v) => setBroadcastData(prev => ({ ...prev, subject: v }))}
                                        icon={FileText}
                                    />
                                    
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em] ml-1">
                                            Payload_Body (HTML Supported)
                                        </label>
                                        <div className="nm-inset rounded-[2rem] p-4 min-h-[300px]">
                                            <RichTextEditor 
                                                value={broadcastData.body}
                                                onChange={(v) => setBroadcastData(prev => ({ ...prev, body: v }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-[var(--nm-light)]">
                                    <div className="flex items-center gap-3 text-amber-500">
                                        <AlertTriangle size={18} />
                                        <span className="text-[10px] font-black tracking-widest uppercase">
                                            IRREVERSIBLE ACTION: PROCEED WITH CAUTION
                                        </span>
                                    </div>
                                    <div className="flex gap-4">
                                        <AdminButton 
                                            variant="secondary" 
                                            onClick={() => setIsBroadcasting(false)}
                                            className="px-8"
                                        >
                                            Abort_Mission
                                        </AdminButton>
                                        <AdminButton 
                                            variant="primary" 
                                            onClick={handleBroadcast}
                                            isLoading={isSending}
                                            loadingText="BROADCASTING..."
                                            icon={Send}
                                            className="px-12 h-16"
                                        >
                                            Execute_Broadcast
                                        </AdminButton>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
