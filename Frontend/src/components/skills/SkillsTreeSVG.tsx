import { m } from 'framer-motion';
import { SkillNode, Connection } from './SkillTypes';

interface SkillsTreeSVGProps {
    highlightedConnections: Set<string>;
    skillNodes: SkillNode[];
    connections: Connection[];
}

export const SkillsTreeSVG = ({
    highlightedConnections,
    skillNodes,
    connections
}: SkillsTreeSVGProps) => {
    const getNodePos = (id: string) => {
        const node = skillNodes.find((n) => n.id === id);
        return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
    };

    return (
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <linearGradient id="trunkGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#2d1b4e" stopOpacity="1" />
                    <stop offset="30%" stopColor="#4c1d95" stopOpacity="1" />
                    <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.6" />
                </linearGradient>

                <linearGradient id="branchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.3" />
                </linearGradient>

                <filter id="treeGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="0.8" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                <linearGradient id="crystalGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="1" />
                    <stop offset="40%" stopColor="#00d4ff" stopOpacity="0.6" />
                    <stop offset="80%" stopColor="#a855f7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
                </linearGradient>
            </defs>

            {/* Main tree trunk */}
            <m.path
                d="M 50 98 C 50 92, 48 88, 49 82 C 50 76, 52 70, 51 64 C 50 58, 48 52, 50 46 C 52 40, 50 34, 50 28"
                stroke="url(#trunkGradient)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                filter="url(#treeGlow)"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: 'easeOut' }}
            />

            {/* Connection lines */}
            {connections.map((conn, i) => {
                const start = getNodePos(conn.from);
                const end = getNodePos(conn.to);
                const isHighlighted = highlightedConnections.has(`${conn.from}-${conn.to}`);
                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2 - 3;

                return (
                    <m.path
                        key={i}
                        d={`M ${start.x} ${start.y} Q ${midX} ${midY}, ${end.x} ${end.y}`}
                        stroke={isHighlighted ? '#00d4ff' : 'rgba(100, 100, 160, 0.25)'}
                        strokeWidth={isHighlighted ? 0.8 : 0.4}
                        fill="none"
                        strokeLinecap="round"
                        filter={isHighlighted ? 'url(#connectionGlow)' : 'none'}
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 1.5 + i * 0.05 }}
                    />
                );
            })}

            {/* Crystalline roots */}
            <g filter="url(#treeGlow)">
                <m.polygon
                    points="50,88 46,98 50,100 54,98"
                    fill="url(#crystalGradient)"
                    initial={{ opacity: 0, scaleY: 0 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 1.8 }}
                    style={{ transformOrigin: '50% 100%' }}
                />
                {/* Simplified roots for clarity in modular version */}
            </g>
        </svg>
    );
};
