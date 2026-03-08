import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PenTool, Plus, Trash2, Archive, Calendar } from 'lucide-react';
import { apiFetch } from '@/lib/api-helpers';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/admin/AdminShared";

interface WhiteboardSessionData {
    id: number;
    title: string;
    status: 'active' | 'archived';
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export const WhiteboardTab: React.FC = () => {
    const queryClient = useQueryClient();
    const [newTitle, setNewTitle] = useState('');

    const { data: sessions = [], isLoading } = useQuery({
        queryKey: ['admin-whiteboard'],
        queryFn: () => apiFetch('/admin/whiteboard/sessions'),
    });

    const createMutation = useMutation({
        mutationKey: ['create-whiteboard-session'],
        mutationFn: (title: string) => apiFetch('/whiteboard/sessions', { method: 'POST', body: JSON.stringify({ title }) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-whiteboard'] });
            setNewTitle('');
        },
    });

    const archiveMutation = useMutation({
        mutationKey: ['archive-whiteboard-session'],
        mutationFn: (id: number) => apiFetch(`/whiteboard/sessions/${id}/archive`, { method: 'PUT' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-whiteboard'] }),
    });

    const deleteMutation = useMutation({
        mutationKey: ['delete-whiteboard-session'],
        mutationFn: (id: number) => apiFetch(`/whiteboard/sessions/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-whiteboard'] }),
    });

    return (
        <div className="animate-fade-in p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "var(--font-display)" }}>
                    <PenTool className="w-6 h-6" /> Idea Canvas Sessions
                </h2>
            </div>

            <div className="flex gap-2 mb-8 bg-white/5 p-4 rounded-xl border border-white/10">
                <input
                    value={newTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                    placeholder="New session title..."
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && newTitle && createMutation.mutate(newTitle)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/20 focus:border-purple-500/50 outline-none transition-all"
                />
                <Button
                    onClick={() => newTitle && createMutation.mutate(newTitle)}
                    disabled={!newTitle || createMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-500/20"
                >
                    <Plus size={16} className="mr-2" /> Create
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12 text-white/40">
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {(sessions as WhiteboardSessionData[]).map((session) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                        >
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                                <PenTool size={20} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white truncate">{session.title}</div>
                                <div className="text-xs text-white/40 flex items-center gap-1.5 mt-1">
                                    <Calendar size={12} /> {new Date(session.updatedAt).toLocaleString()}
                                    {session.createdBy && <span className="opacity-60">· Created by {session.createdBy}</span>}
                                </div>
                            </div>

                            <Badge
                                variant="outline"
                                className={session.status === 'active'
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-white/5 text-white/40 border-white/10"
                                }
                            >
                                {session.status}
                            </Badge>

                            <div className="flex gap-1">
                                {session.status === 'active' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => archiveMutation.mutate(session.id)}
                                        title="Archive"
                                        className="text-white/40 hover:text-white"
                                    >
                                        <Archive size={16} />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        if (confirm("Delete this session?")) {
                                            deleteMutation.mutate(session.id);
                                        }
                                    }}
                                    title="Delete"
                                    className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                    {(sessions as WhiteboardSessionData[]).length === 0 && (
                        <EmptyState icon="🎨" text="No idea canvas sessions yet. Start exploring your ideas!" />
                    )}
                </div>
            )}
        </div>
    );
};
