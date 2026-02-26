import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { SkillNode } from './SkillTypes';

interface StatPanelProps {
    title: string;
    children: React.ReactNode;
    position: 'left' | 'right';
    icon: React.ReactNode;
}

export const StatPanel = ({
    title,
    children,
    position,
    icon
}: StatPanelProps) => {
    return (
        <motion.div
            className={`absolute ${position === 'left' ? 'left-3 md:left-4' : 'right-3 md:right-4'} 
        bottom-3 md:bottom-4 w-40 md:w-52 p-3 md:p-4 rounded-xl z-20`}
            style={{
                background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.8) 0%, rgba(25, 15, 45, 0.75) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(100, 100, 160, 0.25)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 2.5 }}
        >
            <div className="flex items-center gap-2 mb-3">
                {icon}
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {title}
                </h4>
            </div>
            {children}
        </motion.div>
    );
};

export const ProficiencyChart = ({ skillNodes }: { skillNodes: SkillNode[] }) => {
    const counts = {
        Core: skillNodes.filter(n => n.status === 'Core').length,
        Comfortable: skillNodes.filter(n => n.status === 'Comfortable').length,
        Learning: skillNodes.filter(n => n.status === 'Learning').length
    };

    const categories = [
        { name: 'Core', count: counts.Core, color: '#00d4ff', bgColor: 'rgba(0, 212, 255, 0.2)' },
        { name: 'Comfortable', count: counts.Comfortable, color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.2)' },
        { name: 'Learning', count: counts.Learning, color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.2)' }
    ];

    const max = Math.max(...categories.map((c) => c.count), 1);

    return (
        <div className="space-y-2.5">
            {categories.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-2">
                    <span className="text-[10px] w-14 md:w-16 text-gray-500 font-medium">{cat.name}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(30, 30, 50, 0.8)' }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                background: `linear-gradient(90deg, ${cat.bgColor} 0%, ${cat.color} 100%)`,
                                boxShadow: `0 0 10px ${cat.color}40`
                            }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(cat.count / max) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 2.6 + i * 0.1 }}
                        />
                    </div>
                    <span className="text-[10px] text-gray-400 w-3 font-bold">{cat.count}</span>
                </div>
            ))}
        </div>
    );
};

export const CategorySummary = ({ skillNodes }: { skillNodes: SkillNode[] }) => {
    const counts = {
        Foundations: skillNodes.filter(n => n.category === 'Foundations').length,
        Frontend: skillNodes.filter(n => n.category === 'Frontend').length,
        Backend: skillNodes.filter(n => n.category === 'Backend').length,
        Tools: skillNodes.filter(n => n.category === 'Tools').length
    };

    const categories = [
        { name: 'Foundations', count: counts.Foundations, icon: '🏛️', color: 'rgba(0, 212, 255, 0.1)' },
        { name: 'Frontend', count: counts.Frontend, icon: '🎨', color: 'rgba(168, 85, 247, 0.1)' },
        { name: 'Backend', count: counts.Backend, icon: '⚙️', color: 'rgba(236, 72, 153, 0.1)' },
        { name: 'Tools', count: counts.Tools, icon: '🔧', color: 'rgba(34, 197, 94, 0.1)' }
    ];

    return (
        <div className="grid grid-cols-2 gap-1.5">
            {categories.map((cat, i) => (
                <motion.div
                    key={cat.name}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg"
                    style={{ background: cat.color }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 2.7 + i * 0.1 }}
                >
                    <span className="text-xs">{cat.icon}</span>
                    <div className="min-w-0">
                        <div className="text-[9px] text-gray-500 truncate">{cat.name}</div>
                        <div className="text-xs font-bold text-white">{cat.count}</div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
