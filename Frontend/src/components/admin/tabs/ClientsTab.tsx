import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Trash2, Copy, Check, UserCircle, Building, Mail, X, Shield, Zap, FolderOpen, ChevronDown, ChevronUp, MessageSquare, Clock, Calendar, Edit2, Save } from 'lucide-react';
import { LoadingSkeleton, AdminButton, EmptyState, FormField } from '@/components/admin/AdminShared';
import { apiFetch } from '@/lib/api-helpers';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date';
import { QUERY_KEYS } from '@/lib/query-keys';

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
    isAdmin: boolean;
    createdAt: string;
}

const ClientProjectsView: React.FC<{ clientId: number }> = ({ clientId }) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [replyText, setReplyText] = useState("");
    const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);

    const { data: projects = [], isLoading } = useQuery({
        queryKey: QUERY_KEYS.clients.projects(clientId),
        queryFn: () => apiFetch(`/api/v1/admin/clients/${clientId}/projects`).then(res => res.data)
    });

    const { data: feedback = [], isLoading: loadingFeedback } = useQuery({
        queryKey: QUERY_KEYS.clients.feedback(expandedProjectId!),
        queryFn: () => expandedProjectId ? apiFetch(`/api/v1/admin/client-projects/${expandedProjectId}/feedback`).then(res => res.data) : Promise.resolve([]),
        enabled: !!expandedProjectId
    });

    const replyMutation = useMutation({
        mutationFn: (data: { projectId: number, message: string }) => 
            apiFetch(`/api/v1/admin/client-projects/${data.projectId}/feedback`, { 
                method: 'POST', 
                body: JSON.stringify({ message: data.message }) 
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients.feedback(expandedProjectId!) });
            setReplyText("");
            toast({ title: "Sent", description: "Admin reply sent successfully." });
        }
    });

    const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<{ status: string; deadline: string }>({ status: '', deadline: '' });
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [createProjectForm, setCreateProjectForm] = useState({ title: '', status: 'not_started', deadline: '', notes: '' });

    const updateProjectMutation = useMutation({
        mutationFn: (data: { id: number; status: string; deadline?: string }) => 
            apiFetch(`/api/v1/admin/client-projects/${data.id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients.projects(clientId) });
            setEditingProjectId(null);
            toast({ title: "Updated", description: "Project updated successfully." });
        }
    });

    const createProjectMutation = useMutation({
        mutationFn: (data: typeof createProjectForm) => 
            apiFetch(`/api/v1/admin/client-projects`, {
                method: 'POST',
                body: JSON.stringify({ ...data, clientId, deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined })
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients.projects(clientId) });
            setShowCreateProject(false);
            setCreateProjectForm({ title: '', status: 'not_started', deadline: '', notes: '' });
            toast({ title: "Created", description: "New project assigned successfully." });
        }
    });

    const requestTestimonialMutation = useMutation({
        mutationFn: (projectId: number) => 
            apiFetch(`/api/v1/admin/clients/${clientId}/request-testimonial`, {
                method: 'POST',
                body: JSON.stringify({ projectId })
            }),
        onSuccess: () => {
            toast({ title: "Request Sent", description: "Testimonial request email sent to client." });
        },
        onError: (err: any) => {
            toast({ title: "Request Failed", description: err.message || "Failed to send request", variant: "destructive" });
        }
    });

    if (isLoading) return <div className="p-4 text-xs text-muted-foreground animate-pulse">Loading projects...</div>;
    
    if (projects.length === 0) {
        return <div className="p-4 text-xs text-muted-foreground italic">No projects assigned to this client yet.</div>;
    }

    const handleSendReply = (projectId: number) => {
        if (!replyText.trim()) return;
        replyMutation.mutate({ projectId, message: replyText });
    };

    const startEditing = (project: ClientProject) => {
        setEditingProjectId(project.id);
        setEditForm({ 
            status: project.status, 
            deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '' 
        });
    };

    const handleSaveUpdate = (id: number) => {
        updateProjectMutation.mutate({ 
            id, 
            status: editForm.status, 
            deadline: editForm.deadline ? new Date(editForm.deadline).toISOString() : undefined 
        });
    };

    return (
        <div className="space-y-3 p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 mt-4 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                <FolderOpen size={12} /> Active Projects ({projects.length})
            </h4>
            {projects.map((project: ClientProject) => {
                const isExpanded = expandedProjectId === project.id;
                const isEditing = editingProjectId === project.id;
                
                return (
                    <div key={project.id} className={cn("border border-slate-800/60 rounded-lg overflow-hidden transition-all", isExpanded ? "bg-slate-900/80" : "bg-slate-950/30 hover:bg-slate-900/50")}>
                        <div className="w-full flex items-center p-3">
                            <button 
                                onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                                className="flex-1 flex items-center justify-between text-left focus:outline-none"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                    <span className="font-bold text-sm text-slate-200">{project.title}</span>
                                    {!isEditing && (
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border w-fit",
                                            project.status === 'completed' ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" :
                                            project.status === 'in_progress' ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/10" :
                                            project.status === 'review' ? "text-amber-400 border-amber-500/20 bg-amber-500/10" :
                                            "text-slate-400 border-slate-500/20 bg-slate-500/10"
                                        )}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    )}
                                </div>
                            </button>
                            
                            <div className="flex items-center gap-2 ml-4">
                                {!isEditing ? (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); startEditing(project); }}
                                        className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500 hover:text-indigo-400 transition-colors"
                                        title="Edit project"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleSaveUpdate(project.id); }}
                                        disabled={updateProjectMutation.isPending}
                                        className="p-1.5 hover:bg-emerald-500/20 rounded-md text-emerald-500 transition-colors"
                                        title="Save changes"
                                    >
                                        <Save size={12} />
                                    </button>
                                )}
                                {project.status === 'completed' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); requestTestimonialMutation.mutate(project.id); }}
                                        disabled={requestTestimonialMutation.isPending}
                                        className="p-1.5 hover:bg-emerald-500/20 rounded-md text-emerald-400 transition-colors"
                                        title="Request Testimonial"
                                    >
                                        <Mail size={12} />
                                    </button>
                                )}
                                <div className="text-muted-foreground ml-1">
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Status</label>
                                    <select 
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none"
                                    >
                                        <option value="not_started">Not Started</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="review">Review</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Deadline</label>
                                    <input 
                                        type="date"
                                        value={editForm.deadline}
                                        onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 color-scheme-dark"
                                    />
                                </div>
                                <div className="sm:col-span-2 flex justify-end gap-2 mt-1">
                                    <button 
                                        onClick={() => setEditingProjectId(null)}
                                        className="text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {isExpanded && (
                            <div className="px-3 pb-3 pt-1 border-t border-slate-800/50 animate-in slide-in-from-top-1">
                                {project.deadline && !isEditing && (
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500/80 font-mono mb-3 uppercase font-bold tracking-widest">
                                        <Calendar size={10} /> Deadline: {project.deadline ? formatDate(project.deadline) : "N/A"}
                                    </div>
                                )}
                                
                                <div className="space-y-4 mt-4">
                                    <h5 className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                                        <MessageSquare size={10} /> Feedback Timeline
                                    </h5>
                                    
                                    {loadingFeedback ? (
                                         <div className="text-xs text-muted-foreground animate-pulse pl-4">Loading feedback...</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {feedback.length === 0 ? (
                                                <div className="text-xs text-slate-500 italic pl-4 border-l-2 border-slate-800 py-1">No feedback submitted yet.</div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {(feedback as ClientFeedback[]).map(f => (
                                                        <div key={f.id} className={cn(
                                                            "p-3 rounded-xl relative border max-w-[90%] transition-all",
                                                            f.isAdmin 
                                                                ? "bg-indigo-500/10 border-indigo-500/20 ml-auto rounded-tr-none" 
                                                                : "bg-slate-950/50 border-slate-800/80 mr-auto rounded-tl-none"
                                                        )}>
                                                            <div className={cn(
                                                                "text-[8px] font-black uppercase tracking-tighter mb-1",
                                                                f.isAdmin ? "text-indigo-400" : "text-slate-500"
                                                            )}>
                                                                {f.isAdmin ? "YOU (ADMIN)" : "CLIENT"}
                                                            </div>
                                                            <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{f.message}</div>
                                                            <div className="mt-2 text-[8px] text-slate-500/60 font-mono flex items-center gap-1 uppercase font-bold">
                                                                <Clock size={8} /> {f.createdAt ? formatDate(f.createdAt) : "Recently"}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Admin Reply Input */}
                                            <div className="pt-4 border-t border-slate-800/40">
                                                <div className="flex gap-2">
                                                    <textarea 
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Write a reply..."
                                                        className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder:text-slate-600 resize-none h-20"
                                                    />
                                                </div>
                                                <div className="flex justify-end mt-2">
                                                    <AdminButton 
                                                        onClick={() => handleSendReply(project.id)}
                                                        isLoading={replyMutation.isPending}
                                                        icon={Zap}
                                                        className="nm-button text-[10px] px-4 py-2 rounded-lg text-indigo-400 font-bold uppercase tracking-widest hover:text-indigo-300 h-8"
                                                    >
                                                        Send Reply
                                                    </AdminButton>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Create Project Form */}
            <div className="mt-4 pt-4 border-t border-slate-800/40">
                {!showCreateProject ? (
                    <button 
                        onClick={() => setShowCreateProject(true)}
                        className="w-full py-3 rounded-lg border border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group flex items-center justify-center gap-2"
                    >
                        <Plus size={14} className="text-slate-500 group-hover:text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-400">Assign New Project</span>
                    </button>
                ) : (
                    <div className="bg-slate-950/50 border border-indigo-500/20 rounded-xl p-4 animate-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">New Project Details</h5>
                            <button onClick={() => setShowCreateProject(false)} className="text-slate-500 hover:text-white"><X size={14} /></button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Project Title</label>
                                <input 
                                    type="text"
                                    value={createProjectForm.title}
                                    onChange={(e) => setCreateProjectForm({ ...createProjectForm, title: e.target.value })}
                                    placeholder="e.g. Website Overhaul v2"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Initial Status</label>
                                <select 
                                    value={createProjectForm.status}
                                    onChange={(e) => setCreateProjectForm({ ...createProjectForm, status: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none"
                                >
                                    <option value="not_started">Not Started</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="review">Review</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Deadline</label>
                                <input 
                                    type="date"
                                    value={createProjectForm.deadline}
                                    onChange={(e) => setCreateProjectForm({ ...createProjectForm, deadline: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 color-scheme-dark"
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Notes (Optional)</label>
                                <textarea 
                                    value={createProjectForm.notes}
                                    onChange={(e) => setCreateProjectForm({ ...createProjectForm, notes: e.target.value })}
                                    placeholder="Technical details, links, etc."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none h-20"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-3">
                            <AdminButton 
                                onClick={() => createProjectMutation.mutate(createProjectForm)}
                                isLoading={createProjectMutation.isPending}
                                icon={Zap}
                                className="nm-button text-[10px] px-6 py-2.5 rounded-lg text-emerald-400 font-bold uppercase tracking-widest hover:text-emerald-300 h-9"
                            >
                                Create Project
                            </AdminButton>
                        </div>
                    </div>
                )}
            </div>
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
        queryKey: QUERY_KEYS.clients.all,
        queryFn: () => apiFetch('/api/v1/admin/clients'),
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof form) => apiFetch('/api/v1/admin/clients', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: (res) => { 
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients.all }); 
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
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients.all }),
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
                                    toast({ title: "Copied", description: "Portal token copied to clipboard." });
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
