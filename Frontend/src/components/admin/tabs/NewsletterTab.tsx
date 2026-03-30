import React, { useState } from "react";
import { useAdminSubscribers } from "#src/hooks/use-portfolio";
import { useToast } from "#src/hooks/use-toast";
import { apiFetch } from "#src/lib/api-helpers";
import { 
    Send, FileText, AlertTriangle, Sparkles, Layout, Eye
} from "lucide-react";
import { 
    AdminButton, 
    FormField,
} from "#src/components/admin/AdminShared";
import { RichTextEditor } from "#src/components/admin/LazyRichTextEditor";
import type { AdminTabProps } from "./types";
import { motion, AnimatePresence } from "framer-motion";

export default function NewsletterTab(_props: AdminTabProps) {
    const { data: subscribers } = useAdminSubscribers();
    const { toast } = useToast();
    const [broadcastData, setBroadcastData] = useState({ subject: "", body: "" });
    const [isSending, setIsSending] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    const activeCount = subscribers?.filter(s => s.status === 'active').length || 0;

    const handleBroadcast = async () => {
        if (!broadcastData.subject || !broadcastData.body) {
            toast({ 
                title: "Incomplete Transmission", 
                description: "Broadcast requires both a subject line and payload body.", 
                variant: "destructive" 
            });
            return;
        }

        if (!confirm(`Are you sure you want to broadcast this message to ${activeCount} active subscribers?`)) return;

        setIsSending(true);
        try {
            const res = await apiFetch("/api/v1/admin/subscribers/broadcast", {
                method: "POST",
                body: JSON.stringify(broadcastData)
            });
            
            toast({ 
                title: "Broadcast Success", 
                description: res.message || `All ${activeCount} subscribers have been queued for delivery.` 
            });
            setBroadcastData({ subject: "", body: "" });
        } catch (err) {
            toast({ 
                title: "Broadcast Failed", 
                description: err instanceof Error ? err.message : "Internal error during transmission", 
                variant: "destructive" 
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-700 space-y-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 nm-inset rounded-xl flex items-center justify-center text-blue-500">
                            <Send size={20} strokeWidth={3} />
                        </div>
                        <h1 className="text-4xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic">
                            Newsletter
                        </h1>
                    </div>
                    <p className="text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 ml-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        Engagement_Engine_V1.2
                    </p>
                </div>

                <div className="flex items-center gap-4">
                     <div className="nm-inset px-6 py-4 rounded-2xl flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-wider">Active_Reach</p>
                            <p className="text-xl font-mono font-black text-blue-500">{activeCount}</p>
                        </div>
                        <div className="w-[1px] h-8 bg-[var(--nm-light)]" />
                        <Layout size={20} className="text-blue-500/50" />
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Editor Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="nm-flat rounded-[2.5rem] p-10 space-y-8 border border-[var(--nm-light)]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <FileText className="text-blue-500" size={18} />
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--admin-text-secondary)]">Compose_Transmission</h2>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setIsPreviewMode(false)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isPreviewMode ? 'nm-inset text-blue-500' : 'text-[var(--admin-text-muted)]'}`}
                                >
                                    Editor
                                </button>
                                <button 
                                    onClick={() => setIsPreviewMode(true)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isPreviewMode ? 'nm-inset text-blue-500' : 'text-[var(--admin-text-muted)]'}`}
                                >
                                    Preview
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {!isPreviewMode ? (
                                <motion.div 
                                    key="editor"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-8"
                                >
                                    <FormField 
                                        label="Subject_Line *"
                                        placeholder="E.G. NEW ARTICLE: SCALING NODE.JS SERVICES"
                                        value={broadcastData.subject}
                                        onChange={(v) => setBroadcastData(prev => ({ ...prev, subject: v }))}
                                        icon={Sparkles}
                                    />
                                    
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em] ml-1">
                                            Payload_Body (HTML)
                                        </label>
                                        <div className="nm-inset rounded-[2rem] p-4 min-h-[400px]">
                                            <RichTextEditor 
                                                value={broadcastData.body}
                                                onChange={(v) => setBroadcastData(prev => ({ ...prev, body: v }))}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="preview"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <label className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em] ml-1">Subject_Preview</label>
                                        <div className="nm-inset rounded-2xl p-6 mt-2">
                                            <p className="text-lg font-bold text-[var(--admin-text-primary)]">{broadcastData.subject || "No Subject Defined"}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em] ml-1">Responsive_Preview</label>
                                        <div className="nm-inset rounded-[2.5rem] p-8 mt-2 bg-white text-gray-900 min-h-[400px] overflow-auto shadow-inner">
                                            <div dangerouslySetInnerHTML={{ __html: broadcastData.body || "<p class='text-gray-400 italic'>No content composed yet...</p>" }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    <div className="nm-flat rounded-[2.5rem] p-8 space-y-6 border border-[var(--nm-light)]">
                         <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 nm-inset rounded-xl flex items-center justify-center text-amber-500">
                                <AlertTriangle size={16} />
                            </div>
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--admin-text-secondary)]">Transmission_Safety</h2>
                        </div>
                        
                        <div className="space-y-4 text-[10px] font-bold text-[var(--admin-text-muted)] leading-relaxed uppercase tracking-widest">
                            <p className="flex gap-2">
                                <span className="text-emerald-500">✓</span> Verified {activeCount} targets
                            </p>
                            <p className="flex gap-2">
                                <span className="text-emerald-500">✓</span> Queue system active
                            </p>
                            <p className="flex gap-2">
                                <span className="text-blue-500">i</span> Resend API connected
                            </p>
                        </div>

                        <div className="pt-6 border-t border-[var(--nm-light)]">
                            <AdminButton 
                                variant="primary" 
                                onClick={handleBroadcast}
                                isLoading={isSending}
                                loadingText="BROADCASTING..."
                                icon={Send}
                                className="w-full h-20 text-lg italic tracking-tighter"
                                disabled={!broadcastData.subject || !broadcastData.body}
                            >
                                EXECUTE_SEND
                            </AdminButton>
                        </div>
                    </div>

                    <div className="nm-inset rounded-[2.5rem] p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <Eye size={16} className="text-blue-500/50" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Transmission_Guidelines</h3>
                        </div>
                        <ul className="space-y-2 text-[9px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                            <li>• Use H1 for clear section headers</li>
                            <li>• Keep text concise and punchy</li>
                            <li>• Double check links before sending</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
