import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PenTool, Plus, Trash2, Archive, ExternalLink, Calendar } from 'lucide-react';
import { apiFetch } from '@/lib/api-helpers';

interface WhiteboardSessionData {
    id: number;
    title: string;
    status: 'active' | 'archived';
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export const WhiteboardTab: React.FC = () => {
    const queryClient = useQueryClient();
    const [newTitle, setNewTitle] = useState('');

    const { data: sessions = [], isLoading } = useQuery({
        queryKey: ['admin-whiteboard'],
        queryFn: () => apiFetch('/admin/whiteboard/sessions'),
    });

    const createMutation = useMutation({
        mutationFn: (title: string) => apiFetch('/whiteboard/sessions', { method: 'POST', body: JSON.stringify({ title }) }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-whiteboard'] }); setNewTitle(''); },
    });

    const archiveMutation = useMutation({
        mutationFn: (id: number) => apiFetch(`/whiteboard/sessions/${id}/archive`, { method: 'PUT' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-whiteboard'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiFetch(`/whiteboard/sessions/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-whiteboard'] }),
    });

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, color: 'var(--text-primary)' }}>
                    <PenTool size={22} /> Whiteboard Sessions
                </h2>
            </div>

            {/* Create new session */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="New session title..."
                    onKeyDown={(e) => e.key === 'Enter' && newTitle && createMutation.mutate(newTitle)}
                    style={{
                        flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px',
                        border: '1px solid var(--border-primary)', background: 'var(--surface-secondary)',
                        color: 'var(--text-primary)', fontSize: '0.9rem',
                    }}
                />
                <button
                    onClick={() => newTitle && createMutation.mutate(newTitle)}
                    disabled={!newTitle || createMutation.isPending}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                        background: 'var(--accent-primary, #6366f1)', color: '#fff',
                        cursor: 'pointer', fontSize: '0.875rem',
                    }}
                >
                    <Plus size={16} /> Create
                </button>
            </div>

            {isLoading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(sessions as WhiteboardSessionData[]).map((session) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                                borderRadius: '10px', background: 'var(--surface-secondary)', border: '1px solid var(--border-primary)',
                            }}
                        >
                            <PenTool size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{session.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                    <Calendar size={12} /> {new Date(session.updatedAt).toLocaleString()}
                                    {session.createdBy && <span>· {session.createdBy}</span>}
                                </div>
                            </div>
                            <span style={{
                                padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
                                background: session.status === 'active' ? '#10b98120' : '#6b728020',
                                color: session.status === 'active' ? '#10b981' : '#6b7280',
                            }}>
                                {session.status}
                            </span>
                            {session.status === 'active' && (
                                <button onClick={() => archiveMutation.mutate(session.id)} title="Archive" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <Archive size={16} />
                                </button>
                            )}
                            <button onClick={() => deleteMutation.mutate(session.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                    {(sessions as WhiteboardSessionData[]).length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No whiteboard sessions yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};
