import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    FileText, Trash2, Sparkles, Eye, EyeOff,
    ChevronRight, Layout, AlertCircle, Plus, Search
} from 'lucide-react';
import { apiFetch } from '@/lib/api-helpers';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/AdminShared";
import { cn } from "@/lib/utils";

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

import type { AdminTabProps } from "./types";

export const CaseStudiesTab: React.FC<AdminTabProps> = () => {
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
        <div className="animate-in fade-in duration-700 space-y-10">
            {/* Soft Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 nm-inset rounded-xl flex items-center justify-center text-indigo-500">
                            <Sparkles size={20} strokeWidth={3} />
                        </div>
                        <h1 className="text-4xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic">
                            Case_Studies
                        </h1>
                    </div>
                    <p className="text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 ml-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                        IA_Generator: Ready
                    </p>
                </div>
            </div>

            {/* AI Generation Control Pod */}
            <div className="nm-flat p-8 rounded-3xl space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 nm-inset rounded-lg flex items-center justify-center text-purple-500">
                        <Plus size={16} strokeWidth={3} />
                    </div>
                    <h3 className="text-[11px] font-black text-[var(--admin-text-primary)] uppercase tracking-[0.3em] italic">Generate_New_Protocol</h3>
                </div>

                <div className="flex flex-wrap gap-4">
                    {(projects as ProjectData[]).map((p) => (
                        <button
                            key={p.id}
                            onClick={() => generateMutation.mutate(p.id)}
                            disabled={generateMutation.isPending}
                            className="nm-button nm-button-primary h-12 px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 disabled:opacity-50"
                        >
                            <Sparkles size={14} className={generateMutation.isPending ? "animate-spin" : ""} />
                            {p.title}
                        </button>
                    ))}
                    {projects.length === 0 && (
                        <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest italic py-2 px-4 nm-inset rounded-xl">
                            No active projects available for distillation
                        </p>
                    )}
                </div>

                {generateMutation.isPending && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 nm-inset rounded-2xl border border-purple-500/20"
                    >
                        <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em]">Neural_Processing_Active</p>
                            <p className="text-[9px] text-[var(--admin-text-muted)] font-bold uppercase tracking-wider">Distilling project data into case study structure...</p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* List Section */}
            {isLoading ? (
                <div className="grid gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="h-24 nm-flat rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {(studies as CaseStudyData[]).map((study) => (
                        <motion.div
                            key={study.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="nm-flat p-6 flex flex-col md:flex-row items-center gap-6 group transition-all relative overflow-hidden"
                        >
                            <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
                                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                                    <h4 className="text-lg font-black text-[var(--admin-text-primary)] truncate uppercase tracking-tight">
                                        {study.title}
                                    </h4>
                                    <span className={cn(
                                        "text-[9px] font-black px-2 py-0.5 rounded-full nm-inset",
                                        study.status === 'published' ? "text-emerald-500" : "text-amber-500"
                                    )}>
                                        {study.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest justify-center md:justify-start">
                                    <span className="flex items-center gap-1.5">
                                        <ChevronRight size={12} className="text-indigo-400" />
                                        /case-studies/{study.slug}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Layout size={12} />
                                        PROJ_{study.projectId}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <FileText size={12} />
                                        {new Date(study.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4 shrink-0">
                                <button
                                    onClick={() => toggleStatusMutation.mutate({
                                        id: study.id,
                                        status: study.status === 'published' ? 'draft' : 'published'
                                    })}
                                    className={cn(
                                        "w-12 h-12 nm-button rounded-2xl flex items-center justify-center hover:scale-110 transition-all",
                                        study.status === 'published' ? "text-emerald-500" : "text-amber-500"
                                    )}
                                    title={study.status === 'published' ? 'Unpublish' : 'Publish'}
                                >
                                    {study.status === 'published' ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(study.id)}
                                    className="w-12 h-12 nm-button rounded-2xl text-rose-500 flex items-center justify-center hover:scale-110 transition-transform"
                                    title="Terminate Entry"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {(studies as CaseStudyData[]).length === 0 && (
                        <div className="nm-flat p-24 text-center">
                            <EmptyState
                                icon={<FileText size={48} className="opacity-20" />}
                                text="No distilled case studies indexed. Use the generator above."
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
