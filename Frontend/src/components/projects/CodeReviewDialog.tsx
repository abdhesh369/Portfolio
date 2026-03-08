import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Shield, Zap, Building2, TestTube, Accessibility, X, Loader2, RefreshCw } from 'lucide-react';
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
    security: { icon: <Shield size={14} />, color: '#ef4444', label: 'Security' },
    performance: { icon: <Zap size={14} />, color: '#f59e0b', label: 'Performance' },
    architecture: { icon: <Building2 size={14} />, color: '#3b82f6', label: 'Architecture' },
    testing: { icon: <TestTube size={14} />, color: '#10b981', label: 'Testing' },
    accessibility: { icon: <Accessibility size={14} />, color: '#8b5cf6', label: 'Accessibility' },
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
        try {
            const res = await apiFetch(`/projects/${projectId}/review`, { method: 'POST' });
            if (res?.data) {
                setReview(res.data);
                // Poll for completion
                const poll = setInterval(async () => {
                    const updated = await apiFetch(`/projects/${projectId}/review`);
                    if (updated?.data) {
                        setReview(updated.data);
                        if (updated.data.status === 'completed' || updated.data.status === 'failed') {
                            clearInterval(poll);
                            setLoading(false);
                        }
                    }
                }, 3000);
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchReview();
    }, [isOpen, projectId]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="code-review-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'var(--surface-primary, #1a1a2e)', borderRadius: '16px',
                        maxWidth: '700px', width: '100%', maxHeight: '80vh', overflow: 'auto',
                        padding: '2rem', border: '1px solid var(--border-primary, rgba(255,255,255,0.1))',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Bot size={24} style={{ color: 'var(--accent-primary, #6366f1)' }} />
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary, #fff)' }}>AI Code Review</h2>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary, #888)' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Badges */}
                    {review?.badges && review.badges.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            {review.badges.map((b) => {
                                const cfg = BADGE_CONFIG[b];
                                if (!cfg) return null;
                                return (
                                    <span key={b} style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem',
                                        background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40`,
                                    }}>
                                        {cfg.icon} {cfg.label}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* Content */}
                    {review?.status === 'completed' && (
                        <div
                            style={{ color: 'var(--text-secondary, #ccc)', lineHeight: 1.7, fontSize: '0.9rem' }}
                            dangerouslySetInnerHTML={{ __html: review.content.replace(/\n/g, '<br/>') }}
                        />
                    )}

                    {review?.status === 'processing' && (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary, #888)' }}>
                            <Loader2 size={32} className="spin" style={{ marginBottom: '1rem' }} />
                            <p>Analyzing your code...</p>
                        </div>
                    )}

                    {review?.status === 'failed' && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                            <p>Review failed: {review.error || 'Unknown error'}</p>
                        </div>
                    )}

                    {error && <p style={{ color: '#ef4444' }}>{error}</p>}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                        <button
                            onClick={triggerReview}
                            disabled={loading}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                                background: 'var(--accent-primary, #6366f1)', color: '#fff',
                                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                                fontSize: '0.875rem',
                            }}
                        >
                            {loading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
                            {review ? 'Re-analyze' : 'Run AI Review'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
