import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Trash2, Copy, Check, UserCircle, Building, Mail, X, Shield } from 'lucide-react';
import { LoadingSkeleton, AdminButton, EmptyState, FormField } from '@/components/admin/AdminShared';
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
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', company: '' });
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['admin-clients'],
        queryFn: () => apiFetch('/admin/clients'),
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof form) => apiFetch('/admin/clients', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => { 
            queryClient.invalidateQueries({ queryKey: ['admin-clients'] }); 
            setShowForm(false); 
            setForm({ name: '', email: '', company: '' }); 
            toast({ title: "Success", description: "Client created successfully." });
        },
        onError: (err: any) => {
            let description = err instanceof Error ? err.message : "An error occurred";
            if (err.data && Array.isArray(err.data.errors)) {
                description += " - " + err.data.errors.map((e: any) => `${e.path}: ${e.message}`).join(", ");
            }
            toast({ title: "Creation Failed", description, variant: "destructive" });
        }
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
                <AdminButton
                    onClick={() => setShowForm(prev => !prev)}
                    variant={showForm ? "secondary" : "primary"}
                    icon={showForm ? X : Plus}
                    className={cn(
                        "nm-button px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                        showForm ? "text-rose-500" : "text-primary"
                    )}
                >
                    {showForm ? "Cancel" : "New_Client"}
                </AdminButton>
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
                        <FormField
                            label="NAME"
                            value={form.name}
                            onChange={(val: string) => setForm(prev => ({ ...prev, name: val }))}
                            placeholder="Client name"
                            required
                        />
                        <FormField
                            label="EMAIL"
                            type="email"
                            value={form.email}
                            onChange={(val: string) => setForm(prev => ({ ...prev, email: val }))}
                            placeholder="client@company.com"
                            required
                        />
                        <FormField
                            label="COMPANY"
                            value={form.company || ''}
                            onChange={(val: string) => setForm(prev => ({ ...prev, company: val }))}
                            placeholder="Organization (optional)"
                        />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <AdminButton
                            type="submit"
                            isLoading={createMutation.isPending}
                            loadingText="Registering..."
                            className="nm-button px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:nm-convex transition-all duration-300"
                        >
                            Register_Client
                        </AdminButton>
                    </div>
                </form>
            )}

            {isLoading ? (
                <LoadingSkeleton />
            ) : (clients as ClientData[]).length === 0 ? (
                <EmptyState
                    icon={Users}
                    text="No Clients Registered. Click 'New_Client' to register your first portal user."
                />
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
                                <AdminButton
                                    onClick={() => copyToken(client)}
                                    variant="secondary"
                                    icon={copiedId === client.id ? Check : Copy}
                                    iconClassName={copiedId === client.id ? "text-emerald-500" : ""}
                                    className="nm-button w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                                    title="Copy portal token"
                                >
                                </AdminButton>
                                <AdminButton
                                    onClick={() => deleteMutation.mutate(client.id)}
                                    variant="secondary"
                                    icon={Trash2}
                                    className="nm-button w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors"
                                    title="Delete client"
                                >
                                </AdminButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
