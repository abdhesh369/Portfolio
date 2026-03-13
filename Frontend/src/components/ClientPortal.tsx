import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Clock, MessageSquare, Send, CheckCircle2, Circle, Loader2, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils/date';
import { API_BASE_URL } from '@/lib/api-helpers';

interface ClientProject {
    id: number;
    title: string;
    status: 'not_started' | 'in_progress' | 'review' | 'completed';
    deadline?: string;
    notes?: string;
}

interface DashboardData {
    client: { name: string; email: string; company?: string };
    projects: ClientProject[];
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    not_started: { icon: <Circle size={14} />, color: '#6b7280', label: 'Not Started' },
    in_progress: { icon: <Loader2 size={14} className="animate-spin" />, color: '#3b82f6', label: 'In Progress' },
    review: { icon: <Clock size={14} />, color: '#f59e0b', label: 'In Review' },
    completed: { icon: <CheckCircle2 size={14} />, color: '#10b981', label: 'Completed' },
};

export const ClientPortal: React.FC = () => {
    const [token, setToken] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [selectedProject, setSelectedProject] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const feedbackRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (selectedProject) setSelectedProject(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedProject]);

    const authenticate = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/portal/dashboard`, {
                headers: { 'x-client-token': token }
            });
            if (!res.ok) throw new Error('Invalid or expired token');
            const result = await res.json();
            if (!result.success) throw new Error(result.message || 'Authentication failed');
            setDashboard(result.data);
            setAuthenticated(true);
            toast({ title: 'Successfully logged in' });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
            setError(errorMessage);
            toast({ variant: "destructive", title: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const submitFeedback = async () => {
        if (!selectedProject || !feedbackMsg.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/portal/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-client-token': token
                },
                body: JSON.stringify({
                    clientProjectId: selectedProject,
                    message: feedbackMsg
                }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to submit feedback');
            }
            toast({ title: 'Feedback sent successfully' });
            setFeedbackMsg('');
            // Optional: refresh dashboard or project feedback list
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send feedback';
            toast({ variant: "destructive", title: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    if (!authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="max-w-[400px] w-full p-10 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl"
                >
                    <h2 className="text-center text-white mb-2 text-2xl font-bold">Client Portal</h2>
                    <p className="text-center text-slate-400 text-sm mb-6">Enter your portal access token</p>
                    <label htmlFor="portal-token" className="sr-only">Portal Access Token</label>
                    <input
                        id="portal-token"
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste your token here..."
                        onKeyDown={(e) => e.key === 'Enter' && authenticate()}
                        className="w-full p-3 rounded-lg border border-slate-800 bg-slate-950 text-white text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                    {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
                    <button
                        onClick={authenticate}
                        disabled={!token || loading}
                        className="w-full p-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                        Access Portal
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
            <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-800 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]">
                                <LayoutDashboard className="w-8 h-8 text-indigo-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-white">
                                    Welcome, {dashboard?.client.name}
                                </h1>
                                <p className="text-slate-400 font-medium mt-1 uppercase tracking-widest text-[10px]">
                                    {dashboard?.client.company || dashboard?.client.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-semibold text-slate-300">Secure Client Access</span>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
                        <Circle className="w-2 h-2 fill-indigo-500 text-indigo-500" />
                        Your Active Projects
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dashboard?.projects.map((project, i) => {
                            const cfg = STATUS_CONFIG[project.status];
                            const isSelected = selectedProject === project.id;
                            return (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isSelected}
                                    className={`group p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${isSelected
                                        ? "bg-slate-900 border-indigo-500/50 shadow-[0_0_30px_-10px_rgba(99,102,241,0.4)]"
                                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                                        }`}
                                    onClick={() => setSelectedProject(project.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setSelectedProject(project.id);
                                        }
                                    }}
                                >
                                    {isSelected && (
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_4px_12px_rgba(99,102,241,0.4)]" />
                                    )}

                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`text-lg font-bold transition-colors ${isSelected ? "text-white" : "text-slate-200 group-hover:text-white"}`}>
                                            {project.title}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div
                                            className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm border bg-slate-950/30"
                                            style={{
                                                color: cfg.color,
                                                borderColor: `${cfg.color}30`
                                            }}
                                        >
                                            <span className="opacity-80">{cfg.icon}</span>
                                            {cfg.label}
                                        </div>
                                    </div>

                                    {project.deadline && (
                                        <div className="mt-6 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/50 pt-4">
                                            <div className="flex items-center gap-2 lowercase font-mono">
                                                <Clock className="w-3.5 h-3.5 opacity-40 text-indigo-400" />
                                                deadline: {formatDate(project.deadline)}
                                            </div>
                                            {isSelected && <ArrowRight className="w-4 h-4 text-indigo-500" />}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Feedback Form Section */}
                    <AnimatePresence>
                        {selectedProject && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div
                                    ref={feedbackRef}
                                    className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-3xl relative"
                                    role="form"
                                    aria-labelledby="feedback-title"
                                >
                                    <div className="absolute -top-12 right-10">
                                        <MessageSquare className="w-24 h-24 text-indigo-500/5 rotate-12" />
                                    </div>

                                    <h4 id="feedback-title" className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                        Project Feedback
                                        <span className="text-indigo-500 text-sm font-mono tracking-tighter bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                                            Direct channel
                                        </span>
                                    </h4>
                                    <p className="text-slate-400 text-sm mb-8 max-w-2xl">
                                        Found a bug? Have a new idea? Or just want to say hi? Add your thoughts below and I'll get an immediate notification.
                                    </p>

                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition-opacity" />
                                        <textarea
                                            id="feedback-message"
                                            value={feedbackMsg}
                                            onChange={(e) => setFeedbackMsg(e.target.value)}
                                            placeholder="Type your message here..."
                                            rows={5}
                                            aria-label="Project feedback message"
                                            className="relative w-full p-6 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-base placeholder:text-slate-600 shadow-inner"
                                        />
                                    </div>

                                    <div className="mt-6 flex items-center justify-between">
                                        <button
                                            onClick={() => setSelectedProject(null)}
                                            className="px-6 py-3 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            onClick={submitFeedback}
                                            disabled={!feedbackMsg.trim()}
                                            className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed rounded-2xl text-white font-bold transition-all shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:translate-y-[-2px] active:translate-y-[1px]"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
                                            Post Update
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default ClientPortal;
