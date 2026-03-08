import React from "react";
import { useLatestCommit } from "../hooks/use-latest-commit";
import { Github, ExternalLink, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const CurrentlyBuildingTicker: React.FC = () => {
    const { data, isLoading } = useLatestCommit();

    if (isLoading || !data || data.repo === "N/A") {
        return null; // Or a subtle skeleton
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto mb-8 px-4"
        >
            <div className="relative group">
                {/* Background Glass Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

                <div className="relative flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                    {/* Live Indicator */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </div>
                        <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">Currently Building</span>
                        <Github className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Separator */}
                    <div className="hidden md:block w-px h-6 bg-white/10"></div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white/90 truncate">{data.repo}</span>
                            <span className="text-[10px] text-gray-500 px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-tighter">
                                {new Date(data.date).toLocaleDateString()}
                            </span>
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={data.aiSummary || data.message}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="text-xs text-gray-300 leading-relaxed italic"
                            >
                                <span className="flex items-center gap-1.5">
                                    {data.aiSummary ? (
                                        <>
                                            <Cpu className="w-3 h-3 text-purple-400" />
                                            {data.aiSummary}
                                        </>
                                    ) : (
                                        data.message
                                    )}
                                </span>
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Action */}
                    <a
                        href={data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group/link"
                    >
                        <span className="text-[10px] font-medium text-gray-400 group-hover/link:text-white transition-colors">View Commit</span>
                        <ExternalLink className="w-3 h-3 text-gray-500 group-hover/link:text-white transition-colors" />
                    </a>
                </div>
            </div>
        </motion.div>
    );
};
