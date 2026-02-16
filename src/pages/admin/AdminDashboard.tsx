import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/hooks/auth-context";
import { useProjects, useSkills, useExperiences } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { Project, Skill, Experience, Message } from "@shared/schema";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const API_BASE_URL = import.meta.env.DEV
    ? "http://localhost:5000"
    : (import.meta.env.VITE_API_URL || "http://localhost:5000");

type Tab = "overview" | "messages" | "projects" | "skills" | "experiences";

/* =================================================================== */
/* Helpers                                                              */
/* =================================================================== */

function authHeaders(token: string | null) {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
}

async function apiFetch(path: string, token: string | null, opts: RequestInit = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...opts,
        headers: { ...authHeaders(token), ...(opts.headers as Record<string, string> ?? {}) },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `Request failed (${res.status})`);
    }
    if (res.status === 204) return null;
    return res.json();
}

/* =================================================================== */
/* Dashboard Page                                                       */
/* =================================================================== */

export default function AdminDashboard() {
    const [tab, setTab] = useState<Tab>("overview");
    const { logout, token } = useAuth();

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: "overview", label: "Overview", icon: "📊" },
        { key: "messages", label: "Messages", icon: "✉️" },
        { key: "projects", label: "Projects", icon: "🚀" },
        { key: "skills", label: "Skills", icon: "⚡" },
        { key: "experiences", label: "Experiences", icon: "💼" },
    ];

    return (
        <div className="min-h-screen" style={{ background: "hsl(224 71% 4%)" }}>
            {/* ============ TOP NAV ============ */}
            <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl"
                style={{ background: "hsl(222 47% 11% / 0.8)" }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-sm font-bold text-white">
                            A
                        </div>
                        <span className="text-white font-semibold text-sm hidden sm:block"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Admin Panel
                        </span>
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${tab === t.key
                                    ? "bg-white/10 text-white"
                                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                                    }`}
                            >
                                <span className="mr-1.5">{t.icon}</span>
                                <span className="hidden sm:inline">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <Button variant="ghost" size="sm" onClick={logout}
                        className="text-white/50 hover:text-white text-xs"
                    >
                        Logout
                    </Button>
                </div>
            </nav>

            {/* ============ CONTENT ============ */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {tab === "overview" && <OverviewTab token={token} />}
                {tab === "messages" && <MessagesTab token={token} />}
                {tab === "projects" && <ProjectsTab token={token} />}
                {tab === "skills" && <SkillsTab token={token} />}
                {tab === "experiences" && <ExperiencesTab token={token} />}
            </main>
        </div>
    );
}

/* =================================================================== */
/* OVERVIEW TAB                                                         */
/* =================================================================== */

function OverviewTab({ token }: { token: string | null }) {
    const { data: projects } = useProjects();
    const { data: skills } = useSkills();
    const { data: experiences } = useExperiences();
    const [msgCount, setMsgCount] = useState<number | null>(null);

    useEffect(() => {
        apiFetch("/api/messages", token).then((d: Message[]) => setMsgCount(d?.length ?? 0)).catch(() => setMsgCount(0));
    }, [token]);

    const stats = [
        { label: "Projects", value: projects?.length ?? "—", icon: "🚀", color: "from-purple-500 to-indigo-600" },
        { label: "Messages", value: msgCount ?? "—", icon: "✉️", color: "from-emerald-500 to-teal-600" },
        { label: "Skills", value: skills?.length ?? "—", icon: "⚡", color: "from-amber-500 to-orange-600" },
        { label: "Experiences", value: experiences?.length ?? "—", icon: "💼", color: "from-rose-500 to-pink-600" },
    ];

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                Dashboard Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/10 p-5 relative overflow-hidden"
                        style={{ background: "hsl(222 47% 11% / 0.6)" }}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl bg-gradient-to-br ${s.color}`} />
                        <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
                        <p className="text-sm text-white/50 flex items-center gap-1.5">
                            <span>{s.icon}</span> {s.label}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-8 rounded-xl border border-white/10 p-6" style={{ background: "hsl(222 47% 11% / 0.4)" }}>
                <h3 className="text-lg font-semibold text-white mb-3">Quick Tips</h3>
                <ul className="space-y-2 text-sm text-white/60">
                    <li>💡 Use the <strong className="text-white/80">Messages</strong> tab to view and manage visitor inquiries.</li>
                    <li>📝 Add new projects, skills, and experiences directly from their tabs.</li>
                    <li>🔒 Your session expires after 24 hours — just log in again.</li>
                    <li>🔗 No public link points to <code className="text-purple-400">/admin</code> — it's hidden by design.</li>
                </ul>
            </div>
        </div>
    );
}

/* =================================================================== */
/* MESSAGES TAB                                                         */
/* =================================================================== */

function MessagesTab({ token }: { token: string | null }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const { toast } = useToast();

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} messages?`)) return;
        try {
            await apiFetch("/api/messages/bulk-delete", token, { method: "POST", body: JSON.stringify({ ids: selectedIds }) });
            toast({ title: "Messages deleted" });
            setSelectedIds([]);
            fetchMessages();
        } catch (err: any) {
            toast({ title: "Bulk delete failed", description: err.message, variant: "destructive" });
        }
    };

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const data = await apiFetch("/api/messages", token);
            setMessages(data ?? []);
        } catch {
            toast({ title: "Failed to load messages", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMessages(); }, [token]);

    const deleteMessage = async (id: number) => {
        if (!confirm("Delete this message?")) return;
        try {
            await apiFetch(`/api/messages/${id}`, token, { method: "DELETE" });
            setMessages((prev) => prev.filter((m) => m.id !== id));
            toast({ title: "Message deleted" });
        } catch (err: any) {
            toast({ title: "Delete failed", description: err.message, variant: "destructive" });
        }
    };

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Messages <Badge variant="secondary" className="ml-2">{messages.length}</Badge>
                </h2>
                <Button variant="outline" size="sm" onClick={fetchMessages} className="text-white/60">Refresh</Button>
            </div>

            {messages.length === 0 ? (
                <EmptyState icon="✉️" text="No messages yet" />
            ) : (
                <div className="space-y-3">
                    {messages.map((msg) => (
                        <div key={msg.id} className="rounded-xl border border-white/10 p-4 flex flex-col md:flex-row md:items-start gap-4 group hover:border-white/20 transition-colors"
                            style={{ background: "hsl(222 47% 11% / 0.5)" }}
                        >
                            <div className="flex items-center self-start pt-0.5">
                                <div
                                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${selectedIds.includes(msg.id) ? "bg-purple-500 border-purple-500" : "border-white/20 hover:border-white/40"}`}
                                    onClick={() => toggleSelect(msg.id)}
                                >
                                    {selectedIds.includes(msg.id) && <span className="text-white text-xs">✓</span>}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-white text-sm">{msg.name}</span>
                                    <span className="text-xs text-white/40">{msg.email}</span>
                                </div>
                                {msg.subject && <p className="text-xs text-purple-400 mb-1">{msg.subject}</p>}
                                <p className="text-sm text-white/70 break-words">{msg.message}</p>
                                <p className="text-xs text-white/30 mt-2">{new Date(msg.createdAt).toLocaleString()}</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => deleteMessage(msg.id)}
                                className="opacity-60 group-hover:opacity-100 transition-opacity shrink-0"
                            >
                                Delete
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] border border-white/10 rounded-full shadow-2xl px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in">
                    <span className="text-sm font-medium text-white">{selectedIds.length} selected</span>
                    <div className="h-4 w-px bg-white/10" />
                    <Button size="sm" variant="destructive" className="h-8" onClick={handleBulkDelete}>Delete Selected</Button>
                    <Button size="sm" variant="ghost" className="h-8 text-white/50" onClick={() => setSelectedIds([])}>✕</Button>
                </div>
            )}
        </div>
    );
}

/* =================================================================== */
/* PROJECTS TAB                                                         */
/* =================================================================== */

const emptyProject = {
    title: "", description: "", techStack: [] as string[], imageUrl: "",
    githubUrl: "", liveUrl: "", category: "", status: "Completed",
    problemStatement: "", motivation: "", systemDesign: "", challenges: "", learnings: "",
};

function SortableProjectItem({ project, onEdit, onDelete, isSelected, onToggleSelect }: {
    project: Project,
    onEdit: (p: Project) => void,
    onDelete: (id: number) => void,
    isSelected: boolean,
    onToggleSelect: (id: number) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const statusColors: Record<string, string> = {
        "In Progress": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        "Completed": "bg-green-500/10 text-green-400 border-green-500/20",
        "Archived": "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="rounded-xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center gap-4 group hover:border-white/20 transition-colors bg-card/50 cursor-move touch-none"
        >
            <div className="flex items-center gap-3 pl-2">
                <div
                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${isSelected ? "bg-purple-500 border-purple-500" : "border-white/20 hover:border-white/40"}`}
                    onClick={(e) => { e.stopPropagation(); onToggleSelect(project.id); }}
                >
                    {isSelected && <span className="text-white text-xs">✓</span>}
                </div>
                <div className="w-8 h-8 flex items-center justify-center text-white/20 group-hover:text-white/40 transition-colors">
                    ⋮⋮
                </div>
            </div>
            <img src={project.imageUrl} alt={project.title} className="w-16 h-16 rounded-lg object-cover shrink-0 bg-white/5" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white text-sm">{project.title}</p>
                    {project.status && (
                        <Badge variant="outline" className={`text-[10px] border ${statusColors[project.status] || "border-white/10"}`}>
                            {project.status}
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-white/40 mt-0.5">{project.category}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                    {(project.techStack ?? []).slice(0, 4).map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] text-white/50 border-white/10">{t}</Badge>
                    ))}
                </div>
            </div>
            <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(project); }} className="text-white/60 pointer-events-auto">Edit</Button>
                <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(project.id); }} className="opacity-60 group-hover:opacity-100 pointer-events-auto">Delete</Button>
            </div>
        </div>
    );
}

function ProjectsTab({ token }: { token: string | null }) {
    const { data: projects, refetch } = useProjects();
    const { toast } = useToast();
    const [editing, setEditing] = useState<(Partial<Project> & typeof emptyProject) | null>(null);
    const [saving, setSaving] = useState(false);
    const [techInput, setTechInput] = useState("");
    const [orderedProjects, setOrderedProjects] = useState<Project[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} projects?`)) return;
        try {
            await apiFetch("/api/projects/bulk-delete", token, { method: "POST", body: JSON.stringify({ ids: selectedIds }) });
            toast({ title: "Projects deleted" });
            setSelectedIds([]);
            refetch();
        } catch (err: any) {
            toast({ title: "Bulk delete failed", description: err.message, variant: "destructive" });
        }
    };

    const handleBulkStatus = async (status: string) => {
        try {
            await apiFetch("/api/projects/bulk-status", token, { method: "POST", body: JSON.stringify({ ids: selectedIds, status }) });
            toast({ title: "Projects updated" });
            setSelectedIds([]);
            refetch();
        } catch (err: any) {
            toast({ title: "Bulk update failed", description: err.message, variant: "destructive" });
        }
    };

    useEffect(() => {
        if (projects) setOrderedProjects(projects);
    }, [projects]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setOrderedProjects((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Save order to backend
                const orderedIds = newItems.map(p => p.id);
                apiFetch('/api/projects/reorder', token, {
                    method: 'PUT',
                    body: JSON.stringify({ orderedIds })
                }).catch(err => toast({ title: "Failed to save order", variant: "destructive" }));

                return newItems;
            });
        }
    };

    const openNew = () => { setEditing({ ...emptyProject }); setTechInput(""); };
    const openEdit = (p: Project) => {
        setEditing({
            ...p,
            status: p.status || "Completed",
            githubUrl: p.githubUrl ?? "",
            liveUrl: p.liveUrl ?? "",
            problemStatement: p.problemStatement ?? "",
            motivation: p.motivation ?? "",
            systemDesign: p.systemDesign ?? "",
            challenges: p.challenges ?? "",
            learnings: p.learnings ?? "",
        });
        setTechInput((p.techStack ?? []).join(", "));
    };

    const save = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        const body = {
            ...editing,
            techStack: techInput.split(",").map((s) => s.trim()).filter(Boolean),
            githubUrl: editing.githubUrl || null,
            liveUrl: editing.liveUrl || null,
        };
        try {
            if (editing.id) {
                await apiFetch(`/api/projects/${editing.id}`, token, { method: "PUT", body: JSON.stringify(body) });
                toast({ title: "Project updated" });
            } else {
                await apiFetch("/api/projects", token, { method: "POST", body: JSON.stringify(body) });
                toast({ title: "Project created" });
            }
            setEditing(null);
            refetch();
        } catch (err: any) {
            toast({ title: "Save failed", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const deleteProject = async (id: number) => {
        if (!confirm("Delete this project?")) return;
        try {
            await apiFetch(`/api/projects/${id}`, token, { method: "DELETE" });
            toast({ title: "Project deleted" });
            refetch();
        } catch (err: any) {
            toast({ title: "Delete failed", description: err.message, variant: "destructive" });
        }
    };

    if (editing) {
        return (
            <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                    {editing.id ? "Edit Project" : "New Project"}
                </h2>
                <form onSubmit={save} className="space-y-4 max-w-2xl">
                    <FormField label="Title *" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} required />
                    <RichTextEditor label="Description *" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} className="mb-4" />
                    <ImageUpload label="Project Image *" value={editing.imageUrl} onChange={(v) => setEditing({ ...editing, imageUrl: v })} className="mb-4" />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Category *" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} required />
                        <div>
                            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Status</label>
                            <select
                                value={editing.status || "Completed"}
                                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-lg text-white text-sm bg-[hsl(224_71%_4%_/_0.5)] border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all outline-none"
                            >
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <FormField label="Tech Stack (comma-separated)" value={techInput} onChange={setTechInput} />
                    <FormField label="GitHub URL" value={editing.githubUrl ?? ""} onChange={(v) => setEditing({ ...editing, githubUrl: v })} />
                    <FormField label="Live URL" value={editing.liveUrl ?? ""} onChange={(v) => setEditing({ ...editing, liveUrl: v })} />

                    <div className="space-y-4 pt-2">
                        <RichTextEditor label="Problem Statement" value={editing.problemStatement ?? ""} onChange={(v) => setEditing({ ...editing, problemStatement: v })} />
                        <RichTextEditor label="Motivation" value={editing.motivation ?? ""} onChange={(v) => setEditing({ ...editing, motivation: v })} />
                        <RichTextEditor label="System Design" value={editing.systemDesign ?? ""} onChange={(v) => setEditing({ ...editing, systemDesign: v })} />
                        <RichTextEditor label="Challenges" value={editing.challenges ?? ""} onChange={(v) => setEditing({ ...editing, challenges: v })} />
                        <RichTextEditor label="Learnings" value={editing.learnings ?? ""} onChange={(v) => setEditing({ ...editing, learnings: v })} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : (editing.id ? "Update" : "Create")}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setEditing(null)} className="text-white/50">Cancel</Button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Projects <Badge variant="secondary" className="ml-2">{projects?.length ?? 0}</Badge>
                </h2>
                <Button size="sm" onClick={openNew}>+ Add Project</Button>
            </div>

            {!orderedProjects.length ? <EmptyState icon="🚀" text="No projects yet" /> : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={orderedProjects} strategy={verticalListSortingStrategy}>
                        <div className="grid gap-3">
                            {orderedProjects.map((p) => (
                                <SortableProjectItem
                                    key={p.id}
                                    project={p}
                                    onEdit={openEdit}
                                    onDelete={deleteProject}
                                    isSelected={selectedIds.includes(p.id)}
                                    onToggleSelect={toggleSelect}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] border border-white/10 rounded-full shadow-2xl px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in">
                    <span className="text-sm font-medium text-white">{selectedIds.length} selected</span>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-white/70 hover:text-white h-8" onClick={() => handleBulkStatus("In Progress")}>In Progress</Button>
                        <Button size="sm" variant="ghost" className="text-white/70 hover:text-white h-8" onClick={() => handleBulkStatus("Completed")}>Completed</Button>
                        <Button size="sm" variant="ghost" className="text-white/70 hover:text-white h-8" onClick={() => handleBulkStatus("Archived")}>Archived</Button>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <Button size="sm" variant="destructive" className="h-8" onClick={handleBulkDelete}>Delete</Button>
                    <Button size="sm" variant="ghost" className="h-8 text-white/50" onClick={() => setSelectedIds([])}>✕</Button>
                </div>
            )}
        </div>
    );
}

/* =================================================================== */
/* SKILLS TAB                                                           */
/* =================================================================== */

const emptySkill = { name: "", category: "", status: "Core", icon: "Code", description: "", proof: "", x: 50, y: 50 };

function SkillsTab({ token }: { token: string | null }) {
    const { data: skills, refetch } = useSkills();
    const { toast } = useToast();
    const [editing, setEditing] = useState<(Partial<Skill> & typeof emptySkill) | null>(null);
    const [saving, setSaving] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} skills?`)) return;
        try {
            await apiFetch("/api/skills/bulk-delete", token, { method: "POST", body: JSON.stringify({ ids: selectedIds }) });
            toast({ title: "Skills deleted" });
            setSelectedIds([]);
            refetch();
        } catch (err: any) {
            toast({ title: "Bulk delete failed", description: err.message, variant: "destructive" });
        }
    };

    const save = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        try {
            if (editing.id) {
                await apiFetch(`/api/skills/${editing.id}`, token, { method: "PUT", body: JSON.stringify(editing) });
                toast({ title: "Skill updated" });
            } else {
                await apiFetch("/api/skills", token, { method: "POST", body: JSON.stringify(editing) });
                toast({ title: "Skill created" });
            }
            setEditing(null);
            refetch();
        } catch (err: any) {
            toast({ title: "Save failed", description: err.message, variant: "destructive" });
        } finally { setSaving(false); }
    };

    const deleteSkill = async (id: number) => {
        if (!confirm("Delete this skill?")) return;
        try {
            await apiFetch(`/api/skills/${id}`, token, { method: "DELETE" });
            toast({ title: "Skill deleted" });
            refetch();
        } catch (err: any) {
            toast({ title: "Delete failed", description: err.message, variant: "destructive" });
        }
    };

    if (editing) {
        return (
            <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                    {editing.id ? "Edit Skill" : "New Skill"}
                </h2>
                <form onSubmit={save} className="space-y-4 max-w-2xl">
                    <FormField label="Name *" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} required />
                    <FormField label="Category *" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} placeholder="e.g. Frontend, Backend, Tools" required />
                    <FormField label="Status" value={editing.status} onChange={(v) => setEditing({ ...editing, status: v })} placeholder="Core, Learning, etc." />
                    <FormField label="Icon" value={editing.icon} onChange={(v) => setEditing({ ...editing, icon: v })} placeholder="Lucide icon name" />
                    <FormTextarea label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} />
                    <FormTextarea label="Proof" value={editing.proof} onChange={(v) => setEditing({ ...editing, proof: v })} />

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={saving}>{saving ? "Saving..." : (editing.id ? "Update" : "Create")}</Button>
                        <Button type="button" variant="ghost" onClick={() => setEditing(null)} className="text-white/50">Cancel</Button>
                    </div>
                </form>
            </div>
        );
    }

    // Group skills by category
    const grouped: Record<string, Skill[]> = {};
    (skills ?? []).forEach((s) => {
        (grouped[s.category] ??= []).push(s);
    });

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Skills <Badge variant="secondary" className="ml-2">{skills?.length ?? 0}</Badge>
                </h2>
                <Button size="sm" onClick={() => setEditing({ ...emptySkill })}>+ Add Skill</Button>
            </div>

            {!skills?.length ? <EmptyState icon="⚡" text="No skills yet" /> : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([cat, items]) => (
                        <div key={cat}>
                            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">{cat}</h3>
                            <div className="grid gap-2">
                                {items.map((s) => (
                                    <div key={s.id} className="rounded-xl border border-white/10 px-4 py-3 flex items-center gap-3 group hover:border-white/20 transition-colors"
                                        style={{ background: "hsl(222 47% 11% / 0.5)" }}
                                    >
                                        <div
                                            className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${selectedIds.includes(s.id) ? "bg-purple-500 border-purple-500" : "border-white/20 hover:border-white/40"}`}
                                            onClick={() => toggleSelect(s.id)}
                                        >
                                            {selectedIds.includes(s.id) && <span className="text-white text-xs">✓</span>}
                                        </div>
                                        <div className="flex-1 flex items-center gap-3">
                                            <span className="text-white font-medium text-sm">{s.name}</span>
                                            <Badge variant="outline" className="text-[10px] text-white/40 border-white/10">{s.status}</Badge>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <Button variant="outline" size="sm" onClick={() => setEditing({ ...s })} className="text-white/60">Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => deleteSkill(s.id)} className="opacity-60 group-hover:opacity-100">Delete</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] border border-white/10 rounded-full shadow-2xl px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in">
                    <span className="text-sm font-medium text-white">{selectedIds.length} selected</span>
                    <div className="h-4 w-px bg-white/10" />
                    <Button size="sm" variant="destructive" className="h-8" onClick={handleBulkDelete}>Delete Selected</Button>
                    <Button size="sm" variant="ghost" className="h-8 text-white/50" onClick={() => setSelectedIds([])}>✕</Button>
                </div>
            )}
        </div>
    );
}

/* =================================================================== */
/* EXPERIENCES TAB                                                      */
/* =================================================================== */

const emptyExperience = { role: "", organization: "", period: "", description: "", type: "Experience" };

function ExperiencesTab({ token }: { token: string | null }) {
    const { data: experiences, refetch } = useExperiences();
    const { toast } = useToast();
    const [editing, setEditing] = useState<(Partial<Experience> & typeof emptyExperience) | null>(null);
    const [saving, setSaving] = useState(false);

    const save = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        try {
            if (editing.id) {
                await apiFetch(`/api/experiences/${editing.id}`, token, { method: "PUT", body: JSON.stringify(editing) });
                toast({ title: "Experience updated" });
            } else {
                await apiFetch("/api/experiences", token, { method: "POST", body: JSON.stringify(editing) });
                toast({ title: "Experience created" });
            }
            setEditing(null);
            refetch();
        } catch (err: any) {
            toast({ title: "Save failed", description: err.message, variant: "destructive" });
        } finally { setSaving(false); }
    };

    const deleteExp = async (id: number) => {
        if (!confirm("Delete this experience?")) return;
        try {
            await apiFetch(`/api/experiences/${id}`, token, { method: "DELETE" });
            toast({ title: "Experience deleted" });
            refetch();
        } catch (err: any) {
            toast({ title: "Delete failed", description: err.message, variant: "destructive" });
        }
    };

    if (editing) {
        return (
            <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                    {editing.id ? "Edit Experience" : "New Experience"}
                </h2>
                <form onSubmit={save} className="space-y-4 max-w-2xl">
                    <FormField label="Role *" value={editing.role} onChange={(v) => setEditing({ ...editing, role: v })} required />
                    <FormField label="Organization *" value={editing.organization} onChange={(v) => setEditing({ ...editing, organization: v })} required />
                    <FormField label="Period *" value={editing.period} onChange={(v) => setEditing({ ...editing, period: v })} placeholder="e.g. Jan 2024 – Present" required />
                    <FormTextarea label="Description *" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} required />
                    <FormField label="Type" value={editing.type} onChange={(v) => setEditing({ ...editing, type: v })} placeholder="Experience, Education, etc." />

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={saving}>{saving ? "Saving..." : (editing.id ? "Update" : "Create")}</Button>
                        <Button type="button" variant="ghost" onClick={() => setEditing(null)} className="text-white/50">Cancel</Button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Experiences <Badge variant="secondary" className="ml-2">{experiences?.length ?? 0}</Badge>
                </h2>
                <Button size="sm" onClick={() => setEditing({ ...emptyExperience })}>+ Add Experience</Button>
            </div>

            {!experiences?.length ? <EmptyState icon="💼" text="No experiences yet" /> : (
                <div className="space-y-3">
                    {experiences.map((exp) => (
                        <div key={exp.id} className="rounded-xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-start gap-4 group hover:border-white/20 transition-colors"
                            style={{ background: "hsl(222 47% 11% / 0.5)" }}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm">{exp.role}</p>
                                <p className="text-xs text-purple-400">{exp.organization}</p>
                                <p className="text-xs text-white/40 mt-0.5">{exp.period}</p>
                                <p className="text-sm text-white/60 mt-2 line-clamp-2">{exp.description}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Button variant="outline" size="sm" onClick={() => setEditing({ ...exp })} className="text-white/60">Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteExp(exp.id)} className="opacity-60 group-hover:opacity-100">Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* =================================================================== */
/* SHARED UI PRIMITIVES                                                 */
/* =================================================================== */

function FormField({ label, value, onChange, placeholder, required }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-white/25
          border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20
          transition-all outline-none"
                style={{ background: "hsl(224 71% 4% / 0.5)" }}
            />
        </div>
    );
}

function FormTextarea({ label, value, onChange, required }: {
    label: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-white/25
          border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20
          transition-all outline-none resize-y"
                style={{ background: "hsl(224 71% 4% / 0.5)" }}
            />
        </div>
    );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
    return (
        <div className="text-center py-16">
            <p className="text-4xl mb-3">{icon}</p>
            <p className="text-sm text-white/40">{text}</p>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-white/5 p-5 h-24" style={{ background: "hsl(222 47% 11% / 0.3)" }} />
            ))}
        </div>
    );
}
