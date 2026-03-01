import { useState, useEffect } from "react";
import { useTestimonials } from "@/hooks/use-portfolio";
import { useAuth } from "@/hooks/auth-context";
import { apiFetch } from "@/lib/api-helpers";
import type { Testimonial } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const empty = {
    name: "",
    role: "",
    company: "",
    quote: "",
    relationship: "Colleague",
    avatarUrl: "",
    displayOrder: 0,
};

export function TestimonialsTab({ token }: { token: string | null }) {
    const { data: testimonials, refetch } = useTestimonials();
    const { toast } = useToast();
    const [editing, setEditing] = useState<(typeof empty & { id?: number }) | null>(null);

    function startCreate() {
        setEditing({ ...empty });
    }

    function startEdit(t: Testimonial) {
        setEditing({
            id: t.id,
            name: t.name,
            role: t.role,
            company: t.company ?? "",
            quote: t.quote,
            relationship: t.relationship ?? "Colleague",
            avatarUrl: t.avatarUrl ?? "",
            displayOrder: t.displayOrder ?? 0,
        });
    }

    async function save() {
        if (!editing) return;
        try {
            const body = {
                name: editing.name,
                role: editing.role,
                company: editing.company,
                quote: editing.quote,
                relationship: editing.relationship,
                avatarUrl: editing.avatarUrl || null,
                displayOrder: editing.displayOrder,
            };

            if (editing.id) {
                await apiFetch(`/api/testimonials/${editing.id}`, token, {
                    method: "PATCH",
                    body: JSON.stringify(body),
                });
                toast({ title: "Testimonial updated" });
            } else {
                await apiFetch("/api/testimonials", token, {
                    method: "POST",
                    body: JSON.stringify(body),
                });
                toast({ title: "Testimonial created" });
            }

            setEditing(null);
            refetch();
        } catch (err: any) {
            toast({ title: err.message || "Failed to save testimonial", variant: "destructive" });
        }
    }

    async function remove(id: number) {
        if (!confirm("Delete this testimonial?")) return;
        try {
            await apiFetch(`/api/testimonials/${id}`, token, { method: "DELETE" });
            toast({ title: "Testimonial deleted" });
            refetch();
        } catch (err: any) {
            toast({ title: err.message || "Failed to delete", variant: "destructive" });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Testimonials
                </h2>
                <button
                    onClick={startCreate}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                    + Add Testimonial
                </button>
            </div>

            {/* Edit / Create Form */}
            {editing && (
                <div className="rounded-xl p-6 border border-white/10 space-y-4" style={{ background: "hsl(222 47% 11% / 0.6)" }}>
                    <h3 className="text-white font-semibold text-sm">
                        {editing.id ? "Edit" : "New"} Testimonial
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-white/50 mb-1">Name *</label>
                            <input
                                value={editing.name}
                                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 mb-1">Role *</label>
                            <input
                                value={editing.role}
                                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 mb-1">Company</label>
                            <input
                                value={editing.company}
                                onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 mb-1">Relationship</label>
                            <select
                                value={editing.relationship}
                                onChange={(e) => setEditing({ ...editing, relationship: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                            >
                                <option value="Colleague">Colleague</option>
                                <option value="Mentor">Mentor</option>
                                <option value="Client">Client</option>
                                <option value="Manager">Manager</option>
                                <option value="Friend">Friend</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 mb-1">Avatar URL</label>
                            <input
                                value={editing.avatarUrl}
                                onChange={(e) => setEditing({ ...editing, avatarUrl: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 mb-1">Display Order</label>
                            <input
                                type="number"
                                value={editing.displayOrder}
                                onChange={(e) => setEditing({ ...editing, displayOrder: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-white/50 mb-1">Quote *</label>
                        <textarea
                            value={editing.quote}
                            onChange={(e) => setEditing({ ...editing, quote: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setEditing(null)}
                            className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={save}
                            disabled={!editing.name || !editing.quote || !editing.role}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-primary hover:opacity-90 transition-opacity disabled:opacity-40"
                        >
                            {editing.id ? "Update" : "Create"}
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {(!testimonials || testimonials.length === 0) && (
                    <p className="text-white/40 text-sm text-center py-8">
                        No testimonials yet. Click "+ Add Testimonial" to get started.
                    </p>
                )}

                {testimonials?.map((t) => (
                    <div
                        key={t.id}
                        className="rounded-xl p-5 border border-white/[0.06] flex flex-col sm:flex-row sm:items-start gap-4"
                        style={{ background: "hsl(222 47% 11% / 0.4)" }}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-medium text-sm">{t.name}</span>
                                <span className="text-white/30 text-xs">·</span>
                                <span className="text-white/40 text-xs">{t.role}</span>
                                {t.company && (
                                    <>
                                        <span className="text-white/30 text-xs">·</span>
                                        <span className="text-white/40 text-xs">{t.company}</span>
                                    </>
                                )}
                            </div>
                            <p className="text-white/60 text-sm italic line-clamp-2">"{t.quote}"</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10 text-white/40">
                                    {t.relationship}
                                </span>
                                <span className="text-white/20 text-xs">Order: {t.displayOrder}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => startEdit(t)}
                                className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => remove(t.id)}
                                className="px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 border border-red-400/20 hover:bg-red-400/5 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
