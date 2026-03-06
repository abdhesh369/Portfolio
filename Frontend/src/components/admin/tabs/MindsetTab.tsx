import React, { useState, type FormEvent } from "react";
import { useMindset, useCreateMindset, useUpdateMindset, useDeleteMindset } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField, FormTextarea, EmptyState, LoadingSkeleton } from "@/components/admin/AdminShared";
import type { Mindset } from "@shared/schema";
import { Loader2, Plus, Pencil, Trash2, Brain, Lightbulb, Zap, Anchor, Target, Compass } from "lucide-react";

const ICON_OPTIONS = [
    { label: "Brain", value: "Brain", icon: Brain },
    { label: "Lightbulb", value: "Lightbulb", icon: Lightbulb },
    { label: "Zap", value: "Zap", icon: Zap },
    { label: "Anchor", value: "Anchor", icon: Anchor },
    { label: "Target", value: "Target", icon: Target },
    { label: "Compass", value: "Compass", icon: Compass },
];

const emptyMindset = {
    title: "",
    description: "",
    icon: "Brain",
    tags: [] as string[],
};

export default function MindsetTab() {
    const { data: mindset, isLoading } = useMindset();
    const createMutation = useCreateMindset();
    const updateMutation = useUpdateMindset();
    const deleteMutation = useDeleteMindset();
    const { toast } = useToast();

    const [editing, setEditing] = useState<(Partial<Mindset> & typeof emptyMindset) | null>(null);
    const [tagInput, setTagInput] = useState("");

    const handleEdit = (item: Mindset) => {
        setEditing({ ...item });
        setTagInput((item.tags || []).join(", "));
    };

    const handleNew = () => {
        setEditing({ ...emptyMindset });
        setTagInput("");
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this mindset entry?")) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast({ title: "Mindset entry deleted" });
        } catch (err: any) {
            toast({ title: "Delete failed", description: err.message, variant: "destructive" });
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        const body = {
            ...editing,
            tags: tagInput.split(",").map(s => s.trim()).filter(Boolean),
        };

        try {
            if (editing.id) {
                await updateMutation.mutateAsync({ id: editing.id, data: body });
                toast({ title: "Mindset entry updated" });
            } else {
                await createMutation.mutateAsync(body);
                toast({ title: "Mindset entry created" });
            }
            setEditing(null);
        } catch (err: any) {
            toast({ title: "Save failed", description: err.message, variant: "destructive" });
        }
    };

    if (isLoading) return <LoadingSkeleton />;

    if (editing) {
        return (
            <div className="animate-fade-in max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(null)} className="h-8 w-8 p-0 rounded-full">
                        <span className="text-xl">←</span>
                    </Button>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        {editing.id ? "Edit Mindset" : "New Mindset"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 glass-card p-6 bg-white/5 border-white/10 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Title *"
                            value={editing.title}
                            onChange={(v) => setEditing({ ...editing, title: v })}
                            required
                        />
                        <div>
                            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">Icon</label>
                            <div className="flex flex-wrap gap-2">
                                {ICON_OPTIONS.map((opt) => {
                                    const IconComp = opt.icon;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setEditing({ ...editing, icon: opt.value })}
                                            className={`p-2 rounded-lg border transition-all ${editing.icon === opt.value
                                                    ? "bg-purple-500/20 border-purple-500 text-purple-400 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                                                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                                                }`}
                                            title={opt.label}
                                        >
                                            <IconComp size={20} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <FormTextarea
                        label="Description *"
                        value={editing.description}
                        onChange={(v) => setEditing({ ...editing, description: v })}
                        required
                    />

                    <FormField
                        label="Tags (comma-separated)"
                        value={tagInput}
                        onChange={setTagInput}
                        placeholder="philosophy, principle, software"
                    />

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-purple-600 hover:bg-purple-500 text-white px-8">
                            {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editing.id ? "Update" : "Create"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setEditing(null)} className="text-white/50 hover:text-white hover:bg-white/5">
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Mindset</h2>
                    <p className="text-white/40 text-sm mt-1">Manage philosophy cards and core principles.</p>
                </div>
                <Button onClick={handleNew} className="bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    <Plus className="w-4 h-4 mr-2" /> New Entry
                </Button>
            </div>

            {!mindset?.length ? (
                <EmptyState icon="🧠" text="No mindset entries found. Click 'New Entry' to add one." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mindset.map((item) => {
                        const IconComp = ICON_OPTIONS.find(opt => opt.value === item.icon)?.icon || Brain;
                        return (
                            <div
                                key={item.id}
                                className="group relative glass-card p-6 bg-white/5 border-white/10 rounded-2xl hover:border-purple-500/50 hover:bg-white/[0.08] transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                        <IconComp size={24} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-white/60 text-sm line-clamp-3 leading-relaxed mb-4">{item.description}</p>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {(item.tags as string[] || []).map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-[10px] uppercase tracking-wider font-semibold border-white/10 text-white/40 bg-white/5">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
