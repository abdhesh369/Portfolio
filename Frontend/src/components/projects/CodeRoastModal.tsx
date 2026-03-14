import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { X, Flame, Shield, Zap, Info, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api-helpers";
import ReactMarkdown from "react-markdown";

interface CodeRoastModalProps {
  projectId: number;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ReviewData {
  id: number;
  content: string;
  badges: string[];
  status: "completed" | "processing" | "failed";
  updatedAt: string;
}

export function CodeRoastModal({ projectId, projectTitle, isOpen, onClose }: CodeRoastModalProps) {
  const [review, setReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReview = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      if (force) {
        await apiFetch(`/api/v1/projects/${projectId}/review`, { method: "POST" });
        // Polling if needed, but the service runs in background. 
        // For simplicity, we'll wait 5s then fetch or just trigger and poll.
        setTimeout(() => fetchReview(false), 5000);
        return;
      }

      const res = await apiFetch(`/api/v1/projects/${projectId}/review`);
      if (res.success) {
        setReview(res.data);
      }
    } catch (err: unknown) {
      const error = err as { status?: number };
      if (error.status !== 404) {
        setError("Transmission failure. AI kernel unreachable.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReview();
    }
  }, [isOpen, projectId]);

  const handleRoast = () => {
    fetchReview(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <m.div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <m.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-neutral-950 border border-red-500/20 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(239,68,68,0.1)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-red-500/5 border-b border-white/5">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                    <Flame className="w-5 h-5 animate-pulse" />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tighter italic">AI_CODE_ROAST :: {projectTitle}</h3>
                    <p className="text-[10px] font-mono text-red-500/50 uppercase tracking-widest">Protocol: Brutal_Honesty_v2.1</p>
                 </div>
               </div>
               <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Content Slot */}
            <div className="flex-1 overflow-y-auto p-8 custom-terminal-scrollbar font-mono text-sm leading-relaxed">
               {loading ? (
                 <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                    <p className="text-[10px] text-red-500/50 uppercase tracking-[0.3em] font-black">Analyzing Source Code...</p>
                 </div>
               ) : error ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={() => fetchReview()} className="text-[10px] font-black text-white bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/30">RETRY_TRANSMISSION</button>
                 </div>
               ) : review ? (
                 <div className="space-y-8 prose prose-invert prose-red max-w-none">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {review.badges.map(b => (
                        <span key={b} className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                           {b === 'security' && <Shield className="w-2.5 h-2.5" />}
                           {b === 'performance' && <Zap className="w-2.5 h-2.5" />}
                           {b}
                        </span>
                      ))}
                    </div>
                    
                    {review.status === 'processing' ? (
                       <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-yellow-500/80 flex items-start gap-4">
                          <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold uppercase text-[10px] mb-1">AI_THINKING_IN_PROGRESS</p>
                            <p className="text-xs">The review is being generated. This usually takes 10-20 seconds. Grab a coffee, this might hurt.</p>
                          </div>
                       </div>
                    ) : (
                      <div className="markdown-content prose prose-invert prose-red max-w-none">
                        <ReactMarkdown>
                          {review.content}
                        </ReactMarkdown>
                      </div>
                    )}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Sparkles className="w-12 h-12 text-neutral-800 mb-6" />
                    <p className="text-neutral-500 mb-8 max-w-xs">No AI review exists for this project artifact. Would you like to initialize a roast protocol?</p>
                    <button 
                      onClick={handleRoast}
                      className="group relative px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        TRIGGER_AI_ROAST <Flame className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-red-400 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                    </button>
                 </div>
               )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-neutral-950 border-t border-white/5 flex justify-between items-center">
               <div className="flex items-center gap-4 text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1.5"><Info className="w-3 h-3" /> External_Artifact_Review</span>
                  <span className="h-3 w-px bg-white/5" />
                  <span>v2.1_CORE</span>
               </div>
               {review && (
                 <button onClick={handleRoast} className="text-[9px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest transition-colors">
                    REFRESH_ROAST
                 </button>
               )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
