import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Shield, Zap, Building2, TestTube, Accessibility, X, Loader2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { apiFetch } from '@/lib/api-helpers';

interface CodeReview {
    id: number;
    projectId: number;
    content: string;
    badges: string[];
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string | null;
    createdAt: string;
}

const BADGE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    security: { icon: <Shield size={14} />, color: 'var(--color-red, #ef4444)', label: 'Security' },
    performance: { icon: <Zap size={14} />, color: 'var(--color-amber, #f59e0b)', label: 'Performance' },
    architecture: { icon: <Building2 size={14} />, color: 'var(--color-blue, #3b82f6)', label: 'Architecture' },
    testing: { icon: <TestTube size={14} />, color: 'var(--color-green, #22c55e)', label: 'Testing' },
    accessibility: { icon: <Accessibility size={14} />, color: 'var(--color-purple, #8b5cf6)', label: 'Accessibility' },
};

interface CodeReviewDialogProps {
    projectId: number;
    isOpen: boolean;
    onClose: () => void;
}

export const CodeReviewDialog: React.FC<CodeReviewDialogProps> = ({ projectId, isOpen, onClose }) => {
    const [review, setReview] = useState<CodeReview | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const clearPoll = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };

    const fetchReview = async () => {
        try {
            const res = await apiFetch(`/projects/${projectId}/review`);
            if (res?.data) setReview(res.data);
        } catch {
            // No review yet
        }
    };

    const triggerReview = async () => {
        setLoading(true);
        setError(null);
        clearPoll();
        try {
            const res = await apiFetch(`/projects/${projectId}/review`, { method: 'POST' });
            if (res?.data) {
                setReview(res.data);
                // Poll for completion
                pollRef.current = setInterval(async () => {
                    const updated = await apiFetch(`/projects/${projectId}/review`);
                    if (updated?.data) {
                        setReview(updated.data);
                        if (updated.data.status === 'completed' || updated.data.status === 'failed') {
                            clearPoll();
                            setLoading(false);
                        }
                    }
                }, 3000);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchReview();
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                clearPoll();
            };
        }
        return clearPoll;
    }, [isOpen, projectId]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-surface-primary rounded-2xl max-w-[700px] w-full max-h-[80vh] overflow-auto p-8 border border-border-primary"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="review-dialog-title"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <Bot size={24} className="text-accent-primary" />
                            <h2 id="review-dialog-title" className="m-0 text-xl text-text-primary font-semibold">AI Project Analysis</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary transition-colors"
                            aria-label="Close dialog"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Badges */}
                    {review?.badges && review.badges.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-4" role="group" aria-label="Analysis highlights">
                            {review.badges.map((b) => {
                                const cfg = BADGE_CONFIG[b];
                                if (!cfg) return null;
                                return (
                                    <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border bg-slate-950/30"
                                        style={{
                                            color: cfg.color,
                                            borderColor: `${cfg.color}40`
                                        }}
                                        title={`Category: ${cfg.label}`}
                                    >
                                        <span aria-hidden="true">{cfg.icon}</span> {cfg.label}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* Content */}
                    {review?.status === 'completed' && (
                        <div className="text-text-secondary leading-loose text-sm prose prose-invert max-w-none">
                            <ReactMarkdown>{review.content}</ReactMarkdown>
                        </div>
                    )}

                    {review?.status === 'processing' && (
                        <div className="text-center py-12 text-text-secondary">
                            <Loader2 size={32} className="animate-spin mb-4 mx-auto" />
                            <p>Analyzing project structure...</p>
                        </div>
                    )}

                    {review?.status === 'failed' && (
                        <div className="text-center py-8 text-red-500">
                            <p>Analysis failed: {review.error || 'Unknown error'}</p>
                        </div>
                    )}

                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    {/* Actions */}
                    <div className="flex gap-3 mt-6 justify-end">
                        <button
                            onClick={triggerReview}
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-none bg-accent-primary text-white text-sm transition-opacity ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'
                                }`}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            {review ? 'Re-analyze Project' : 'Run Analysis'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
