import React, { useState, type FormEvent } from "react";
import { useMindset } from "#src/hooks/use-portfolio";
import { useAdminMindset } from "#src/hooks/admin/use-admin-mindset";
import { FormField, FormTextarea, EmptyState, LoadingSkeleton, AdminButton } from "#src/components/admin/AdminShared";
import type { Mindset } from "#shared/schema";
import {
    Plus, Pencil, Trash2, Brain, Lightbulb,
    Zap, Anchor, Target, Compass, ChevronRight
} from "lucide-react";
import { cn } from "#src/lib/utils";

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

export function MindsetTab() {
    const { data: mindset, isLoading } = useMindset();
    const { create, update, remove, isPending: saving } = useAdminMindset();

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
        await remove(id);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        const body = {
            ...editing,
            tags: tagInput.split(",").map(s => s.trim()).filter(Boolean),
        };

        if (editing.id) {
            await update({ id: editing.id, data: body });
        } else {
            await create(body);
        }
        setEditing(null);
    };

    if (isLoading) return <LoadingSkeleton />;

    if (editing) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <AdminButton
                        onClick={() => setEditing(null)}
                        variant="secondary"
                        icon={ChevronRight}
                        className="w-12 h-12 rounded-2xl nm-button hover:text-indigo-500 flex items-center justify-center transition-all"
                        aria-label="Back"
                        iconClassName="rotate-180"
                    >
                    </AdminButton>
                    <div>
                        <h2 className="text-3xl font-black text-[var(--admin-text-primary)] uppercase tracking-tight">
                            {editing.id ? "Edit Philosophy" : "Add New Principle"}
                        </h2>
                        <p className="text-[var(--admin-text-muted)] text-xs font-bold uppercase tracking-widest mt-1">
                            {editing.id ? "Refine your core beliefs" : "Document a new guiding value"}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="nm-flat p-8 md:p-10 space-y-10 relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <FormField
                            label="Principle Title"
                            value={editing.title}
                            onChange={(v) => setEditing(prev => prev ? ({ ...prev, title: v }) : null)}
                            placeholder="e.g., Radical Transparency"
                            required
                        />

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em] ml-1">Icon Representation</label>
                            <div className="flex flex-wrap gap-4">
                                {ICON_OPTIONS.map((opt) => {
                                    const IconComp = opt.icon;
                                    const isActive = editing.icon === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setEditing(prev => prev ? ({ ...prev, icon: opt.value }) : null)}
                                            className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                                isActive
                                                    ? "nm-inset text-indigo-500 scale-95"
                                                    : "nm-button text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]"
                                            )}
                                            title={opt.label}
                                        >
                                            <IconComp size={20} strokeWidth={isActive ? 2.5 : 2} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <FormTextarea
                        label="Philosophical Breakdown"
                        value={editing.description}
                        onChange={(v) => setEditing(prev => prev ? ({ ...prev, description: v }) : null)}
                        placeholder="Explain the 'why' behind this principle..."
                        required
                    />

                    <FormField
                        label="Categorization (Tags)"
                        value={tagInput}
                        onChange={setTagInput}
                        placeholder="design, engineering, growth (comma-separated)"
                    />

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <AdminButton
                            type="submit"
                            isLoading={saving}
                            className="nm-button-primary px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center min-w-[200px]"
                        >
                            {editing.id ? "Save Changes" : "Deploy Insight"}
                        </AdminButton>
                        <AdminButton
                            type="button"
                            onClick={() => setEditing(null)}
                            variant="secondary"
                            className="nm-button px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]"
                        >
                            Abort
                        </AdminButton>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-10 nm-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">Mindset</h2>
                    <p className="text-[var(--admin-text-muted)] text-xs font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <Brain size={14} className="text-indigo-400" />
                        Operating System for Thought & Action
                    </p>
                </div>
                <AdminButton
                    onClick={handleNew}
                    icon={Plus}
                    className="nm-button-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 self-start md:self-center group"
                >
                    New Insight
                </AdminButton>
            </div>

            {!mindset?.length ? (
                <EmptyState icon={Brain} text="No mindset entries found. Click 'New Insight' to share your philosophy." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mindset.map((item, index) => {
                        const IconComp = ICON_OPTIONS.find(opt => opt.value === item.icon)?.icon || Brain;
                        return (
                            <div
                                key={item.id}
                                className="nm-flat p-8 flex flex-col group relative overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Decorative Gradient Overlay */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="flex items-start justify-between mb-8">
                                    <div className="icon-container-inset text-indigo-500 group-hover:scale-110 transition-transform duration-500 group-hover:nm-flat">
                                        <IconComp size={22} strokeWidth={2.5} className="animate-float" />
                                    </div>
                                    <div className="flex gap-3">
                                        <AdminButton
                                            onClick={() => handleEdit(item)}
                                            variant="secondary"
                                            icon={Pencil}
                                            className="nm-button w-10 h-10 rounded-xl text-[var(--admin-text-muted)] hover:text-indigo-500 transition-all shadow-sm flex items-center justify-center"
                                            title="Edit"
                                        >
                                        </AdminButton>
                                        <AdminButton
                                            onClick={() => handleDelete(item.id)}
                                            variant="secondary"
                                            icon={Trash2}
                                            className="nm-button w-10 h-10 rounded-xl text-[var(--admin-text-muted)] hover:text-rose-500 transition-all shadow-sm flex items-center justify-center"
                                            title="Delete"
                                        >
                                        </AdminButton>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <h3 className="text-xl font-bold text-[var(--admin-text-primary)] leading-tight group-hover:text-indigo-500 transition-colors uppercase tracking-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-[var(--admin-text-secondary)] text-sm line-clamp-4 leading-relaxed font-medium">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-8 flex flex-wrap gap-2">
                                    {(item.tags as string[] || []).map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg nm-inset text-[var(--admin-text-muted)] bg-transparent"
                                        >
                                            {tag}
                                        </span>
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
