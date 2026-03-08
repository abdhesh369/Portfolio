import React, { useState, type FormEvent } from "react";
import { useExperiences, useAdminExperiences } from "@/hooks/use-portfolio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField, FormTextarea, EmptyState } from "@/components/admin/AdminShared";
import type { Experience } from "@portfolio/shared/schema";

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
    const { create, update, remove, isPending } = useAdminExperiences();
    const [editing, setEditing] = useState<ExperienceFormState | null>(null);

    const save = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        // Ensure dates are strings for the API payload if that's what it expects, 
        // or Date objects if the hooks handle them. 
        // Assuming the backend/hooks expect ISO strings or Dates.
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
            <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                    {editing.id ? "Edit Experience" : "New Experience"}
                </h2>
                <form onSubmit={save} className="space-y-4 max-w-2xl text-white">
                    <FormField label="Role *" value={editing.role || ""} onChange={(v) => setEditing({ ...editing, role: v })} required />
                    <FormField label="Organization *" value={editing.organization || ""} onChange={(v) => setEditing({ ...editing, organization: v })} required />
                    <FormField label="Period * (e.g. Jan 2020 - Present)" value={editing.period || ""} onChange={(v) => setEditing({ ...editing, period: v })} required />
                    <div className="grid grid-cols-2 gap-4">
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
                    <FormTextarea label="Description *" value={editing.description || ""} onChange={(v) => setEditing({ ...editing, description: v })} required />
                    <FormField label="Type" value={editing.type || ""} onChange={(v) => setEditing({ ...editing, type: v })} placeholder="Experience, Education, etc." />

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : (editing.id ? "Update" : "Create")}</Button>
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
                                    startDate: exp.startDate ? (exp.startDate instanceof Date ? exp.startDate.toISOString().split('T')[0] : String(exp.startDate).split('T')[0]) : "",
                                    endDate: exp.endDate ? (exp.endDate instanceof Date ? exp.endDate.toISOString().split('T')[0] : String(exp.endDate).split('T')[0]) : null
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
