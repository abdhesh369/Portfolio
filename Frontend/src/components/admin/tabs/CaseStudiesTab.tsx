import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Trash2, Sparkles, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { apiFetch } from '@/lib/api-helpers';

interface CaseStudyData {
    id: number;
    projectId: number;
    title: string;
    slug: string;
    content: string;
    status: 'draft' | 'published';
    generatedAt?: string;
    createdAt: string;
}

interface ProjectData {
    id: number;
    title: string;
}

export const CaseStudiesTab: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: studies = [], isLoading } = useQuery({
        queryKey: ['admin-case-studies'],
        queryFn: () => apiFetch('/admin/case-studies'),
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['admin-projects'],
        queryFn: () => apiFetch('/admin/projects'),
    });

    const generateMutation = useMutation({
        mutationFn: (projectId: number) => apiFetch(`/case-studies/generate/${projectId}`, { method: 'POST' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-case-studies'] }),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            apiFetch(`/case-studies/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-case-studies'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiFetch(`/case-studies/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-case-studies'] }),
    });

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, color: 'var(--text-primary)' }}>
                    <FileText size={22} /> Case Studies
                </h2>
            </div>

            {/* Generate from Project */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '10px', background: 'var(--surface-secondary)', border: '1px solid var(--border-primary)' }}>
                <p style={{ margin: '0 0 0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Generate a case study from an existing project:</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(projects as ProjectData[]).map((p) => (
                        <button
                            key={p.id}
                            onClick={() => generateMutation.mutate(p.id)}
                            disabled={generateMutation.isPending}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-primary)',
                                background: 'var(--surface-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.8rem',
                            }}
                        >
                            <Sparkles size={12} /> {p.title}
                        </button>
                    ))}
                </div>
                {generateMutation.isPending && <p style={{ margin: '0.5rem 0 0', color: 'var(--accent-primary)', fontSize: '0.8rem' }}>Generating with AI...</p>}
            </div>

            {isLoading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(studies as CaseStudyData[]).map((study) => (
                        <motion.div
                            key={study.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                                borderRadius: '10px', background: 'var(--surface-secondary)', border: '1px solid var(--border-primary)',
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{study.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                    /case-studies/{study.slug} · {new Date(study.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <span style={{
                                padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
                                background: study.status === 'published' ? '#10b98120' : '#f59e0b20',
                                color: study.status === 'published' ? '#10b981' : '#f59e0b',
                            }}>
                                {study.status}
                            </span>
                            <button
                                onClick={() => toggleStatusMutation.mutate({ id: study.id, status: study.status === 'published' ? 'draft' : 'published' })}
                                title={study.status === 'published' ? 'Unpublish' : 'Publish'}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                            >
                                {study.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button onClick={() => deleteMutation.mutate(study.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                    {(studies as CaseStudyData[]).length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No case studies yet. Generate one from a project above.</p>
                    )}
                </div>
            )}
        </div>
    );
};
