import React, { useState, useEffect, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { apiFetch } from "@/lib/api-helpers";
import { FormField, EmptyState, LoadingSkeleton } from "@/components/admin/AdminShared";
import type { EmailTemplate } from "@shared/schema";

const emptyTemplate = { name: "", subject: "", body: "" };

export function EmailTemplatesTab({ token }: { token: string | null }) {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<(Partial<EmailTemplate> & typeof emptyTemplate) | null>(null);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data = await apiFetch("/api/email-templates", token);
            setTemplates(data ?? []);
        } catch {
            toast({ title: "Failed to load templates", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [token]);

    const save = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        try {
            if (editing.id) {
                await apiFetch(`/api/email-templates/${editing.id}`, token, {
                    method: "PUT",
                    body: JSON.stringify(editing)
                });
                toast({ title: "Template updated" });
            } else {
                await apiFetch("/api/email-templates", token, {
                    method: "POST",
                    body: JSON.stringify(editing)
                });
                toast({ title: "Template created" });
            }
            setEditing(null);
            fetchTemplates();
        } catch (err: any) {
            toast({ title: "Save failed", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const deleteTemplate = async (id: number) => {
        if (!confirm("Delete this template?")) return;
        try {
            await apiFetch(`/api/email-templates/${id}`, token, { method: "DELETE" });
            toast({ title: "Template deleted" });
            fetchTemplates();
        } catch (err: any) {
            toast({ title: "Delete failed", description: err.message, variant: "destructive" });
        }
    };

    if (loading) return <LoadingSkeleton />;

    if (editing) {
        return (
            <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                    {editing.id ? "Edit Template" : "New Template"}
                </h2>
                <form onSubmit={save} className="space-y-4 max-w-3xl">
                    <FormField
                        label="Template Name *"
                        value={editing.name}
                        onChange={(v) => setEditing({ ...editing, name: v })}
                        required
                        placeholder="e.g. Inquiry Auto-reply"
                    />
                    <FormField
                        label="Email Subject *"
                        value={editing.subject}
                        onChange={(v) => setEditing({ ...editing, subject: v })}
                        required
                        placeholder="e.g. Re: Contacting concerning your portfolio"
                    />

                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Template Body *</label>
                        <RichTextEditor
                            value={editing.body}
                            onChange={(v) => setEditing({ ...editing, body: v })}
                        />
                        <p className="text-[10px] text-white/30 italic">Use {"{name}"} to insert the sender's name automatically.</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : (editing.id ? "Update" : "Create")}
                        </Button>
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
                    Email Templates <Badge variant="secondary" className="ml-2">{templates.length}</Badge>
                </h2>
                <Button size="sm" onClick={() => setEditing({ ...emptyTemplate })}>+ Add Template</Button>
            </div>

            {templates.length === 0 ? (
                <EmptyState icon="📄" text="No templates created yet" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((tpl) => (
                        <div key={tpl.id} className="rounded-xl border border-white/10 p-5 flex flex-col gap-4 group hover:border-white/20 transition-colors"
                            style={{ background: "hsl(222 47% 11% / 0.5)" }}
                        >
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white text-base mb-1">{tpl.name}</h3>
                                <p className="text-xs text-purple-400 mb-2 truncate">{tpl.subject}</p>
                                <div className="text-sm text-white/40 line-clamp-3 prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: tpl.body }} />
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-white/5">
                                <Button variant="outline" size="sm" onClick={() => setEditing(tpl)} className="text-white/60">Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteTemplate(tpl.id)} className="opacity-60 group-hover:opacity-100">Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
