import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, apiFetch } from "@/lib/api-helpers";
import { useToast } from "@/hooks/use-toast";
import {
    BookOpen, Plus, Trash2, ExternalLink,
    Save, X, Link as LinkIcon, FileText, Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FormField, FormTextarea, EmptyState, AdminButton, LoadingSkeleton, FormSelect } from "@/components/admin/AdminShared";
import { AdminTabProps } from "./types";

interface ReadingItem {
    id: number;
    title: string;
    url: string;
    note: string | null;
    type: 'article' | 'video' | 'book';
    createdAt: string;
}

const empty = {
    title: "",
    url: "",
    note: "",
    type: "article" as const,
};

export function ReadingListTab(_props: AdminTabProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState<(typeof empty & { id?: number }) | null>(null);

    const { data: items, isLoading } = useQuery<ReadingItem[]>({
        queryKey: ["admin-reading-list"],
        queryFn: async () => {
            const res = await apiFetch("/api/v1/reading-list");
            return res.json();
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof empty) => {
            await apiFetch("/api/v1/reading-list", {
                method: "POST",
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-reading-list"] });
            queryClient.invalidateQueries({ queryKey: ["reading-list"] });
            setEditing(null);
            toast({ title: "Resource added" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiFetch(`/api/v1/reading-list/${id}`, { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-reading-list"] });
            queryClient.invalidateQueries({ queryKey: ["reading-list"] });
            toast({ title: "Resource removed" });
        },
    });

    if (isLoading) return <LoadingSkeleton />;

    if (editing) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic">
                        New_Resource
                    </h2>
                    <AdminButton onClick={() => setEditing(null)} variant="secondary" icon={X} size="sm" />
                </div>

                <div className="space-y-8">
                    <div className="nm-flat p-8 rounded-3xl space-y-6">
                        <FormField
                            label="Title"
                            value={editing.title}
                            onChange={(v) => setEditing(d => d ? { ...d, title: v } : null)}
                            placeholder="Resource Heading"
                        />
                        <FormField
                            label="URL"
                            value={editing.url}
                            onChange={(v) => setEditing(d => d ? { ...d, url: v } : null)}
                            placeholder="https://..."
                        />
                        <FormSelect
                            label="Type"
                            value={editing.type}
                            onChange={(v) => setEditing(d => d ? { ...d, type: v as any } : null)}
                            options={[
                                { label: "ARTICLE", value: "article" },
                                { label: "VIDEO", value: "video" },
                                { label: "BOOK", value: "book" }
                            ]}
                        />
                        <FormTextarea
                            label="Note (Optional)"
                            value={editing.note}
                            onChange={(v) => setEditing(d => d ? { ...d, note: v } : null)}
                            placeholder="Key takeaways..."
                        />
                    </div>

                    <AdminButton
                        onClick={() => createMutation.mutate(editing)}
                        disabled={createMutation.isPending || !editing.title || !editing.url}
                        variant="primary"
                        icon={Save}
                        className="w-full h-14"
                    >
                        {createMutation.isPending ? "COMMIT..." : "SAVE_RESOURCE"}
                    </AdminButton>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-[var(--admin-text-primary)] uppercase italic tracking-tighter">
                        Reading_List
                    </h1>
                    <p className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-[0.3em] mt-1 ml-1">
                        Repository_Count: {items?.length ?? 0}
                    </p>
                </div>
                <AdminButton onClick={() => setEditing(empty)} variant="primary" icon={Plus} className="h-12 px-6">
                    Add_New
                </AdminButton>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {items?.map((item) => (
                    <div key={item.id} className="nm-flat p-5 rounded-2xl flex items-center justify-between gap-4 group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 nm-inset rounded-xl flex items-center justify-center text-primary/60">
                                {item.type === 'video' ? <Video size={20} /> : item.type === 'book' ? <BookOpen size={20} /> : <FileText size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-[var(--admin-text-primary)]">{item.title}</h4>
                                <p className="text-[10px] text-[var(--admin-text-muted)] truncate max-w-md">{item.url}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 nm-button rounded-lg text-primary">
                                <ExternalLink size={14} />
                            </a>
                            <AdminButton onClick={() => deleteMutation.mutate(item.id)} variant="secondary" icon={Trash2} size="sm" className="nm-button text-rose-500" />
                        </div>
                    </div>
                ))}
            </div>

            {(!items || items.length === 0) && (
                <EmptyState icon={BookOpen} text="No learning resources tracked. Start building your repository." />
            )}
        </div>
    );
}
