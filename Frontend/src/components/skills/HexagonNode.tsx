import { motion } from 'framer-motion';
import { SkillNode, NodeColors } from './SkillTypes';

const statusColors: Record<string, NodeColors> = {
    Core: {
        glow: '#00d4ff',
        glowRgb: '0, 212, 255',
        border: '#00d4ff',
        bg: 'rgba(0, 212, 255, 0.12)'
    },
    Comfortable: {
        glow: '#a855f7',
        glowRgb: '168, 85, 247',
        border: '#a855f7',
        bg: 'rgba(168, 85, 247, 0.12)'
    },
    Learning: {
        glow: '#ec4899',
        glowRgb: '236, 72, 153',
        border: '#ec4899',
        bg: 'rgba(236, 72, 153, 0.12)'
    }
};

interface HexagonNodeProps {
    node: SkillNode;
    isActive: boolean;
    onClick: () => void;
    onHover: () => void;
    onLeave: () => void;
}

export const HexagonNode = ({
    node,
    isActive,
    onClick,
    onHover,
    onLeave
}: HexagonNodeProps) => {
    const colors = statusColors[node.status];
    const hexSize = 'clamp(44px, 7vw, 64px)';

    return (
        <motion.div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.5 + Math.random() * 0.4 }}
            onClick={onClick}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
            role="button"
            tabIndex={0}
            aria-label={`${node.name} (${node.status})`}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            whileHover={{ scale: 1.12, zIndex: 20 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Outer glow pulse ring */}
            <motion.div
                className="absolute inset-0 -m-2"
                style={{
                    width: `calc(${hexSize} + 16px)`,
                    height: `calc(${hexSize} + 16px)`,
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    background: `radial-gradient(circle, rgba(${colors.glowRgb}, 0.3) 0%, transparent 70%)`,
                    filter: isActive ? `drop-shadow(0 0 15px ${colors.glow})` : 'none',
                    transform: 'translate(-8px, -8px)'
                }}
                animate={isActive ? {
                    opacity: [0.4, 0.8, 0.4],
                    scale: [1, 1.1, 1]
                } : { opacity: 0.2, scale: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Main hexagon */}
            <motion.div
                className="relative flex items-center justify-center"
                style={{
                    width: hexSize,
                    height: hexSize,
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    background: `linear-gradient(180deg, 
            ${colors.bg} 0%, 
            rgba(15, 10, 30, 0.95) 50%,
            rgba(10, 5, 20, 0.98) 100%)`,
                    border: 'none',
                    boxShadow: isActive
                        ? `0 0 25px rgba(${colors.glowRgb}, 0.6), 
               0 0 50px rgba(${colors.glowRgb}, 0.3),
               inset 0 1px 0 rgba(255, 255, 255, 0.1),
               inset 0 0 20px rgba(${colors.glowRgb}, 0.2)`
                        : `inset 0 1px 0 rgba(255, 255, 255, 0.05),
               inset 0 0 15px rgba(0, 0, 0, 0.5),
               0 4px 15px rgba(0, 0, 0, 0.3)`
                }}
                animate={isActive ? {
                    boxShadow: [
                        `0 0 25px rgba(${colors.glowRgb}, 0.6), 0 0 50px rgba(${colors.glowRgb}, 0.3), inset 0 0 20px rgba(${colors.glowRgb}, 0.2)`,
                        `0 0 35px rgba(${colors.glowRgb}, 0.8), 0 0 70px rgba(${colors.glowRgb}, 0.4), inset 0 0 25px rgba(${colors.glowRgb}, 0.3)`,
                        `0 0 25px rgba(${colors.glowRgb}, 0.6), 0 0 50px rgba(${colors.glowRgb}, 0.3), inset 0 0 20px rgba(${colors.glowRgb}, 0.2)`
                    ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
            >
                {/* Inner hexagon border */}
                <div
                    className="absolute inset-0.5"
                    style={{
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        background: 'transparent',
                        boxShadow: `inset 0 0 0 1.5px ${isActive ? colors.border : 'rgba(100, 100, 140, 0.4)'}`
                    }}
                />

                {/* Icon */}
                <node.icon
                    className="relative z-10 transition-all duration-300"
                    style={{
                        width: 'clamp(18px, 2.5vw, 26px)',
                        height: 'clamp(18px, 2.5vw, 26px)',
                        color: isActive ? colors.border : 'rgba(180, 180, 210, 0.8)',
                        filter: isActive ? `drop-shadow(0 0 8px ${colors.glow})` : 'none'
                    }}
                />
            </motion.div>

            {/* Label */}
            <motion.div
                className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
                style={{
                    bottom: '-22px',
                    fontSize: 'clamp(8px, 1.1vw, 11px)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isActive ? colors.border : 'rgba(160, 160, 190, 0.9)',
                    textShadow: isActive
                        ? `0 0 10px ${colors.glow}, 0 0 20px rgba(${colors.glowRgb}, 0.5)`
                        : '0 2px 4px rgba(0, 0, 0, 0.5)'
                }}
                animate={isActive ? { y: [0, -2, 0] } : { y: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                {node.name}
            </motion.div>
        </motion.div>
    );
};
