import React, { useState, type FormEvent } from "react";
import { useExperiences } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-helpers";
import { clearQueryCache } from "@/lib/query-cache-persister";
import { FormField, FormTextarea, EmptyState } from "@/components/admin/AdminShared";
import type { Experience } from "@shared/schema";

const emptyExperience = { role: "", organization: "", period: "", startDate: new Date(), endDate: null as Date | null, description: "", type: "Experience" };

import type { AdminTabProps } from "./types";

export function ExperiencesTab({ }: AdminTabProps) {
    const { data: experiences, refetch } = useExperiences();
    const { toast } = useToast();
    const [editing, setEditing] = useState<(Partial<Experience> & typeof emptyExperience) | null>(null);
    const [saving, setSaving] = useState(false);

    const save = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        try {
            const payload = {
                ...editing,
                startDate: editing.startDate ? (editing.startDate instanceof Date ? editing.startDate.toISOString() : editing.startDate) : null,
                endDate: editing.endDate ? (editing.endDate instanceof Date ? editing.endDate.toISOString() : editing.endDate) : null,
            };

            if (editing.id) {
                await apiFetch(`/api/v1/experiences/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
                toast({ title: "Experience updated" });
            } else {
                await apiFetch("/api/v1/experiences", { method: "POST", body: JSON.stringify(payload) });
                toast({ title: "Experience created" });
            }
            setEditing(null);
            clearQueryCache();
            refetch();
        } catch (err: any) {
            toast({ title: "Save failed", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const deleteExp = async (id: number) => {
        if (!confirm("Delete this experience?")) return;
        try {
            await apiFetch(`/api/v1/experiences/${id}`, { method: "DELETE" });
            toast({ title: "Experience deleted" });
            clearQueryCache();
            refetch();
        } catch (err: any) {
            toast({ title: "Delete failed", description: err.message, variant: "destructive" });
        }
    };

    if (editing) {
        return (
            <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                    {editing.id ? "Edit Experience" : "New Experience"}
                </h2>
                <form onSubmit={save} className="space-y-4 max-w-2xl text-white">
                    <FormField label="Role *" value={editing.role} onChange={(v) => setEditing({ ...editing, role: v })} required />
                    <FormField label="Organization *" value={editing.organization} onChange={(v) => setEditing({ ...editing, organization: v })} required />
                    <FormField label="Period * (e.g. Jan 2020 - Present)" value={editing.period} onChange={(v) => setEditing({ ...editing, period: v })} required />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Start Date *"
                            type="date"
                            value={editing.startDate ? new Date(editing.startDate).toISOString().split('T')[0] : ""}
                            onChange={(v) => setEditing({ ...editing, startDate: new Date(v) })}
                            required
                        />
                        <FormField
                            label="End Date"
                            type="date"
                            value={editing.endDate ? new Date(editing.endDate).toISOString().split('T')[0] : ""}
                            onChange={(v) => setEditing({ ...editing, endDate: v ? new Date(v) : null })}
                        />
                    </div>
                    <FormTextarea label="Description *" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} required />
                    <FormField label="Type" value={editing.type} onChange={(v) => setEditing({ ...editing, type: v })} placeholder="Experience, Education, etc." />

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={saving}>{saving ? "Saving..." : (editing.id ? "Update" : "Create")}</Button>
                        <Button type="button" variant="ghost" onClick={() => setEditing(null)} className="text-white/50">Cancel</Button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Experiences <Badge variant="secondary" className="ml-2">{experiences?.length ?? 0}</Badge>
                </h2>
                <Button size="sm" onClick={() => setEditing({ ...emptyExperience })}>+ Add Experience</Button>
            </div>

            {!experiences?.length ? <EmptyState icon="💼" text="No experiences yet" /> : (
                <div className="space-y-3">
                    {experiences.map((exp) => (
                        <div key={exp.id} className="rounded-xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-start gap-4 group hover:border-white/20 transition-colors"
                            style={{ background: "hsl(222 47% 11% / 0.5)" }}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm">{exp.role}</p>
                                <p className="text-xs text-purple-400">{exp.organization}</p>
                                <p className="text-xs text-white/40 mt-0.5">
                                    {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Present"}
                                </p>
                                <p className="text-sm text-white/60 mt-2 line-clamp-2">{exp.description}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Button variant="outline" size="sm" onClick={() => setEditing({
                                    ...exp,
                                    period: exp.period ?? "",
                                    startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
                                    endDate: exp.endDate ? new Date(exp.endDate) : null
                                })} className="text-white/60">Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteExp(exp.id)} className="opacity-60 group-hover:opacity-100">Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
