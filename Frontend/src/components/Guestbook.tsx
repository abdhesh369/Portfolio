import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, User, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useGuestbook, useSubmitGuestbook } from "@/hooks/use-portfolio";
import type { GuestbookEntry } from "@shared/schema";

export const Guestbook = () => {
    const { data: entries = [], isLoading: loading } = useGuestbook();
    const submitMutation = useSubmitGuestbook();

    const [message, setMessage] = useState("");
    const [name, setName] = useState("");
    const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim()) return;

        setStatus(null);

        try {
            await submitMutation.mutateAsync({ name, content: message });
            setStatus({ type: 'success', text: "Message sent! It will appear once approved." });
            setMessage("");
            setName("");
        } catch (err: any) {
            setStatus({ type: 'error', text: err.message || "Something went wrong." });
        }
    };

    const isSubmitting = submitMutation.isPending;

    return (
        <section id="guestbook" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col items-center mb-12 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            className="p-3 rounded-2xl bg-primary/10 mb-4"
                        >
                            <MessageSquare className="w-8 h-8 text-primary" />
                        </motion.div>
                        <h2 className="text-4xl font-bold mb-4 tracking-tighter">Guestbook</h2>
                        <p className="text-muted-foreground text-lg max-w-xl">
                            Leave a message, some feedback, or just say hello!
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 sticky top-24">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block tracking-wider">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                            placeholder="Ghost...?"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block tracking-wider">
                                            Message
                                        </label>
                                        <textarea
                                            rows={4}
                                            className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none"
                                            placeholder="Share your thoughts!"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {status && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-destructive/10 text-destructive'
                                                    }`}
                                            >
                                                {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                                {status.text}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group"
                                    >
                                        {isSubmitting ? "Sending..." : "Post Message"}
                                        <Send className={`w-4 h-4 transition-transform ${isSubmitting ? '' : 'group-hover:translate-x-1 group-hover:-translate-y-1'}`} />
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* List */}
                        <div className="lg:col-span-3 space-y-6">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="animate-pulse bg-card/30 rounded-2xl p-6 space-y-3">
                                        <div className="h-4 bg-secondary/50 rounded w-1/4" />
                                        <div className="h-12 bg-secondary/50 rounded w-full" />
                                    </div>
                                ))
                            ) : entries.length === 0 ? (
                                <div className="text-center py-12 bg-card/10 rounded-2xl border border-dashed border-border/50">
                                    <p className="text-muted-foreground italic">No messages yet. Be the first!</p>
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {entries.map((entry: GuestbookEntry, index: number) => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-6 hover:border-primary/30 transition-colors group"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <span className="font-bold text-foreground/90">{entry.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground text-sm leading-relaxed italic">
                                                "{entry.content}"
                                            </p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
