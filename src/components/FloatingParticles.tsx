import { useMemo } from "react";
import { motion } from "framer-motion";

export const FloatingParticles = () => {
    const particles = useMemo(() =>
        Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 6,
            duration: 8 + Math.random() * 6,
            size: 2 + Math.random() * 4,
            color: Math.random() > 0.5 ? 'cyan' : 'purple'
        })), []
    );

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        background: p.color === 'cyan'
                            ? 'radial-gradient(circle, rgba(0, 212, 255, 0.7) 0%, transparent 70%)'
                            : 'radial-gradient(circle, rgba(168, 85, 247, 0.7) 0%, transparent 70%)',
                        boxShadow: p.color === 'cyan'
                            ? '0 0 8px rgba(0, 212, 255, 0.5)'
                            : '0 0 8px rgba(168, 85, 247, 0.5)'
                    }}
                    animate={{
                        y: [-20, 20, -20],
                        x: [-15, 15, -15],
                        opacity: [0.3, 0.8, 0.3],
                        scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            ))}
        </div>
    );
};
