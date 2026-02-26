import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { apiFetch } from "@/lib/api-helpers";
import { FormField, EmptyState, LoadingSkeleton } from "@/components/admin/AdminShared";
import type { Message, EmailTemplate } from "@shared/schema";

export function MessagesTab({ token }: { token: string | null }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} messages?`)) return;
        try {
            await apiFetch("/api/messages/bulk-delete", token, {
                method: "POST",
                body: JSON.stringify({ ids: selectedIds })
            });
            toast({ title: "Messages deleted" });
            setSelectedIds([]);
            fetchMessages();
        } catch (err: any) {
            toast({ title: "Bulk delete failed", description: err.message, variant: "destructive" });
        }
    };

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const data = await apiFetch("/api/messages", token);
            setMessages(data ?? []);
        } catch {
            toast({ title: "Failed to load messages", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [token]);

    const deleteMessage = async (id: number) => {
        if (!confirm("Delete this message?")) return;
        try {
            await apiFetch(`/api/messages/${id}`, token, { method: "DELETE" });
            setMessages((prev) => prev.filter((m) => m.id !== id));
            toast({ title: "Message deleted" });
        } catch (err: any) {
            toast({ title: "Delete failed", description: err.message, variant: "destructive" });
        }
    };

    if (loading) return <LoadingSkeleton />;

    const filtered = messages.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.subject?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white shrink-0" style={{ fontFamily: "var(--font-display)" }}>
                    Messages <Badge variant="secondary" className="ml-2">{messages.length}</Badge>
                </h2>
                <div className="flex flex-1 max-w-md gap-3">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">🔍</span>
                        <input
                            type="text"
                            placeholder="Search name, email, or message..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-purple-500 outline-none transition-all"
                        />
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchMessages} className="text-white/60">Refresh</Button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon="🔍" text={searchQuery ? "No matches found" : "No messages yet"} />
            ) : (
                <div className="space-y-3">
                    {filtered.map((msg) => (
                        <div key={msg.id} className="rounded-xl border border-white/10 p-4 flex flex-col md:flex-row md:items-start gap-4 group hover:border-white/20 transition-colors"
                            style={{ background: "hsl(222 47% 11% / 0.5)" }}
                        >
                            <div className="flex items-center self-start pt-0.5">
                                <div
                                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${selectedIds.includes(msg.id) ? "bg-purple-500 border-purple-500" : "border-white/20 hover:border-white/40"}`}
                                    onClick={() => toggleSelect(msg.id)}
                                >
                                    {selectedIds.includes(msg.id) && <span className="text-white text-xs">✓</span>}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-white text-sm">{msg.name}</span>
                                    <span className="text-xs text-white/40">{msg.email}</span>
                                </div>
                                {msg.subject && <p className="text-xs text-purple-400 mb-1">{msg.subject}</p>}
                                <p className="text-sm text-white/70 break-words">{msg.message}</p>
                                <p className="text-xs text-white/30 mt-2">{new Date(msg.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <ReplyDialog message={msg} token={token} />
                                <Button variant="destructive" size="sm" onClick={() => deleteMessage(msg.id)}
                                    className="opacity-60 group-hover:opacity-100 transition-opacity shrink-0"
                                >
                                    Delete
                                </Button>
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

function ReplyDialog({ message, token }: { message: Message; token: string | null }) {
    const [open, setOpen] = useState(false);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [subject, setSubject] = useState(`Re: ${message.subject || "Message from Portfolio"}`);
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            apiFetch("/api/email-templates", token)
                .then(setTemplates)
                .catch(() => setTemplates([]));
        }
    }, [open, token]);

    const handleApplyTemplate = (tpl: EmailTemplate) => {
        const processedBody = tpl.body.replace(/{name}/g, message.name);
        setSubject(tpl.subject.replace(/{name}/g, message.name));
        setBody(processedBody);
    };

    const handleSend = async () => {
        if (!body) return toast({ title: "Body is required", variant: "destructive" });
        setSending(true);
        try {
            await apiFetch(`/api/messages/${message.id}/reply`, token, {
                method: "POST",
                body: JSON.stringify({ subject, body }),
            });
            toast({ title: "Reply sent successfully" });
            setOpen(false);
        } catch (err: any) {
            toast({ title: "Failed to send reply", description: err.message, variant: "destructive" });
        } finally {
            setSending(false);
        }
    };

    if (!open) return <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10">Reply</Button>;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                style={{ background: "hsl(224 71% 4%)" }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Reply to {message.name}</h3>
                        <p className="text-xs text-white/40 mt-1">{message.email}</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">✕</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-3">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Templates</p>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {templates.length === 0 ? (
                                <p className="text-xs text-white/20 italic">No templates available</p>
                            ) : (
                                templates.map(tpl => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => handleApplyTemplate(tpl)}
                                        className="w-full text-left p-2 rounded-lg border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                                    >
                                        <p className="text-xs font-medium text-white/70 group-hover:text-purple-400 truncate">{tpl.name}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-4">
                        <FormField label="Subject" value={subject} onChange={setSubject} />
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">Reply Content</label>
                            <RichTextEditor value={body} onChange={setBody} />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={() => setOpen(false)} className="text-white/40">Cancel</Button>
                            <Button onClick={handleSend} disabled={sending}>
                                {sending ? "Sending..." : "Send Reply"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
