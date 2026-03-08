import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Clock, MessageSquare, Send, CheckCircle2, Circle, Loader2, ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api-helpers';

interface ClientProject {
    id: number;
    title: string;
    status: 'not_started' | 'in_progress' | 'review' | 'completed';
    deadline?: string;
    notes?: string;
}

interface DashboardData {
    client: { name: string; email: string; company?: string };
    projects: ClientProject[];
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    not_started: { icon: <Circle size={14} />, color: '#6b7280', label: 'Not Started' },
    in_progress: { icon: <Loader2 size={14} />, color: '#3b82f6', label: 'In Progress' },
    review: { icon: <Clock size={14} />, color: '#f59e0b', label: 'In Review' },
    completed: { icon: <CheckCircle2 size={14} />, color: '#10b981', label: 'Completed' },
};

export const ClientPortal: React.FC = () => {
    const [token, setToken] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [selectedProject, setSelectedProject] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const authenticate = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/portal/dashboard`, {
                headers: { 'x-client-token': token },
            });
            if (!res.ok) throw new Error('Invalid token');
            const data = await res.json();
            setDashboard(data.data);
            setAuthenticated(true);
        } catch {
            setError('Invalid or expired token. Please contact the developer.');
        } finally {
            setLoading(false);
        }
    };

    const submitFeedback = async () => {
        if (!selectedProject || !feedbackMsg.trim()) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/portal/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-client-token': token },
                body: JSON.stringify({ clientProjectId: selectedProject, message: feedbackMsg }),
            });
            setFeedbackMsg('');
            setSelectedProject(null);
        } catch {
            // silently fail
        }
    };

    if (!authenticated) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary, #0a0a1a)' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', borderRadius: '16px', background: 'var(--surface-primary, #1a1a2e)', border: '1px solid var(--border-primary)' }}
                >
                    <h2 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Client Portal</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Enter your portal access token</p>
                    <input
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste your token here..."
                        onKeyDown={(e) => e.key === 'Enter' && authenticate()}
                        style={{
                            width: '100%', padding: '0.75rem', borderRadius: '8px',
                            border: '1px solid var(--border-primary)', background: 'var(--surface-secondary)',
                            color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '1rem', boxSizing: 'border-box',
                        }}
                    />
                    {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</p>}
                    <button
                        onClick={authenticate}
                        disabled={!token || loading}
                        style={{
                            width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none',
                            background: 'var(--accent-primary, #6366f1)', color: '#fff', cursor: 'pointer',
                            fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        }}
                    >
                        {loading ? <Loader2 size={16} className="spin" /> : <ArrowRight size={16} />}
                        Access Portal
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #0a0a1a)', padding: '2rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <LayoutDashboard size={28} style={{ color: 'var(--accent-primary)' }} />
                        <div>
                            <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem' }}>Welcome, {dashboard?.client.name}</h1>
                            <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{dashboard?.client.company || dashboard?.client.email}</p>
                        </div>
                    </div>

                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Your Projects</h3>
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        {dashboard?.projects.map((project, i) => {
                            const cfg = STATUS_CONFIG[project.status];
                            return (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    style={{
                                        padding: '1.25rem', borderRadius: '12px', background: 'var(--surface-secondary)',
                                        border: '1px solid var(--border-primary)', cursor: 'pointer',
                                        outline: selectedProject === project.id ? '2px solid var(--accent-primary)' : 'none',
                                    }}
                                    onClick={() => setSelectedProject(project.id)}
                                >
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{project.title}</div>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem',
                                        background: `${cfg.color}20`, color: cfg.color,
                                    }}>
                                        {cfg.icon} {cfg.label}
                                    </span>
                                    {project.deadline && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                            <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                            Due: {new Date(project.deadline).toLocaleDateString()}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Feedback Form */}
                    {selectedProject && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px', background: 'var(--surface-secondary)', border: '1px solid var(--border-primary)' }}
                        >
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: '0 0 1rem' }}>
                                <MessageSquare size={18} /> Send Feedback
                            </h4>
                            <textarea
                                value={feedbackMsg}
                                onChange={(e) => setFeedbackMsg(e.target.value)}
                                placeholder="Share your feedback, ideas, or concerns..."
                                rows={4}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                                    border: '1px solid var(--border-primary)', background: 'var(--surface-primary)',
                                    color: 'var(--text-primary)', resize: 'vertical', fontSize: '0.9rem', boxSizing: 'border-box',
                                }}
                            />
                            <button
                                onClick={submitFeedback}
                                disabled={!feedbackMsg.trim()}
                                style={{
                                    marginTop: '0.75rem', padding: '0.5rem 1.25rem', borderRadius: '8px',
                                    border: 'none', background: 'var(--accent-primary)', color: '#fff',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem',
                                }}
                            >
                                <Send size={14} /> Send
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};
