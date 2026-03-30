import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Plus, Trash2, Archive, Calendar } from 'lucide-react';
import { apiFetch } from '#src/lib/api-helpers';
import { Badge } from "#src/components/ui/badge";
import { AdminButton, LoadingSkeleton, EmptyState, FormField } from "#src/components/admin/AdminShared";
import { formatDate } from '#src/lib/utils/date';
import { QUERY_KEYS } from '#src/lib/query-keys';

interface SketchpadSessionData {
    id: number;
    title: string;
    status: 'active' | 'archived';
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export const SketchpadTab: React.FC = () => {
    const queryClient = useQueryClient();
    const [newTitle, setNewTitle] = useState('');

    const { data: sessions = [], isLoading } = useQuery({
        queryKey: QUERY_KEYS.sketchpad.admin,
        queryFn: () => apiFetch('/api/v1/admin/sketchpad/sessions'),
    });

    const createMutation = useMutation({
        mutationKey: ['create-sketchpad-session'],
        mutationFn: (title: string) => apiFetch('/api/v1/sketchpad/sessions', { method: 'POST', body: JSON.stringify({ title }) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sketchpad.admin });
            setNewTitle('');
        },
    });

    const archiveMutation = useMutation({
        mutationKey: ['archive-sketchpad-session'],
        mutationFn: (id: number) => apiFetch(`/api/v1/sketchpad/sessions/${id}/archive`, { method: 'PUT' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sketchpad.admin }),
    });

    const deleteMutation = useMutation({
        mutationKey: ['delete-sketchpad-session'],
        mutationFn: (id: number) => apiFetch(`/api/v1/sketchpad/sessions/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sketchpad.admin }),
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 nm-inset rounded-xl flex items-center justify-center text-purple-500">
                            <PenTool size={20} strokeWidth={3} />
                        </div>
                        <h1 className="text-4xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic">
                            Sketchpad
                        </h1>
                    </div>
                    <p className="text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 ml-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                        Active_Modules: Ideas_Inbound
                    </p>
                </div>
            </div>

            {/* Creation Engine */}
            <div className="nm-card p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-3">
                        <FormField
                            label="Session Identifier"
                            value={newTitle}
                            onChange={(val) => setNewTitle(val)}
                            placeholder="e.g. Project 'X' Brainstorm"
                            icon={PenTool}
                        />
                    </div>
                    <AdminButton
                        onClick={() => newTitle && createMutation.mutate(newTitle)}
                        isLoading={createMutation.isPending}
                        disabled={!newTitle.trim()}
                        variant="primary"
                        icon={Plus}
                        className="h-[54px]"
                    >
                        Initialize
                    </AdminButton>
                </div>
            </div>

            {/* Session Feed */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <LoadingSkeleton key={i} className="h-24 w-full" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence mode="popLayout">
                            {(sessions as SketchpadSessionData[]).map((session) => (
                                <motion.div
                                    key={session.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="nm-card p-6 flex items-center gap-6 group hover:translate-x-1 transition-transform"
                                >
                                    <div className="w-14 h-14 nm-inset rounded-2xl flex items-center justify-center text-purple-400 group-hover:text-purple-300 transition-colors">
                                        <PenTool size={24} strokeWidth={2.5} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-black text-[var(--admin-text-primary)] tracking-tight truncate uppercase italic">
                                                {session.title}
                                            </h3>
                                            <Badge
                                                variant="outline"
                                                className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border-2 rounded-md ${session.status === 'active'
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                                    : "bg-white/5 text-slate-500 border-white/5"
                                                    }`}
                                            >
                                                {session.status}
                                            </Badge>
                                        </div>
                                        <div className="text-[10px] text-[var(--admin-text-secondary)] font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={12} strokeWidth={3} className="text-indigo-500/50" />
                                            {formatDate(session.updatedAt)}
                                            {session.createdBy && (
                                                <span className="flex items-center gap-2 text-slate-500">
                                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                    Operator: {session.createdBy}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {session.status === 'active' && (
                                            <AdminButton
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => archiveMutation.mutate(session.id)}
                                                isLoading={archiveMutation.isPending}
                                                icon={Archive}
                                                title="Archive Session"
                                                className="w-10 h-10 p-0 flex items-center justify-center"
                                            />
                                        )}
                                        <AdminButton
                                            variant="danger"
                                            size="sm"
                                            onClick={() => {
                                                if (window.confirm("CRITICAL_ACTION: Erase this session data?")) {
                                                    deleteMutation.mutate(session.id);
                                                }
                                            }}
                                            isLoading={deleteMutation.isPending}
                                            icon={Trash2}
                                            title="Delete Session"
                                            className="w-10 h-10 p-0 flex items-center justify-center"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {(sessions as SketchpadSessionData[]).length === 0 && (
                            <EmptyState
                                icon={PenTool}
                                text="System standby. No active thought nodes detected."
                                className="nm-card py-20"
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

