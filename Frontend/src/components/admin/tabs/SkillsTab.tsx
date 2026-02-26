import React, { useState, type FormEvent } from "react";
import { useSkills } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-helpers";
import { FormField, FormTextarea, EmptyState } from "@/components/admin/AdminShared";
import type { Skill } from "@shared/schema";

const emptySkill = { name: "", category: "", status: "Core", icon: "Code", description: "", proof: "", x: 50, y: 50 };

export function SkillsTab({ token }: { token: string | null }) {
    const { data: skills, refetch } = useSkills();
    const { toast } = useToast();
    const [editing, setEditing] = useState<(Partial<Skill> & typeof emptySkill) | null>(null);
    const [saving, setSaving] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} skills?`)) return;
        try {
            await apiFetch("/api/skills/bulk-delete", token, { method: "POST", body: JSON.stringify({ ids: selectedIds }) });
            toast({ title: "Skills deleted" });
            setSelectedIds([]);
            refetch();
        } catch (err: any) {
            toast({ title: "Bulk delete failed", description: err.message, variant: "destructive" });
        }
    };

    const save = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        try {
            if (editing.id) {
                await apiFetch(`/api/skills/${editing.id}`, token, { method: "PUT", body: JSON.stringify(editing) });
                toast({ title: "Skill updated" });
            } else {
                await apiFetch("/api/skills", token, { method: "POST", body: JSON.stringify(editing) });
                toast({ title: "Skill created" });
            }
            setEditing(null);
            refetch();
        } catch (err: any) {
            toast({ title: "Save failed", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const deleteSkill = async (id: number) => {
        if (!confirm("Delete this skill?")) return;
        try {
            await apiFetch(`/api/skills/${id}`, token, { method: "DELETE" });
            toast({ title: "Skill deleted" });
            refetch();
        } catch (err: any) {
            toast({ title: "Delete failed", description: err.message, variant: "destructive" });
        }
    };

    if (editing) {
        return (
            <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                    {editing.id ? "Edit Skill" : "New Skill"}
                </h2>
                <form onSubmit={save} className="space-y-4 max-w-2xl">
                    <FormField label="Name *" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} required />
                    <FormField label="Category *" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} placeholder="e.g. Frontend, Backend, Tools" required />
                    <FormField label="Status" value={editing.status} onChange={(v) => setEditing({ ...editing, status: v })} placeholder="Core, Learning, etc." />
                    <FormField label="Icon" value={editing.icon} onChange={(v) => setEditing({ ...editing, icon: v })} placeholder="Lucide icon name" />
                    <FormTextarea label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} />
                    <FormTextarea label="Proof" value={editing.proof} onChange={(v) => setEditing({ ...editing, proof: v })} />

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={saving}>{saving ? "Saving..." : (editing.id ? "Update" : "Create")}</Button>
                        <Button type="button" variant="ghost" onClick={() => setEditing(null)} className="text-white/50">Cancel</Button>
                    </div>
                </form>
            </div>
        );
    }

    // Group skills by category
    const grouped: Record<string, Skill[]> = {};
    (skills ?? []).forEach((s) => {
        (grouped[s.category] ??= []).push(s);
    });

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Skills <Badge variant="secondary" className="ml-2">{skills?.length ?? 0}</Badge>
                </h2>
                <Button size="sm" onClick={() => setEditing({ ...emptySkill })}>+ Add Skill</Button>
            </div>

            {!skills?.length ? <EmptyState icon="⚡" text="No skills yet" /> : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([cat, items]) => (
                        <div key={cat}>
                            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">{cat}</h3>
                            <div className="grid gap-2">
                                {items.map((s) => (
                                    <div key={s.id} className="rounded-xl border border-white/10 px-4 py-3 flex items-center gap-3 group hover:border-white/20 transition-colors"
                                        style={{ background: "hsl(222 47% 11% / 0.5)" }}
                                    >
                                        <div
                                            className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${selectedIds.includes(s.id) ? "bg-purple-500 border-purple-500" : "border-white/20 hover:border-white/40"}`}
                                            onClick={() => toggleSelect(s.id)}
                                        >
                                            {selectedIds.includes(s.id) && <span className="text-white text-xs">✓</span>}
                                        </div>
                                        <div className="flex-1 flex items-center gap-3">
                                            <span className="text-white font-medium text-sm">{s.name}</span>
                                            <Badge variant="outline" className="text-[10px] text-white/40 border-white/10">{s.status}</Badge>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <Button variant="outline" size="sm" onClick={() => setEditing({ ...s })} className="text-white/60">Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => deleteSkill(s.id)} className="opacity-60 group-hover:opacity-100">Delete</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] border border-white/10 rounded-full shadow-2xl px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in">
                    <span className="text-sm font-medium text-white">{selectedIds.length} selected</span>
                    <div className="h-4 w-px bg-white/10" />
                    <Button size="sm" variant="destructive" className="h-8" onClick={handleBulkDelete}>Delete Selected</Button>
                    <Button size="sm" variant="ghost" className="h-8 text-white/50" onClick={() => setSelectedIds([])}>✕</Button>
                </div>
            )}
        </div>
    );
}
