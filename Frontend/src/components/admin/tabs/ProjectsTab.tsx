import React, { useState, useEffect, type FormEvent } from "react";
import { useProjects } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { apiFetch } from "@/lib/api-helpers";
import { FormField, EmptyState } from "@/components/admin/AdminShared";
import type { Project } from "@shared/schema";
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

export function ProjectsTab({ token }: { token: string | null }) {
    const { data: projects, refetch } = useProjects();
    const { toast } = useToast();
    const [editing, setEditing] = useState<(Partial<Project> & typeof emptyProject) | null>(null);
    const [saving, setSaving] = useState(false);
    const [techInput, setTechInput] = useState("");
    const [orderedProjects, setOrderedProjects] = useState<Project[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

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

    const filtered = orderedProjects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.techStack?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white shrink-0" style={{ fontFamily: "var(--font-display)" }}>
                    Projects <Badge variant="secondary" className="ml-2">{projects?.length ?? 0}</Badge>
                </h2>
                <div className="flex flex-1 max-w-md gap-3">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">🔍</span>
                        <input
                            type="text"
                            placeholder="Search title, category, or tech..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-purple-500 outline-none transition-all"
                        />
                    </div>
                    <Button size="sm" onClick={openNew}>+ Add Project</Button>
                </div>
            </div>

            {!filtered.length ? (
                <EmptyState icon="🔍" text={searchQuery ? "No matches found" : "No projects yet"} />
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filtered} strategy={verticalListSortingStrategy}>
                        <div className="grid gap-3">
                            {filtered.map((p) => (
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
