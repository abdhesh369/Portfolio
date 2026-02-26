import React, { useState, type FormEvent } from "react";
import { useExperiences } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-helpers";
import { FormField, FormTextarea, EmptyState } from "@/components/admin/AdminShared";
import type { Experience } from "@shared/schema";

const emptyExperience = { role: "", organization: "", period: "", description: "", type: "Experience" };

export function ExperiencesTab({ token }: { token: string | null }) {
    const { data: experiences, refetch } = useExperiences();
    const { toast } = useToast();
    const [editing, setEditing] = useState<(Partial<Experience> & typeof emptyExperience) | null>(null);
    const [saving, setSaving] = useState(false);

    const save = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        try {
            if (editing.id) {
                await apiFetch(`/api/experiences/${editing.id}`, token, { method: "PUT", body: JSON.stringify(editing) });
                toast({ title: "Experience updated" });
            } else {
                await apiFetch("/api/experiences", token, { method: "POST", body: JSON.stringify(editing) });
                toast({ title: "Experience created" });
            }
            setEditing(null);
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
            await apiFetch(`/api/experiences/${id}`, token, { method: "DELETE" });
            toast({ title: "Experience deleted" });
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
                <form onSubmit={save} className="space-y-4 max-w-2xl">
                    <FormField label="Role *" value={editing.role} onChange={(v) => setEditing({ ...editing, role: v })} required />
                    <FormField label="Organization *" value={editing.organization} onChange={(v) => setEditing({ ...editing, organization: v })} required />
                    <FormField label="Period *" value={editing.period} onChange={(v) => setEditing({ ...editing, period: v })} placeholder="e.g. Jan 2024 – Present" required />
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
                                <p className="text-xs text-white/40 mt-0.5">{exp.period}</p>
                                <p className="text-sm text-white/60 mt-2 line-clamp-2">{exp.description}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Button variant="outline" size="sm" onClick={() => setEditing({ ...exp })} className="text-white/60">Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteExp(exp.id)} className="opacity-60 group-hover:opacity-100">Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
