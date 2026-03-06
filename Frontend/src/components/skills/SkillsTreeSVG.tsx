import { m } from 'framer-motion';
import { SkillNode, Connection } from './SkillTypes';
import { useTheme } from '../theme-provider';

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
    const { performanceMode, treePerformanceMode } = useTheme();
    const isLowPower = performanceMode === 'low';
    const isTreePower = treePerformanceMode === 'power' && !isLowPower;

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
                    <stop offset="100%" stopColor="var(--color-purple-light)" stopOpacity="0.6" />
                </linearGradient>

                <linearGradient id="branchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="var(--color-purple-light)" stopOpacity="0.3" />
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

                <filter id="treeHighGlow" x="-200%" y="-200%" width="500%" height="500%">
                    <feGaussianBlur stdDeviation="3" result="blur1" />
                    <feGaussianBlur stdDeviation="5" result="blur2" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 2 0" />
                    <feMerge>
                        <feMergeNode in="blur1" />
                        <feMergeNode in="blur2" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* New Super Vibrant Glow for Power Mode */}
                <filter id="superGlow" x="-300%" y="-300%" width="700%" height="700%">
                    <feGaussianBlur stdDeviation="4" result="blur1" />
                    <feGaussianBlur stdDeviation="8" result="blur2" />
                    <feGaussianBlur stdDeviation="15" result="blur3" />
                    <feColorMatrix type="matrix" values="1.2 0 0 0 0.1, 0 1.2 0 0 0.1, 0 0 1.5 0 0.2, 0 0 0 2.5 0" />
                    <feMerge>
                        <feMergeNode in="blur1" />
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur3" />
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
                strokeWidth={isTreePower ? 3 : 2.5}
                fill="none"
                strokeLinecap="round"
                filter={isTreePower ? 'url(#superGlow)' : 'none'}
                initial={{ pathLength: isLowPower ? 1 : 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                animate={isTreePower ? {
                    strokeWidth: [3, 3.5, 3],
                    opacity: [0.9, 1, 0.9],
                } : {}}
                viewport={{ once: true }}
                transition={isTreePower ? {
                    pathLength: { duration: 2, ease: 'easeOut' },
                    opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    strokeWidth: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                } : { duration: isLowPower ? 0.5 : 2, ease: 'easeOut' }} />

            {/* Connection lines */}
            {connections.map((conn, i) => {
                const start = getNodePos(conn.from);
                const end = getNodePos(conn.to);
                const isHighlighted = highlightedConnections.has(`${conn.from}-${conn.to}`);
                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2 - 3;

                return (
                    <g key={i}>
                        <m.path
                            d={`M ${start.x} ${start.y} Q ${midX} ${midY}, ${end.x} ${end.y}`}
                            stroke={isHighlighted ? '#00d4ff' : (isTreePower ? 'rgba(168, 85, 247, 0.4)' : 'rgba(100, 100, 160, 0.25)')}
                            strokeWidth={isHighlighted ? 0.8 : (isTreePower ? 0.6 : 0.4)}
                            fill="none"
                            strokeLinecap="round"
                            filter={isTreePower ? (isHighlighted ? 'url(#connectionGlow)' : 'url(#treeHighGlow)') : 'none'}
                            initial={{ pathLength: isLowPower ? 1 : 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: isLowPower ? 0.3 : 0.8, delay: isLowPower ? 0 : 1.5 + i * 0.05 }}
                        />
                        {isTreePower && (
                            <m.circle
                                r="0.15"
                                fill="#00d4ff"
                                filter="url(#connectionGlow)"
                            >
                                <animateMotion
                                    dur={`${2 + Math.random() * 2}s`}
                                    repeatCount="indefinite"
                                    path={`M ${start.x} ${start.y} Q ${midX} ${midY}, ${end.x} ${end.y}`}
                                />
                            </m.circle>
                        )}
                    </g>
                );
            })}

            {/* Crystalline roots with animation */}
            <g filter={isTreePower ? 'url(#superGlow)' : 'none'}>
                <m.polygon
                    points="50,88 46,98 50,100 54,98"
                    fill="url(#crystalGradient)"
                    initial={{ opacity: 0, scaleY: 0 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    animate={isTreePower ? {
                        fill: ['#00d4ff', '#a855f7', '#00d4ff'],
                    } : {}}
                    viewport={{ once: true }}
                    transition={isTreePower ? {
                        fill: { duration: 3, repeat: Infinity, ease: "linear" }
                    } : { duration: 0.8, delay: isLowPower ? 0 : 1.8 }}
                    style={{ transformOrigin: '50% 100%' }}
                />
            </g>

            {/* Energy pulses along trunk in Power Mode */}
            {isTreePower && [1, 2].map((id) => (
                <m.circle
                    key={`pulse-${id}`}
                    r="0.3"
                    fill="#a855f7"
                    filter="url(#superGlow)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                >
                    <animateMotion
                        dur={`${3 + id}s`}
                        repeatCount="indefinite"
                        path="M 50 98 C 50 92, 48 88, 49 82 C 50 76, 52 70, 51 64 C 50 58, 48 52, 50 46 C 52 40, 50 34, 50 28"
                    />
                </m.circle>
            ))}
        </svg>
    );
};
