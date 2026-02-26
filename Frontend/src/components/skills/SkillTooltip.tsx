import { motion } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';
import { SkillNode } from './SkillTypes';

interface SkillTooltipProps {
    node: SkillNode;
    onClose: () => void;
}

export const SkillTooltip = ({
    node,
    onClose
}: SkillTooltipProps) => {
    const statusColors = {
        Core: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50' },
        Comfortable: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
        Learning: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/50' }
    };

    const colors = statusColors[node.status];

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Tooltip card */}
            <motion.div
                className="relative w-full max-w-sm p-6 rounded-2xl overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.85) 0%, rgba(30, 15, 50, 0.8) 100%)',
                    border: '1px solid rgba(100, 100, 180, 0.3)',
                    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(139, 92, 246, 0.2)'
                }}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-2xl" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-purple-500/30 rounded-br-2xl" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="p-3 rounded-xl"
                        style={{
                            background: `linear-gradient(135deg, ${node.status === 'Core' ? 'rgba(0, 212, 255, 0.15)' : node.status === 'Comfortable' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(236, 72, 153, 0.15)'} 0%, transparent 100%)`,
                            border: `1px solid ${node.status === 'Core' ? 'rgba(0, 212, 255, 0.3)' : node.status === 'Comfortable' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(236, 72, 153, 0.3)'}`
                        }}
                    >
                        <node.icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-lg">{node.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} ${colors.border} border font-medium`}>
                            {node.status}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">What I Use It For</span>
                        <p className="text-gray-300 text-sm mt-1 leading-relaxed">{node.description}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-700/50">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-3 h-3" /> Proof of Work
                        </span>
                        <p className="text-gray-400 text-sm mt-1 italic">{node.proof}</p>
                    </div>
                </div>

                {/* Category tag */}
                <div className="mt-4 pt-3 border-t border-gray-700/30">
                    <span className="text-xs text-gray-500">
                        Category: <span className="text-gray-400 font-medium">{node.category}</span>
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};
