import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Plus, Trash2, Copy, Check, UserCircle, Building, Mail } from 'lucide-react';
import { apiFetch } from '@/lib/api-helpers';

interface ClientData {
    id: number;
    name: string;
    email: string;
    company?: string | null;
    token: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export const ClientsTab: React.FC = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', company: '' });
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['admin-clients'],
        queryFn: () => apiFetch('/admin/clients'),
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof form) => apiFetch('/admin/clients', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-clients'] }); setShowForm(false); setForm({ name: '', email: '', company: '' }); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiFetch(`/admin/clients/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-clients'] }),
    });

    const copyToken = (client: ClientData) => {
        navigator.clipboard.writeText(client.token);
        setCopiedId(client.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, color: 'var(--text-primary)' }}>
                    <Users size={22} /> Client Management
                </h2>
                <button onClick={() => setShowForm(!showForm)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                    background: 'var(--accent-primary, #6366f1)', color: '#fff', cursor: 'pointer', fontSize: '0.875rem',
                }}>
                    <Plus size={16} /> Add Client
                </button>
            </div>

            {showForm && (
                <motion.form
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', borderRadius: '10px', background: 'var(--surface-secondary)' }}
                >
                    <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-primary)', background: 'var(--surface-primary)', color: 'var(--text-primary)' }} />
                    <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-primary)', background: 'var(--surface-primary)', color: 'var(--text-primary)' }} />
                    <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-primary)', background: 'var(--surface-primary)', color: 'var(--text-primary)' }} />
                    <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}>Create</button>
                </motion.form>
            )}

            {isLoading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(clients as ClientData[]).map((client) => (
                        <motion.div
                            key={client.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                                borderRadius: '10px', background: 'var(--surface-secondary)', border: '1px solid var(--border-primary)',
                            }}
                        >
                            <UserCircle size={36} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{client.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {client.email}</span>
                                    {client.company && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={12} /> {client.company}</span>}
                                </div>
                            </div>
                            <span style={{
                                padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
                                background: client.status === 'active' ? '#10b98120' : '#ef444420',
                                color: client.status === 'active' ? '#10b981' : '#ef4444',
                            }}>
                                {client.status}
                            </span>
                            <button onClick={() => copyToken(client)} title="Copy portal token" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                {copiedId === client.id ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
                            </button>
                            <button onClick={() => deleteMutation.mutate(client.id)} title="Delete client" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                    {(clients as ClientData[]).length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No clients yet. Click "Add Client" to get started.</p>
                    )}
                </div>
            )}
        </div>
    );
};
