import React, { useState } from "react";
import { useAdminGuestbook, useApproveGuestbook, useDeleteGuestbook } from "@/hooks/portfolio/use-guestbook";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingSkeleton } from "@/components/admin/AdminShared";
import { CheckCircle2, Trash2, Clock } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

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
        queryClient.invalidateQueries({ queryKey: ["guestbook", "admin"] });
    };

    const handleDeleteConfirm = async (id: number) => {
        await deleteMutation.mutateAsync(id);
        queryClient.invalidateQueries({ queryKey: ["guestbook", "admin"] });
        setIsDeletingId(null);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white shrink-0" style={{ fontFamily: "var(--font-display)" }}>
                    Guestbook <Badge variant="secondary" className="ml-2">{entries.length}</Badge>
                </h2>
                <div className="flex flex-1 max-w-md gap-3">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">🔍</span>
                        <input
                            type="text"
                            placeholder="Search name, email, or content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-purple-500 outline-none transition-all"
                        />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["guestbook", "admin"] })} className="text-white/60">Refresh</Button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon="📝" text={searchQuery ? "No matches found" : "No entries yet"} />
            ) : (
                <div className="space-y-3">
                    {filtered.map((entry) => (
                        <div key={entry.id} className="rounded-xl border border-white/10 p-4 flex flex-col md:flex-row md:items-start gap-4 group hover:border-white/20 transition-colors"
                            style={{ background: "hsl(222 47% 11% / 0.5)" }}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-white text-sm">{entry.name}</span>
                                    {entry.email && <span className="text-xs text-white/40">{entry.email}</span>}
                                    {entry.isApproved ? (
                                        <Badge variant="outline" className="text-[10px] h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1 px-1.5 font-medium">
                                            <CheckCircle2 size={10} /> Approved
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px] h-4 bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1 px-1.5 font-medium">
                                            <Clock size={10} /> Pending
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-white/70 break-words">{entry.content}</p>
                                <p className="text-xs text-white/30 mt-2">{new Date(entry.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 shrink-0 self-center md:self-start">
                                {!entry.isApproved && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleApprove(entry.id)}
                                        disabled={approveMutation.isPending}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white h-8"
                                    >
                                        Approve
                                    </Button>
                                )}
                                {isDeletingId === entry.id ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-white/70">Are you sure?</span>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteConfirm(entry.id)}
                                            disabled={deleteMutation.isPending}
                                            className="h-8"
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsDeletingId(null)}
                                            className="h-8 text-white/60"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setIsDeletingId(entry.id)}
                                        disabled={deleteMutation.isPending}
                                        className="opacity-60 group-hover:opacity-100 transition-opacity h-8"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
