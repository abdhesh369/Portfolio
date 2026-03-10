import React, { useState, type FormEvent } from "react";
import DOMPurify from "dompurify";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/admin/LazyRichTextEditor";
import { FormField, EmptyState, LoadingSkeleton, AdminButton } from "@/components/admin/AdminShared";
import type { EmailTemplate } from "@portfolio/shared/schema";
import { useEmailTemplates } from "@/hooks/portfolio/use-email-templates";
import { FileText, Plus, Trash2, Edit3, X, Check, Mail } from "lucide-react";

const emptyTemplate = { name: "", subject: "", body: "" };

import type { AdminTabProps } from "./types";

export function EmailTemplatesTab(_props: AdminTabProps) {
    const {
        data: templates = [],
        isLoading: loading,
        createMutation,
        updateMutation,
        deleteMutation
    } = useEmailTemplates();

    const [editing, setEditing] = useState<(Partial<EmailTemplate> & typeof emptyTemplate) | null>(null);
    const { toast } = useToast();

    const isSaving = createMutation.isPending || updateMutation.isPending;

    const save = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        try {
            if (editing.id) {
                await updateMutation.mutateAsync({
                    id: editing.id,
                    data: {
                        name: editing.name,
                        subject: editing.subject,
                        body: editing.body
                    }
                });
                toast({ title: "Template updated" });
            } else {
                await createMutation.mutateAsync({
                    name: editing.name,
                    subject: editing.subject,
                    body: editing.body
                });
                toast({ title: "Template created" });
            }
            setEditing(null);
        } catch (err: unknown) {
            toast({ title: "Save failed", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
        }
    };

    const deleteTemplate = async (id: number) => {
        if (!confirm("Delete this template?")) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast({ title: "Template deleted" });
        } catch (err: unknown) {
            toast({ title: "Delete failed", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
        }
    };

    if (loading) return <LoadingSkeleton />;

    if (editing) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 nm-inset rounded-2xl flex items-center justify-center text-primary">
                            {editing.id ? <Edit3 size={24} /> : <Plus size={24} />}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ fontFamily: "var(--font-display)" }}>
                                {editing.id ? "Edit_Template" : "New_Template"}
                            </h2>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">
                                Protocol: {editing.id ? `ID_${editing.id}` : "Allocation"}
                            </p>
                        </div>
                    </div>
                    <AdminButton
                        onClick={() => setEditing(null)}
                        variant="secondary"
                        icon={X}
                        className="nm-button h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-rose-500 transition-colors flex items-center justify-center"
                    >
                        Cancel
                    </AdminButton>
                </div>

                <form onSubmit={save} className="nm-flat p-10 space-y-8 max-w-4xl mx-auto rounded-[2.5rem]">
                    <div className="grid md:grid-cols-2 gap-8">
                        <FormField
                            label="Template Name *"
                            value={editing.name}
                            onChange={(v) => setEditing(prev => prev ? ({ ...prev, name: v }) : null)}
                            required
                            placeholder="e.g. Inquiry Auto-reply"
                        />
                        <FormField
                            label="Email Subject *"
                            value={editing.subject}
                            onChange={(v) => setEditing(prev => prev ? ({ ...prev, subject: v }) : null)}
                            required
                            placeholder='e.g. Re: Your inquiry'
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Template Body *</label>
                        <RichTextEditor
                            value={editing.body}
                            onChange={(v) => setEditing(prev => prev ? ({ ...prev, body: v }) : null)}
                        />
                        <p className="text-[10px] text-muted-foreground italic">Use {"{name}"} to insert the sender's name automatically.</p>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <AdminButton
                            type="submit"
                            isLoading={isSaving}
                            icon={Check}
                            className="nm-button h-14 px-10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:nm-convex transition-all duration-300"
                        >
                            {editing.id ? "Update_Template" : "Create_Template"}
                        </AdminButton>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 nm-flat rounded-2xl text-primary">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter" style={{ fontFamily: "var(--font-display)" }}>
                            Email_Templates
                        </h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
                            Auto-Response System &bull; {templates.length} Templates
                        </p>
                    </div>
                </div>
                <AdminButton
                    onClick={() => setEditing({ ...emptyTemplate })}
                    icon={Plus}
                    className="nm-button px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:nm-convex transition-all duration-300"
                >
                    New_Template
                </AdminButton>
            </div>

            {templates.length === 0 ? (
                <EmptyState icon={FileText} text="No templates created yet" />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {templates.map((tpl, idx) => (
                        <div
                            key={tpl.id}
                            className="nm-flat p-8 space-y-5 group transition-all duration-300 hover:scale-[1.005] animate-in fade-in"
                            style={{ animationDelay: `${idx * 80}ms` }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 nm-inset rounded-xl flex items-center justify-center text-primary shrink-0">
                                        <FileText size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold tracking-tight text-base">{tpl.name}</h3>
                                        <p className="text-xs text-primary/60 truncate mt-0.5 font-medium">{tpl.subject}</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="nm-inset p-4 rounded-2xl text-xs text-muted-foreground line-clamp-3 leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tpl.body) }}
                            />

                            <div className="flex gap-3 pt-2 border-t border-black/5">
                                <AdminButton
                                    onClick={() => setEditing(tpl as Partial<EmailTemplate> & typeof emptyTemplate)}
                                    variant="secondary"
                                    icon={Edit3}
                                    className="nm-button px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
                                >
                                    Edit
                                </AdminButton>
                                <AdminButton
                                    onClick={() => deleteTemplate(tpl.id)}
                                    variant="secondary"
                                    icon={Trash2}
                                    className="nm-button px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground hover:text-rose-500 opacity-60 group-hover:opacity-100 transition-all flex items-center justify-center"
                                >
                                    Delete
                                </AdminButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
