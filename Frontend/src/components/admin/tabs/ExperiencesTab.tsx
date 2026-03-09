import React, { useState, type FormEvent } from "react";
import { useExperiences, useAdminExperiences } from "@/hooks/use-portfolio";
import { FormField, FormTextarea, EmptyState, AdminButton, LoadingSkeleton } from "@/components/admin/AdminShared";
import type { Experience } from "@portfolio/shared/schema";
import { Briefcase, Calendar, Building2, Trash2, Edit2, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExperienceFormState extends Omit<Partial<Experience>, 'startDate' | 'endDate'> {
    startDate: string | Date;
    endDate: string | Date | null;
}

const emptyExperience: ExperienceFormState = {
    role: "",
    organization: "",
    period: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    description: "",
    type: "Experience"
};

import type { AdminTabProps } from "./types";

export function ExperiencesTab(_props: AdminTabProps) {
    const { data: experiences } = useExperiences();
    const { create, update, remove, bulkDelete, isPending } = useAdminExperiences();
    const [editing, setEditing] = useState<ExperienceFormState | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} experiences?`)) return;
        await bulkDelete(selectedIds);
        setSelectedIds([]);
    };

    const save = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        const payload = {
            ...editing,
            startDate: editing.startDate instanceof Date ? editing.startDate.toISOString() : new Date(editing.startDate).toISOString(),
            endDate: editing.endDate ? (editing.endDate instanceof Date ? editing.endDate.toISOString() : new Date(editing.endDate).toISOString()) : null,
        };

        if (editing.id) {
            await update({ id: editing.id, data: payload as unknown as Partial<Experience> });
        } else {
            await create(payload as unknown as Partial<Experience>);
        }
        setEditing(null);
    };

    const deleteExp = async (id: number) => {
        if (!confirm("Delete this experience?")) return;
        await remove(id);
    };

    if (editing) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8 nm-flat p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl nm-inset flex items-center justify-center text-nm-accent">
                            {editing.id ? <Edit2 size={24} /> : <Plus size={24} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-admin-text-primary tracking-tight font-display">
                                {editing.id ? "Edit Experience" : "New Experience"}
                            </h2>
                            <p className="text-xs text-admin-text-secondary font-medium uppercase tracking-wider">
                                {editing.id ? "Update professional details" : "Add a new milestone to your journey"}
                            </p>
                        </div>
                    </div>
                    <AdminButton
                        onClick={() => setEditing(null)}
                        variant="secondary"
                        icon={X}
                        className="w-10 h-10 rounded-xl nm-button flex items-center justify-center text-admin-text-secondary hover:text-rose-500 transition-colors"
                    >
                    </AdminButton>
                </div>

                <div className="nm-flat p-8 rounded-3xl border border-white/5">
                    <form onSubmit={save} className="space-y-8 max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8">
                            <FormField
                                label="Role *"
                                value={editing.role || ""}
                                onChange={(v) => setEditing({ ...editing, role: v })}
                                required
                                placeholder="e.g. Senior Frontend Developer"
                            />
                            <FormField
                                label="Organization *"
                                value={editing.organization || ""}
                                onChange={(v) => setEditing(prev => prev ? { ...prev, organization: v } : null)}
                                required
                                placeholder="e.g. Google, Amazon, etc."
                            />
                        </div>

                        <div className="nm-inset p-1 rounded-2xl">
                            <FormField
                                label="Period * (Label only)"
                                value={editing.period || ""}
                                onChange={(v) => setEditing(prev => prev ? { ...prev, period: v } : null)}
                                required
                                placeholder="e.g. Jan 2020 - Present"
                                className="nm-flat border-0 shadow-none bg-transparent"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <FormField
                                label="Start Date *"
                                type="date"
                                value={editing.startDate ? (editing.startDate instanceof Date ? editing.startDate.toISOString().split('T')[0] : editing.startDate.toString().split('T')[0]) : ""}
                                onChange={(v) => setEditing({ ...editing, startDate: v })}
                                required
                            />
                            <FormField
                                label="End Date"
                                type="date"
                                value={editing.endDate ? (editing.endDate instanceof Date ? editing.endDate.toISOString().split('T')[0] : editing.endDate.toString().split('T')[0]) : ""}
                                onChange={(v) => setEditing({ ...editing, endDate: v || null })}
                            />
                        </div>

                        <FormTextarea
                            label="Description *"
                            value={editing.description || ""}
                            onChange={(v) => setEditing(prev => prev ? { ...prev, description: v } : null)}
                            required
                            placeholder="Describe your key responsibilities and achievements..."
                        />

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-admin-text-secondary ml-1">Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {["Experience", "Education"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setEditing({ ...editing, type })}
                                            className={cn(
                                                "py-3 rounded-xl text-xs font-bold transition-all",
                                                editing.type === type
                                                    ? "nm-inset text-nm-accent scale-[0.98]"
                                                    : "nm-flat text-admin-text-secondary hover:nm-inset"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <FormField
                                label="Custom Type"
                                value={editing.type !== "Experience" && editing.type !== "Education" ? editing.type || "" : ""}
                                onChange={(v) => setEditing(prev => prev ? { ...prev, type: v } : null)}
                                placeholder="Or enter custom type..."
                            />
                        </div>

                        <div className="flex gap-4 pt-6 justify-end">
                            <AdminButton
                                type="button"
                                onClick={() => setEditing(null)}
                                variant="secondary"
                                className="px-8 h-12 rounded-xl nm-button text-admin-text-secondary font-bold text-sm"
                            >
                                Discard
                            </AdminButton>
                            <AdminButton
                                type="submit"
                                isLoading={isPending}
                                variant="primary"
                                className="px-10 h-12 rounded-xl nm-button bg-admin-accent text-white font-bold text-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_10px_20px_-5px_rgba(var(--nm-accent-rgb),0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {editing.id ? "Update Changes" : "Create Milestone"}
                            </AdminButton>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-10 nm-flat p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl nm-inset flex items-center justify-center text-nm-accent">
                        <Briefcase size={32} />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-admin-text-primary tracking-tighter font-display">
                            Timeline
                        </h2>
                        <div className="flex items-center gap-3">
                            <p className="text-xs text-admin-text-secondary font-bold uppercase tracking-[0.2em]">
                                Professional Journey
                            </p>
                            <span className="w-1 h-1 rounded-full bg-admin-text-secondary/20" />
                            <span className="px-2 py-0.5 rounded-md nm-inset text-[10px] font-black text-nm-accent">
                                {experiences?.length ?? 0} ITEMS
                            </span>
                        </div>
                    </div>
                </div>
                <AdminButton
                    onClick={() => setEditing({ ...emptyExperience })}
                    variant="primary"
                    icon={Plus}
                    className="group flex items-center gap-3 px-8 h-14 rounded-2xl nm-button bg-admin-accent text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <span>Add Milestone</span>
                </AdminButton>
            </div>

            {!experiences ? (
                <div className="space-y-10">
                    {[1, 2, 3].map(i => <LoadingSkeleton key={i} />)}
                </div>
            ) : !experiences.length ? (
                <div className="nm-flat p-20 rounded-[3rem] text-center border border-white/5 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Briefcase size={200} />
                    </div>
                    <EmptyState icon="💼" text="Your professional story begins here. Add your first experience." />
                </div>
            ) : (
                <div className="space-y-10 relative before:content-[''] before:absolute before:left-[2.125rem] before:top-4 before:bottom-4 before:w-0.5 before:nm-inset before:opacity-50">
                    {experiences.map((exp, index) => (
                        <div key={exp.id} className="relative pl-24 group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                            {/* Timeline Point */}
                            <div className="absolute left-[1.125rem] top-6 w-8 h-8 rounded-full nm-flat flex items-center justify-center z-10">
                                <div className={cn(
                                    "w-3 h-3 rounded-full transition-all duration-500",
                                    exp.type === "Education" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-nm-accent shadow-[0_0_10px_rgba(var(--nm-accent-rgb),0.5)]",
                                    selectedIds.includes(exp.id) ? "scale-[1.5]" : "group-hover:scale-125"
                                )} />
                            </div>

                            {/* Card Content */}
                            <div className={cn(
                                "nm-flat p-8 rounded-[2rem] flex flex-col md:flex-row items-start gap-8 border border-white/5 transition-all duration-500",
                                selectedIds.includes(exp.id) ? "nm-inset border-nm-accent/20 translate-x-1" : "hover:nm-inset hover:border-white/10"
                            )}>
                                {/* Selector */}
                                <button
                                    className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 mt-1",
                                        selectedIds.includes(exp.id)
                                            ? "bg-nm-accent text-white shadow-lg"
                                            : "nm-inset text-transparent hover:text-admin-text-secondary hover:nm-flat"
                                    )}
                                    onClick={() => toggleSelect(exp.id)}
                                >
                                    <Check size={16} />
                                </button>

                                <div className="flex-1 min-w-0 space-y-4">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <h3 className="font-bold text-admin-text-primary text-2xl tracking-tight leading-none font-display">
                                            {exp.role}
                                        </h3>
                                        <span className={cn(
                                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest nm-inset",
                                            exp.type === "Education" ? "text-emerald-500" : "text-nm-accent"
                                        )}>
                                            {exp.type}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 text-sm">
                                        <div className="flex items-center gap-2 text-nm-accent font-bold">
                                            <Building2 size={16} />
                                            <span>{exp.organization}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-admin-text-secondary font-medium">
                                            <Calendar size={16} />
                                            <span className="uppercase text-[11px] tracking-wider font-black">
                                                {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                <span className="mx-2 text-admin-text-secondary/30">—</span>
                                                {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Present"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl nm-inset bg-transparent overflow-hidden">
                                        <p className="text-sm text-admin-text-secondary leading-relaxed max-w-4xl line-clamp-3 group-hover:line-clamp-none transition-all">
                                            {exp.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex md:flex-col gap-3 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 md:ml-4 translate-x-2 group-hover:translate-x-0">
                                    <AdminButton
                                        onClick={() => setEditing({
                                            ...exp,
                                            period: exp.period ?? "",
                                            startDate: exp.startDate ? (exp.startDate instanceof Date ? exp.startDate.toISOString().split('T')[0] : String(exp.startDate).split('T')[0]) : "",
                                            endDate: exp.endDate ? (exp.endDate instanceof Date ? exp.endDate.toISOString().split('T')[0] : String(exp.endDate).split('T')[0]) : null
                                        })}
                                        variant="secondary"
                                        icon={Edit2}
                                        size="sm"
                                        className="w-11 h-11 rounded-xl nm-button flex items-center justify-center text-admin-text-secondary hover:text-nm-accent transition-colors"
                                        title="Edit"
                                    >
                                    </AdminButton>
                                    <AdminButton
                                        onClick={() => deleteExp(exp.id)}
                                        variant="secondary"
                                        icon={Trash2}
                                        size="sm"
                                        className="w-11 h-11 rounded-xl nm-button flex items-center justify-center text-admin-text-secondary hover:text-rose-500 transition-colors"
                                        title="Delete"
                                    >
                                    </AdminButton>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bulk Selection Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-[calc(50%+140px)] -translate-x-1/2 z-50 nm-flat bg-admin-bg/95 border border-white/10 rounded-[2rem] shadow-2xl px-10 py-5 flex items-center gap-10 animate-in slide-in-from-bottom-10 fade-in backdrop-blur-xl border-t-white/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl nm-inset flex items-center justify-center text-rose-500 animate-pulse">
                            <Trash2 size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-admin-text-primary tracking-tighter leading-none">{selectedIds.length} Selected</span>
                            <span className="text-[10px] text-admin-text-secondary uppercase tracking-[0.2em] font-black mt-1">Bulk Management</span>
                        </div>
                    </div>

                    <div className="h-10 w-px nm-inset" />

                    <div className="flex items-center gap-4">
                        <AdminButton
                            variant="secondary"
                            className="px-8 h-12 rounded-xl nm-button bg-rose-500 text-white font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(244,63,94,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                            onClick={handleBulkDelete}
                        >
                            Delete Selected
                        </AdminButton>
                        <AdminButton
                            variant="secondary"
                            className="w-12 h-12 rounded-xl nm-button text-admin-text-secondary hover:text-admin-text-primary transition-colors flex items-center justify-center"
                            onClick={() => setSelectedIds([])}
                            icon={X}
                        >
                        </AdminButton>
                    </div>
                </div>
            )}
        </div>
    );
}
