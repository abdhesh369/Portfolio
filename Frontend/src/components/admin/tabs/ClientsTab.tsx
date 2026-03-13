import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Trash2, Copy, Check, UserCircle, Building, Mail, X, Shield, Zap, FolderOpen, ChevronDown, ChevronUp, MessageSquare, Clock, Calendar } from 'lucide-react';
import { LoadingSkeleton, AdminButton, EmptyState, FormField } from '@/components/admin/AdminShared';
import { apiFetch } from '@/lib/api-helpers';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date';

interface ClientProject {
    id: number;
    title: string;
    status: string;
    deadline?: string;
    notes?: string;
}

interface ClientFeedback {
    id: number;
    message: string;
    createdAt: string;
}

const ClientProjectsView: React.FC<{ clientId: number }> = ({ clientId }) => {
    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['admin-client-projects', clientId],
        queryFn: () => apiFetch(`/api/v1/admin/clients/${clientId}/projects`).then(res => res.data)
    });

    const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);

    const { data: feedback = [], isLoading: loadingFeedback } = useQuery({
        queryKey: ['admin-client-feedback', expandedProjectId],
        queryFn: () => expandedProjectId ? apiFetch(`/api/v1/admin/client-projects/${expandedProjectId}/feedback`).then(res => res.data) : Promise.resolve([]),
        enabled: !!expandedProjectId
    });

    if (isLoading) return <div className="p-4 text-xs text-muted-foreground animate-pulse">Loading projects...</div>;
    
    if (projects.length === 0) {
        return <div className="p-4 text-xs text-muted-foreground italic">No projects assigned to this client yet.</div>;
    }

    return (
        <div className="space-y-3 p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 mt-4 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                <FolderOpen size={12} /> Active Projects ({projects.length})
            </h4>
            {projects.map((project: ClientProject) => {
                const isExpanded = expandedProjectId === project.id;
                return (
                    <div key={project.id} className={cn("border border-slate-800/60 rounded-lg overflow-hidden transition-all", isExpanded ? "bg-slate-900/80" : "bg-slate-950/30 hover:bg-slate-900/50")}>
                        <button 
                            onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                            className="w-full flex items-center justify-between p-3 text-left focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                <span className="font-bold text-sm text-slate-200">{project.title}</span>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border w-fit",
                                    project.status === 'completed' ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" :
                                    project.status === 'in_progress' ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/10" :
                                    project.status === 'review' ? "text-amber-400 border-amber-500/20 bg-amber-500/10" :
                                    "text-slate-400 border-slate-500/20 bg-slate-500/10"
                                )}>
                                    {project.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="text-muted-foreground">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="px-3 pb-3 pt-1 border-t border-slate-800/50 animate-in slide-in-from-top-1">
                                {project.deadline && (
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500/80 font-mono mb-3 uppercase font-bold tracking-widest">
                                        <Calendar size={10} /> Deadline: {formatDate(project.deadline)}
                                    </div>
                                )}
                                
                                <div className="space-y-2 mt-4">
                                    <h5 className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                                        <MessageSquare size={10} /> Client Feedback
                                    </h5>
                                    
                                    {loadingFeedback ? (
                                         <div className="text-xs text-muted-foreground animate-pulse pl-4">Loading feedback...</div>
                                    ) : feedback.length === 0 ? (
                                        <div className="text-xs text-slate-500 italic pl-4 border-l-2 border-slate-800 py-1">No feedback submitted yet.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {(feedback as ClientFeedback[]).map(f => (
                                                <div key={f.id} className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-lg relative">
                                                    <div className="absolute -left-[17px] top-4 w-4 h-[1px] bg-slate-800" />
                                                    <div className="text-xs text-slate-300 whitespace-pre-wrap">{f.message}</div>
                                                    <div className="mt-2 text-[9px] text-slate-500/80 font-mono flex items-center gap-1 uppercase font-bold">
                                                        <Clock size={8} /> {formatDate(f.createdAt)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

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
    const [newToken, setNewToken] = useState<string | null>(null);
    const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
    const [expandedClientId, setExpandedClientId] = useState<number | null>(null);

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['admin-clients'],
        queryFn: () => apiFetch('/api/v1/admin/clients'),
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof form) => apiFetch('/api/v1/admin/clients', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: (res) => { 
            queryClient.invalidateQueries({ queryKey: ['admin-clients'] }); 
            setShowForm(false); 
            setForm({ name: '', email: '', company: '' }); 
            setNewToken(res.rawToken);
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
        mutationFn: (id: number) => apiFetch(`/api/v1/admin/clients/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-clients'] }),
    });

    const regenerateMutation = useMutation({
        mutationFn: (id: number) => apiFetch(`/api/v1/admin/clients/${id}/regenerate-token`, { method: 'POST' }),
        onSuccess: (res) => {
            setNewToken(res.rawToken);
            setRegeneratingId(null);
            toast({ title: "Success", description: "Token regenerated successfully." });
        },
        onError: (err: any) => {
            setRegeneratingId(null);
            let description = err instanceof Error ? err.message : "An error occurred";
            toast({ title: "Regeneration Failed", description, variant: "destructive" });
        }
    });

    const copyToken = (client: ClientData) => {
        navigator.clipboard.writeText(client.token);
        setCopiedId(client.id);
        toast({ title: "Copied", description: "Token hash copied to clipboard." });
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
                        <div key={client.id} className="w-full">
                        <div
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
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete client "${client.name}"? They will lose access to the portal permanently.`)) {
                                            deleteMutation.mutate(client.id);
                                        }
                                    }}
                                    variant="secondary"
                                    icon={Trash2}
                                    className="nm-button w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors"
                                    title="Delete client"
                                >
                                </AdminButton>

                                <AdminButton
                                    onClick={() => setExpandedClientId(expandedClientId === client.id ? null : client.id)}
                                    variant="secondary"
                                    icon={FolderOpen}
                                    className={cn("nm-button w-10 h-10 rounded-xl flex items-center justify-center transition-colors", expandedClientId === client.id ? "text-indigo-500 nm-inset" : "text-muted-foreground hover:text-indigo-400")}
                                    title="View projects & feedback"
                                >
                                </AdminButton>

                                <AdminButton
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to regenerate the token for "${client.name}"? The existing token will be permanently invalidated immediately.`)) {
                                            setRegeneratingId(client.id);
                                            regenerateMutation.mutate(client.id);
                                        }
                                    }}
                                    isLoading={regenerateMutation.isPending && regeneratingId === client.id}
                                    variant="secondary"
                                    icon={Zap}
                                    className="nm-button w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-amber-500 transition-colors"
                                    title="Regenerate token"
                                >
                                </AdminButton>
                            </div>
                        </div>
                        
                        {/* Render Expanded Projects View */}
                        {expandedClientId === client.id && (
                            <div className="w-full mt-4">
                                <ClientProjectsView clientId={client.id} />
                            </div>
                        )}
                        </div>
                    ))}
                </div>
            )}

            {/* New Token Modal */}
            {newToken && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="nm-flat max-w-md w-full p-8 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                        
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 nm-inset rounded-2xl text-emerald-500">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                                    PORTAL_ACCESS_TOKEN
                                </h3>
                            </div>
                            <button 
                                onClick={() => setNewToken(null)}
                                className="nm-button w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-6 italic">
                            IMPORTANT: Copy this token now. It is hashed and cannot be retrieved again.
                        </p>

                        <div className="nm-inset p-5 rounded-2xl bg-slate-900/50 flex flex-col items-center gap-4">
                            <code className="text-lg font-mono text-emerald-500 break-all text-center select-all">
                                {newToken}
                            </code>
                            <AdminButton
                                onClick={() => {
                                    navigator.clipboard.writeText(newToken);
                                    toast({ title: "Copied", description: "Token copied to clipboard." });
                                }}
                                variant="primary"
                                icon={Copy}
                                className="nm-button w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500"
                            >
                                Copy_Access_Token
                            </AdminButton>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <AdminButton
                                onClick={() => setNewToken(null)}
                                className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                            >
                                Close_Terminal
                            </AdminButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
