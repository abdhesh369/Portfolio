import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkills, useSkillConnections } from '@/hooks/use-portfolio';
import {
  Code2,
  Database,
  Layout,
  Server,
  Terminal,
  GitBranch,
  Globe,
  Braces,
  Zap,
  Layers,
  BookOpen,
  X
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Code2,
  Database,
  Layout,
  Server,
  Terminal,
  GitBranch,
  Globe,
  Braces,
  Zap,
  Layers,
  BookOpen
};

// --- Type Definitions ---

type SkillStatus = 'Core' | 'Comfortable' | 'Learning';
type SkillCategory = 'Foundations' | 'Frontend' | 'Backend' | 'Tools';

interface SkillNode {
  id: string;
  name: string;
  icon: React.ElementType;
  category: SkillCategory;
  status: SkillStatus;
  description: string;
  proof: string;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
}

// --- Skill Data with improved positioning ---

const SKILL_NODES: SkillNode[] = [
  // Foundations
  {
    id: 'c',
    name: 'C',
    icon: Terminal,
    category: 'Foundations',
    status: 'Core',
    description: 'Manual memory management and low-level logic.',
    proof: 'Academic coursework & system programming.',
    x: 20,
    y: 20
  },
  {
    id: 'cpp',
    name: 'C++',
    icon: Code2,
    category: 'Foundations',
    status: 'Core',
    description: 'Object-Oriented Programming and STL.',
    proof: 'University projects with complex data structures.',
    x: 50,
    y: 18
  },
  {
    id: 'python',
    name: 'Python',
    icon: Terminal, // Using Terminal as generic icon or could import Python icon if available, reusing Terminal for now
    category: 'Foundations',
    status: 'Core',
    description: 'Scripting, automation, and data analysis.',
    proof: 'Data processing scripts and backend tools.',
    x: 80,
    y: 20
  },

  // Frontend
  {
    id: 'html',
    name: 'HTML',
    icon: Globe,
    category: 'Frontend',
    status: 'Core',
    description: 'Semantic structure and accessibility.',
    proof: 'Foundation of all web projects.',
    x: 30,
    y: 45
  },
  {
    id: 'css',
    name: 'CSS',
    icon: Layout,
    category: 'Frontend',
    status: 'Core',
    description: 'Responsive design and animations.',
    proof: 'Styled multiple responsive websites.',
    x: 50,
    y: 45
  },
  {
    id: 'js',
    name: 'JavaScript',
    icon: Zap,
    category: 'Frontend',
    status: 'Core',
    description: 'Dynamic logic and DOM manipulation.',
    proof: 'Interactive features and game logic.',
    x: 70,
    y: 45
  },

  // Advanced / Machine Learning
  {
    id: 'ml',
    name: 'ML',
    icon: Server,
    category: 'Backend', // Kept as Backend as it fits loosely, could be moved if type allowed
    status: 'Learning',
    description: 'Model training and data predictions.',
    proof: 'Academic projects in predictive analysis.',
    x: 50,
    y: 70
  },

  // Library / Frameworks
  {
    id: 'react',
    name: 'React',
    icon: Code2,
    category: 'Frontend',
    status: 'Core',
    description: 'Component-based UI development.',
    proof: 'Built this portfolio and other SPA.',
    x: 70,
    y: 60
  },

  // Tools
  {
    id: 'git',
    name: 'Git',
    icon: GitBranch,
    category: 'Tools',
    status: 'Core',
    description: 'Version control system.',
    proof: 'Daily usage for code management.',
    x: 15,
    y: 60
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: GitBranch, // Reusing GitBranch or similar
    category: 'Tools',
    status: 'Core',
    description: 'Code hosting and collaboration.',
    proof: 'Project repositories and CI/CD.',
    x: 30,
    y: 70
  }
];

const CONNECTIONS: Connection[] = [
  { from: 'c', to: 'cpp' },
  { from: 'cpp', to: 'python' },
  { from: 'python', to: 'ml' },
  { from: 'html', to: 'css' },
  { from: 'css', to: 'js' },
  { from: 'js', to: 'html' },
  { from: 'python', to: 'js' },
  { from: 'js', to: 'react' },
  { from: 'git', to: 'github' },
  { from: 'c', to: 'git' } // Integrating tools into the tree
];

// --- Enhanced Background Components ---

const CosmicBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let stars: { x: number; y: number; size: number; speed: number; opacity: number; twinkleSpeed: number }[] = [];

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Recreate stars on resize
      stars = [];
      const starCount = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 3000);
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          size: Math.random() * 2.5 + 0.5,
          speed: Math.random() * 0.3 + 0.05,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      stars.forEach((star) => {
        // Smooth twinkle
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.x) * 0.3 + 0.7;
        const currentOpacity = star.opacity * twinkle;

        // Draw star with glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`);
        gradient.addColorStop(0.5, `rgba(200, 220, 255, ${currentOpacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core of the star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();

        // Slow drift
        star.y -= star.speed * 0.15;
        if (star.y < -10) {
          star.y = canvas.offsetHeight + 10;
          star.x = Math.random() * canvas.offsetWidth;
        }
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.8 }} />;
};

// Enhanced floating particles with trails
const FloatingParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 10 + Math.random() * 8,
      size: 3 + Math.random() * 6,
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
              ? 'radial-gradient(circle, rgba(0, 212, 255, 0.8) 0%, rgba(0, 212, 255, 0.2) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 70%)',
            boxShadow: p.color === 'cyan'
              ? '0 0 10px rgba(0, 212, 255, 0.6), 0 0 20px rgba(0, 212, 255, 0.3)'
              : '0 0 10px rgba(168, 85, 247, 0.6), 0 0 20px rgba(168, 85, 247, 0.3)'
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-20, 20, -20],
            opacity: [0.2, 0.9, 0.2],
            scale: [0.8, 1.3, 0.8]
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

// --- Enhanced Tree SVG ---

const EnhancedTreeSVG = ({
  highlightedConnections,
  activeNode,
  skillNodes,
  connections
}: {
  highlightedConnections: Set<string>;
  activeNode: string | null;
  skillNodes: SkillNode[];
  connections: Connection[];
}) => {
  const getNodePos = (id: string) => {
    const node = skillNodes.find((n) => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        {/* Enhanced trunk gradient */}
        <linearGradient id="trunkGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#2d1b4e" stopOpacity="1" />
          <stop offset="30%" stopColor="#4c1d95" stopOpacity="1" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.6" />
        </linearGradient>

        {/* Branch gradient */}
        <linearGradient id="branchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.3" />
        </linearGradient>

        {/* Enhanced glow filter */}
        <filter id="treeGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Connection glow */}
        <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Crystal gradient for roots */}
        <linearGradient id="crystalGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="1" />
          <stop offset="40%" stopColor="#00d4ff" stopOpacity="0.6" />
          <stop offset="80%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
        </linearGradient>

        {/* Animated dash pattern */}
        <pattern id="circuitPattern" patternUnits="userSpaceOnUse" width="4" height="4">
          <circle cx="2" cy="2" r="0.5" fill="rgba(0, 212, 255, 0.5)" />
        </pattern>
      </defs>

      {/* Main tree trunk - curved organic shape */}
      <motion.path
        d="M 50 98 
           C 50 92, 48 88, 49 82 
           C 50 76, 52 70, 51 64 
           C 50 58, 48 52, 50 46
           C 52 40, 50 34, 50 28"
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

      {/* Secondary trunk lines for depth */}
      <motion.path
        d="M 50 98 
           C 49 90, 51 84, 50 78 
           C 49 72, 51 66, 50 60"
        stroke="rgba(139, 92, 246, 0.4)"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.5 }}
        viewport={{ once: true }}
        transition={{ duration: 2, delay: 0.2 }}
      />

      {/* Left main branch */}
      <motion.path
        d="M 50 55 C 42 50, 35 48, 25 42"
        stroke="url(#branchGradient)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        filter="url(#treeGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.8 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.8 }}
      />

      {/* Right main branch */}
      <motion.path
        d="M 50 55 C 58 50, 65 48, 75 42"
        stroke="url(#branchGradient)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        filter="url(#treeGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.8 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.9 }}
      />

      {/* Upper left branch */}
      <motion.path
        d="M 50 35 C 40 30, 30 26, 18 22"
        stroke="url(#branchGradient)"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        filter="url(#treeGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.7 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 1.0 }}
      />

      {/* Upper right branch */}
      <motion.path
        d="M 50 35 C 60 30, 70 26, 82 22"
        stroke="url(#branchGradient)"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        filter="url(#treeGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.7 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 1.1 }}
      />

      {/* Lower branches */}
      <motion.path
        d="M 50 65 C 42 62, 38 60, 35 60"
        stroke="url(#branchGradient)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        filter="url(#treeGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 1.2 }}
      />

      <motion.path
        d="M 50 65 C 58 62, 62 60, 65 60"
        stroke="url(#branchGradient)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        filter="url(#treeGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 1.3 }}
      />

      {/* Skill connection lines */}
      {connections.map((conn, i) => {
        const start = getNodePos(conn.from);
        const end = getNodePos(conn.to);
        const isHighlighted = highlightedConnections.has(`${conn.from}-${conn.to}`);
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2 - 3;

        return (
          <motion.path
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

      {/* Crystalline roots - enhanced */}
      <g filter="url(#treeGlow)">
        {/* Central crystal cluster */}
        <motion.polygon
          points="50,88 46,98 50,100 54,98"
          fill="url(#crystalGradient)"
          initial={{ opacity: 0, scaleY: 0 }}
          whileInView={{ opacity: 1, scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.8 }}
          style={{ transformOrigin: '50% 100%' }}
        />
        <motion.polygon
          points="50,90 48,98 50,99 52,98"
          fill="rgba(0, 212, 255, 0.9)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.9 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.9 }}
        />

        {/* Left crystals */}
        <motion.polygon
          points="40,92 37,99 40,100 43,98"
          fill="url(#crystalGradient)"
          fillOpacity="0.8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 2.0 }}
        />
        <motion.polygon
          points="35,94 33,99 36,100 38,97"
          fill="rgba(0, 212, 255, 0.6)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 2.1 }}
        />

        {/* Right crystals */}
        <motion.polygon
          points="60,92 63,99 60,100 57,98"
          fill="url(#crystalGradient)"
          fillOpacity="0.8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 2.0 }}
        />
        <motion.polygon
          points="65,94 67,99 64,100 62,97"
          fill="rgba(168, 85, 247, 0.6)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 2.1 }}
        />

        {/* Small accent crystals */}
        <motion.polygon
          points="45,95 44,99 46,100 47,97"
          fill="rgba(0, 212, 255, 0.5)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 2.2 }}
        />
        <motion.polygon
          points="55,95 56,99 54,100 53,97"
          fill="rgba(168, 85, 247, 0.5)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 2.2 }}
        />
      </g>

      {/* Ground glow rings */}
      <motion.ellipse
        cx="50"
        cy="98"
        rx="25"
        ry="2"
        fill="none"
        stroke="rgba(0, 212, 255, 0.4)"
        strokeWidth="0.3"
        filter="url(#treeGlow)"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 0.4, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 2.3 }}
        style={{ transformOrigin: '50% 98%' }}
      />
      <motion.ellipse
        cx="50"
        cy="98"
        rx="35"
        ry="3"
        fill="none"
        stroke="rgba(0, 212, 255, 0.2)"
        strokeWidth="0.2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.2 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 2.4 }}
      />
    </svg>
  );
};

// --- Enhanced Hexagon Node ---

const HexagonNode = ({
  node,
  isActive,
  onClick,
  onHover,
  onLeave
}: {
  node: SkillNode;
  isActive: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) => {
  const statusColors = {
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

// --- Enhanced Tooltip ---

const SkillTooltip = ({
  node,
  onClose
}: {
  node: SkillNode;
  onClose: () => void;
}) => {
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
          background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.98) 0%, rgba(30, 15, 50, 0.95) 100%)',
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

// --- Enhanced Stat Panels ---

const StatPanel = ({
  title,
  children,
  position,
  icon
}: {
  title: string;
  children: React.ReactNode;
  position: 'left' | 'right';
  icon: React.ReactNode;
}) => {
  return (
    <motion.div
      className={`absolute ${position === 'left' ? 'left-3 md:left-4' : 'right-3 md:right-4'} 
        bottom-3 md:bottom-4 w-40 md:w-52 p-3 md:p-4 rounded-xl z-20`}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.9) 0%, rgba(25, 15, 45, 0.85) 100%)',
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

const ProficiencyChart = ({ skillNodes }: { skillNodes: SkillNode[] }) => {
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

  const max = Math.max(...categories.map((c) => c.count));

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

const CategorySummary = ({ skillNodes }: { skillNodes: SkillNode[] }) => {
  const counts = {
    Foundations: skillNodes.filter(n => n.category === 'Foundations').length,
    Frontend: skillNodes.filter(n => n.category === 'Frontend').length,
    Backend: skillNodes.filter(n => n.category === 'Backend').length,
    Tools: skillNodes.filter(n => n.category === 'Tools').length
  };

  const categories: { name: string; count: number; icon: string; color: string }[] = [
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

// --- Main Component ---

export default function SkillsTree() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const { data: apiSkills, isLoading: skillsLoading } = useSkills();
  const { data: apiConnections, isLoading: connectionsLoading } = useSkillConnections();

  const skillNodes = useMemo(() => {
    if (!apiSkills || apiSkills.length === 0) return SKILL_NODES;
    return apiSkills.map(s => ({
      ...s,
      id: String(s.id),
      icon: ICON_MAP[s.icon] || Code2,
      status: s.status as SkillStatus,
      category: s.category as SkillCategory
    }));
  }, [apiSkills]);

  const connections = useMemo(() => {
    if (!apiConnections || apiConnections.length === 0) return CONNECTIONS;
    return apiConnections.map(c => ({
      from: c.fromSkillId,
      to: c.toSkillId
    }));
  }, [apiConnections]);

  const highlightedConnections = useMemo(() => {
    if (!activeNode) return new Set<string>();
    const connectionsSet = new Set<string>();
    const visited = new Set<string>([activeNode]);
    const queue = [activeNode];

    while (queue.length > 0) {
      const current = queue.shift()!;
      connections.forEach((conn) => {
        if (conn.to === current && !visited.has(conn.from)) {
          visited.add(conn.from);
          connectionsSet.add(`${conn.from}-${conn.to}`);
          queue.push(conn.from);
        }
      });
    }
    return connectionsSet;
  }, [activeNode, connections]);

  const handleNodeClick = (id: string) => {
    setActiveNode(id);
    setShowTooltip(true);
  };

  const handleCloseTooltip = () => {
    setShowTooltip(false);
    setActiveNode(null);
  };

  const activeNodeData = skillNodes.find((n) => n.id === activeNode);

  return (
    <section
      id="skills"
      className="relative min-h-screen py-16 md:py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #050510 0%, #0a0520 30%, #120828 60%, #0a0520 85%, #050510 100%)'
      }}
    >
      {/* Cosmic Background */}
      <div className="absolute inset-0">
        <CosmicBackground />
        <FloatingParticles />

        {/* Enhanced nebula gradients */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 30%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse 70% 50% at 70% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 40%),
              radial-gradient(ellipse 50% 30% at 30% 70%, rgba(0, 212, 255, 0.08) 0%, transparent 50%)
            `
          }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 40%, #ec4899 80%, #00d4ff 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient-x 8s ease infinite'
            }}
          >
            Skill Tree
          </motion.h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm md:text-base">
            A verified map of my technical abilities
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Tap any node to explore details
          </p>
        </motion.div>

        {/* Tree Container */}
        <motion.div
          className="relative w-full max-w-5xl mx-auto rounded-2xl md:rounded-3xl overflow-hidden"
          style={{
            aspectRatio: '16 / 12',
            background: 'linear-gradient(180deg, rgba(10, 5, 25, 0.6) 0%, rgba(15, 8, 35, 0.8) 50%, rgba(10, 5, 25, 0.6) 100%)',
            border: '1px solid rgba(100, 100, 160, 0.15)',
            boxShadow: '0 0 100px rgba(139, 92, 246, 0.08), inset 0 0 100px rgba(0, 0, 0, 0.5)'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Tree SVG */}
          <EnhancedTreeSVG
            highlightedConnections={highlightedConnections}
            activeNode={activeNode}
            skillNodes={skillNodes}
            connections={connections}
          />

          {/* Skill Nodes */}
          {skillNodes.map((node) => (
            <HexagonNode
              key={node.id}
              node={node}
              isActive={activeNode === node.id}
              onClick={() => handleNodeClick(node.id)}
              onHover={() => setActiveNode(node.id)}
              onLeave={() => !showTooltip && setActiveNode(null)}
            />
          ))}

          {/* Stat Panels */}
          <StatPanel
            title="Proficiency"
            position="left"
            icon={<Zap className="w-3 h-3 text-cyan-400" />}
          >
            <ProficiencyChart skillNodes={skillNodes} />
          </StatPanel>

          <StatPanel
            title="Categories"
            position="right"
            icon={<Layers className="w-3 h-3 text-purple-400" />}
          >
            <CategorySummary skillNodes={skillNodes} />
          </StatPanel>
        </motion.div>

        {/* Legend */}
        <motion.div
          className="flex justify-center gap-4 md:gap-8 mt-6 md:mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 2.8 }}
        >
          {[
            { label: 'Core', color: '#00d4ff' },
            { label: 'Comfortable', color: '#a855f7' },
            { label: 'Learning', color: '#ec4899' }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: item.color,
                  boxShadow: `0 0 8px ${item.color}80`
                }}
              />
              <span className="text-xs text-gray-500 font-medium">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Tooltip Modal */}
      <AnimatePresence>
        {showTooltip && activeNodeData && (
          <SkillTooltip node={activeNodeData} onClose={handleCloseTooltip} />
        )}
      </AnimatePresence>
    </section>
  );
}