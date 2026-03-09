import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Trash2, Copy, Check, UserCircle, Building, Mail, X, Shield } from 'lucide-react';
import { apiFetch } from '@/lib/api-helpers';
import { cn } from '@/lib/utils';

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
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 nm-flat rounded-2xl text-primary">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter" style={{ fontFamily: "var(--font-display)" }}>
                            Client_Portal
                        </h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
                            Access Management &bull; {(clients as ClientData[]).length} Registered
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={cn(
                        "nm-button px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                        showForm ? "text-rose-500" : "text-primary"
                    )}
                >
                    {showForm ? <><X size={14} className="mr-2" /> Cancel</> : <><Plus size={14} className="mr-2" /> New_Client</>}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <form
                    onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
                    className="nm-inset rounded-[2rem] p-8 animate-in fade-in slide-in-from-top-4 duration-500"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 nm-flat rounded-xl flex items-center justify-center text-emerald-500">
                            <Shield size={16} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em]">Register New Client</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Name *</label>
                            <input
                                placeholder="Client name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                className="w-full nm-flat px-5 py-3.5 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Email *</label>
                            <input
                                placeholder="client@company.com"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="w-full nm-flat px-5 py-3.5 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Company</label>
                            <input
                                placeholder="Organization (optional)"
                                value={form.company}
                                onChange={(e) => setForm({ ...form, company: e.target.value })}
                                className="w-full nm-flat px-5 py-3.5 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="nm-button px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:nm-convex transition-all duration-300 disabled:opacity-50"
                        >
                            {createMutation.isPending ? "Registering..." : "Register_Client"}
                        </button>
                    </div>
                </form>
            )}

            {/* Client List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <span className="font-bold tracking-[0.3em] text-[10px] text-muted-foreground animate-pulse uppercase">Loading_Clients...</span>
                    </div>
                </div>
            ) : (clients as ClientData[]).length === 0 ? (
                <div className="nm-inset rounded-[3rem] p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full nm-flat flex items-center justify-center mb-6">
                        <Users className="w-8 h-8 opacity-20" />
                    </div>
                    <h4 className="font-black uppercase tracking-[0.3em] text-sm opacity-30">No Clients Registered</h4>
                    <p className="text-xs text-muted-foreground mt-3 max-w-xs opacity-50">Click "New_Client" to register your first portal user.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {(clients as ClientData[]).map((client, idx) => (
                        <div
                            key={client.id}
                            className="nm-flat p-6 flex flex-col sm:flex-row sm:items-center gap-6 group transition-all duration-300 hover:scale-[1.005] animate-in fade-in"
                            style={{ animationDelay: `${idx * 80}ms` }}
                        >
                            <div className="w-12 h-12 nm-inset rounded-2xl flex items-center justify-center text-primary shrink-0">
                                <UserCircle size={24} />
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <h3 className="font-bold tracking-tight text-lg">{client.name}</h3>
                                <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><Mail size={12} /> {client.email}</span>
                                    {client.company && <span className="flex items-center gap-1.5"><Building size={12} /> {client.company}</span>}
                                </div>
                            </div>

                            <div className={cn(
                                "nm-inset px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shrink-0",
                                client.status === 'active' ? "text-emerald-500" : "text-rose-500"
                            )}>
                                {client.status}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => copyToken(client)}
                                    title="Copy portal token"
                                    className="nm-button w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {copiedId === client.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(client.id)}
                                    title="Delete client"
                                    className="nm-button w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
