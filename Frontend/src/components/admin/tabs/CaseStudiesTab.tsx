import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Trash2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '@/lib/api-helpers';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/AdminShared";

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
        <div className="animate-fade-in p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "var(--font-display)" }}>
                    <FileText className="w-6 h-6" /> Case Studies
                </h2>
            </div>

            {/* Generate from Project */}
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-white/60 mb-3">Generate a case study from an existing project:</p>
                <div className="flex flex-wrap gap-2">
                    {(projects as ProjectData[]).map((p) => (
                        <Button
                            key={p.id}
                            variant="outline"
                            size="sm"
                            onClick={() => generateMutation.mutate(p.id)}
                            disabled={generateMutation.isPending}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            <Sparkles className="w-3 h-3 mr-2" /> {p.title}
                        </Button>
                    ))}
                </div>
                {generateMutation.isPending && (
                    <p className="mt-2 text-sm text-purple-400 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 animate-pulse" /> Generating with AI...
                    </p>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <p className="text-white/40">Loading...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {(studies as CaseStudyData[]).map((study) => (
                        <motion.div
                            key={study.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white mb-1">{study.title}</div>
                                <div className="text-xs text-white/40">
                                    /case-studies/{study.slug} · {new Date(study.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={study.status === 'published'
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }
                            >
                                {study.status}
                            </Badge>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleStatusMutation.mutate({
                                        id: study.id,
                                        status: study.status === 'published' ? 'draft' : 'published'
                                    })}
                                    title={study.status === 'published' ? 'Unpublish' : 'Publish'}
                                    className="text-white/40 hover:text-white"
                                >
                                    {study.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteMutation.mutate(study.id)}
                                    title="Delete"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                    {(studies as CaseStudyData[]).length === 0 && (
                        <EmptyState icon="📝" text="No case studies yet. Generate one from a project above." />
                    )}
                </div>
            )}
        </div>
    );
};
