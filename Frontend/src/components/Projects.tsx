import { useState, useMemo, useRef, useEffect } from "react";

import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { useProjects } from "@/hooks/use-portfolio";
import { type Project } from "@shared/schema";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Github, ExternalLink, Folder, Code, Layers, X, ArrowRight, Sparkles, Cpu, Eye, Zap, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";



// Enhanced 3D Tilt Card with Sci-Fi styling
const ProjectCard = ({ project, onPreview, index }: { project: Project; onPreview: (p: Project) => void; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateXValue = (e.clientY - centerY) / 20;
    const rotateYValue = (centerX - e.clientX) / 20;
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const shouldReduceMotion = useReducedMotion();
  const transitionConfig = shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: index * 0.1 };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  // Category colors
  const categoryColors: Record<string, { glow: string; text: string; bg: string }> = {
    System: { glow: 'rgba(0, 212, 255, 0.5)', text: '#00d4ff', bg: 'rgba(0, 212, 255, 0.1)' },
    Academic: { glow: 'rgba(168, 85, 247, 0.5)', text: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
    Backend: { glow: 'rgba(34, 197, 94, 0.5)', text: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
    Utility: { glow: 'rgba(236, 72, 153, 0.5)', text: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
    Web: { glow: 'rgba(59, 130, 246, 0.5)', text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  };

  const catColor = categoryColors[project.category] || categoryColors.Utility;

  // Tech colors
  const techColors: Record<string, string> = {
    React: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    "Node.js": "bg-green-500/15 text-green-400 border-green-500/30",
    TypeScript: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    JavaScript: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    Python: "bg-yellow-600/15 text-yellow-500 border-yellow-600/30",
    PostgreSQL: "bg-blue-600/15 text-blue-400 border-blue-600/30",
    Express: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    C: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    "C++": "bg-pink-500/15 text-pink-400 border-pink-500/30",
    TailwindCSS: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    SQLite: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    CSS3: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    Flask: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    MySQL: "bg-blue-400/15 text-blue-300 border-blue-400/30",
    Pygame: "bg-red-500/15 text-red-400 border-red-500/30",
    "OpenRouter API": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    "SQLAlchemy": "bg-red-600/15 text-red-500 border-red-600/30",
    "Flask-Login": "bg-emerald-600/15 text-emerald-500 border-emerald-600/30",
    "Drizzle ORM": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    "Framer Motion": "bg-purple-500/15 text-purple-400 border-purple-500/30",
    "Three.js": "bg-blue-400/15 text-blue-300 border-blue-400/30",
    "pyttsx3": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    "SpeechRecognition": "bg-orange-500/15 text-orange-400 border-orange-500/30",
    "Regex": "bg-gray-500/15 text-gray-400 border-gray-500/30",
    "psutil": "bg-slate-500/15 text-slate-400 border-slate-500/30",
    "pg": "bg-blue-600/15 text-blue-400 border-blue-600/30",
    "Zod": "bg-blue-500/15 text-blue-400 border-blue-500/30",
    "Vanilla JS": "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
  };

  // Tech Icon mapping
  const techIcons: Record<string, React.ReactNode> = {
    React: <Code className="w-3 h-3" />,
    "Node.js": <Cpu className="w-3 h-3" />,
    TypeScript: <Layers className="w-3 h-3" />,
    JavaScript: <Layers className="w-3 h-3" />,
    Python: <Terminal className="w-3 h-3" />,
    PostgreSQL: <Layers className="w-3 h-3" />,
    Express: <Cpu className="w-3 h-3" />,
    C: <Terminal className="w-3 h-3" />,
    "C++": <Terminal className="w-3 h-3" />,
    TailwindCSS: <Sparkles className="w-3 h-3" />,
    SQLite: <Layers className="w-3 h-3" />,
    CSS3: <Sparkles className="w-3 h-3" />,
    "Drizzle ORM": <Layers className="w-3 h-3" />,
    "Framer Motion": <Zap className="w-3 h-3" />,
    "Three.js": <Sparkles className="w-3 h-3" />,
  };

  return (
    <m.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={transitionConfig}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onPreview(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPreview(project);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${project.title}`}
      className="relative group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-2xl"
      style={{
        transform: shouldReduceMotion
          ? "none"
          : `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: "preserve-3d",
        transition: shouldReduceMotion ? "none" : "transform 0.1s ease-out",
      }}
    >
      {/* Outer Glow */}
      <m.div
        animate={{ opacity: isHovered ? 0.8 : 0 }}
        className="absolute -inset-1 rounded-2xl blur-xl"
        style={{
          background: `radial-gradient(circle, ${catColor.glow} 0%, transparent 70%)`
        }}
      />

      {/* Card */}
      <div
        className="relative rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 10, 35, 0.95) 0%, rgba(10, 8, 25, 0.98) 100%)',
          border: `1px solid ${isHovered ? catColor.text + '50' : 'rgba(100, 100, 160, 0.2)'}`,
          boxShadow: isHovered
            ? `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px ${catColor.glow}`
            : '0 10px 40px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Scanline effect on hover */}
        {isHovered && (
          <m.div
            className="absolute inset-0 pointer-events-none z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 212, 255, 0.03) 2px, rgba(0, 212, 255, 0.03) 4px)',
              }}
            />
          </m.div>
        )}

        {/* Image Area */}
        <div className="relative h-48 overflow-hidden">
          {project.imageUrl ? (
            <>
              <OptimizedImage
                src={project.imageUrl}
                alt={project.imageAlt || `Screenshot of ${project.title}: ${project.description.substring(0, 100)}...`}
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover"
                width={600}
                height={300}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center p-8 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(20, 15, 40, 1) 0%, rgba(30, 20, 50, 1) 100%)' }}
            >
              <m.div
                animate={{ rotate: isHovered && !shouldReduceMotion ? 360 : 0 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="flex flex-col items-center gap-4"
              >
                <Folder className="w-16 h-16 text-gray-700" />
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Repository</div>
                  <div className="text-xs text-gray-600">Assets restricted or unavailable</div>
                </div>
              </m.div>
            </div>
          )}

          {/* Overlay Actions */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-center pb-4 gap-3"
          >
            {project.githubUrl && (
              <m.a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-full transition-all"
                style={{
                  background: 'rgba(0, 212, 255, 0.2)',
                  border: '1px solid rgba(0, 212, 255, 0.4)'
                }}
                aria-label="View Code"
              >
                <Github className="w-5 h-5 text-cyan-400" />
              </m.a>
            )}
            {project.liveUrl && (
              <m.a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-full transition-all"
                style={{
                  background: 'rgba(168, 85, 247, 0.2)',
                  border: '1px solid rgba(168, 85, 247, 0.4)'
                }}
                aria-label="View Live Demo"
              >
                <ExternalLink className="w-5 h-5 text-purple-400" />
              </m.a>
            )}
            <m.button
              onClick={() => onPreview(project)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-full transition-all"
              style={{
                background: 'rgba(236, 72, 153, 0.2)',
                border: '1px solid rgba(236, 72, 153, 0.4)'
              }}
              aria-label="Quick Preview"
            >
              <Eye className="w-5 h-5 text-pink-400" />
            </m.button>
          </m.div>

          {/* Category & Flagship Badges */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-black/50 text-gray-300 border border-white/10 backdrop-blur-md" title="Views">
                <Eye className="w-3 h-3" /> {project.viewCount || 0}
              </span>
              <m.span
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider"
                style={{
                  background: catColor.bg,
                  color: catColor.text,
                  border: `1px solid ${catColor.text}40`,
                  boxShadow: `0 0 15px ${catColor.glow}`
                }}
              >
                {project.category}
              </m.span>
            </div>
            {project.isFlagship && (
              <m.span
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
              >
                Flagship Case Study
              </m.span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col flex-grow">
          <m.h3
            className="text-lg font-bold mb-2 flex items-center gap-2 transition-colors"
            style={{ color: isHovered ? catColor.text : '#e2e8f0' }}
          >
            {project.title}
            <m.span
              initial={{ x: -5, opacity: 0 }}
              animate={{ x: isHovered ? 0 : -5, opacity: isHovered ? 1 : 0 }}
            >
              <ArrowRight className="w-4 h-4" />
            </m.span>
          </m.h3>
          <p className="text-gray-400 mb-4 line-clamp-2 flex-grow text-sm leading-relaxed">
            {project.description}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1.5 mb-4 pt-3 border-t border-gray-800/50">
            {project.techStack.slice(0, 4).map((tech: string, idx: number) => (
              <m.span
                key={tech}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${techColors[tech] || "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}
              >
                {techIcons[tech]}
                {tech}
              </m.span>
            ))}
            {project.techStack.length > 4 && (
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-gray-800/50 text-gray-500 border border-gray-700/50">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: 'rgba(30, 30, 50, 0.8)',
                  border: '1px solid rgba(100, 100, 140, 0.3)',
                  color: 'var(--color-muted-text)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
                  e.currentTarget.style.color = '#00d4ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(100, 100, 140, 0.3)';
                  e.currentTarget.style.color = '#a0a0b0';
                }}
              >
                <Github className="w-3.5 h-3.5" />
                Code
              </a>
            )}
            <Link href={`/project/${project.id}`} className="flex-1">
              <button
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: `linear-gradient(135deg, ${catColor.bg}, rgba(15, 10, 35, 0.9))`,
                  border: `1px solid ${catColor.text}50`,
                  color: catColor.text,
                  boxShadow: `0 0 20px ${catColor.glow}`
                }}
              >
                {project.isFlagship ? "Read case study" : "Details"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
            {/* API badge — proves data is from a live REST API */}
            <Link href={`/project/${project.id}`}>
              <button
                className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg text-[10px] font-bold font-mono transition-all"
                style={{
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  color: 'rgba(34, 197, 94, 0.7)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.6)';
                  e.currentTarget.style.color = '#22c55e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.25)';
                  e.currentTarget.style.color = 'rgba(34, 197, 94, 0.7)';
                }}
                title="View live API response"
              >
                <Terminal className="w-3 h-3" />
                API
              </button>
            </Link>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 rounded-tl-2xl" style={{ borderColor: `${catColor.text}30` }} />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 rounded-br-2xl" style={{ borderColor: `${catColor.text}30` }} />
      </div>
    </m.div>
  );
};

// Enhanced Preview Modal
const PreviewModal = ({ project, onClose }: { project: Project; onClose: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store last focused element
    lastFocusedRef.current = document.activeElement as HTMLElement;

    // Focus close button on open
    const closeButton = containerRef.current?.querySelector('button');
    closeButton?.focus();

    // Body scroll lock
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      // Return focus on close
      lastFocusedRef.current?.focus();
      // Restore scroll
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Focus Trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const catColors: Record<string, { glow: string; text: string }> = {
    System: { glow: 'rgba(0, 212, 255, 0.3)', text: '#00d4ff' },
    Academic: { glow: 'rgba(168, 85, 247, 0.3)', text: '#a855f7' },
    Backend: { glow: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
    Utility: { glow: 'rgba(236, 72, 153, 0.3)', text: '#ec4899' },
    Web: { glow: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' },
  };
  const catColor = catColors[project.category] || catColors.Utility;

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <m.div
        ref={containerRef}
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="relative w-full max-w-3xl md:rounded-2xl overflow-hidden h-full md:h-auto md:max-h-[90vh] flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 10, 40, 0.98) 0%, rgba(10, 8, 30, 0.98) 100%)',
          border: `1px solid ${catColor.text}40`,
          boxShadow: `0 30px 100px rgba(0, 0, 0, 0.6), 0 0 60px ${catColor.glow}`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(100, 100, 140, 0.2)' }}>
          <div>
            <h3 id="modal-title" className="text-xl font-bold text-white">{project.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className="font-medium" style={{ color: catColor.text }}>{project.category}</span>
              <span className="text-gray-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {project.viewCount || 0}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {project.imageUrl && (
            <div className="relative rounded-xl overflow-hidden mb-5">
              <OptimizedImage
                src={project.imageUrl}
                alt={project.imageAlt || `Detailed view of the ${project.title} project interface and key features`}
                className="w-full h-48 md:h-64 object-cover"
                width={1200}
                height={640}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>
          )}

          <p id="modal-description" className="text-gray-300 mb-5 leading-relaxed">{project.description}</p>

          <div className="mb-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech: string) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{
                    background: 'rgba(0, 212, 255, 0.1)',
                    color: 'var(--color-cyan)',
                    border: '1px solid rgba(0, 212, 255, 0.3)'
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:bg-white/10"
                style={{
                  background: 'rgba(30, 30, 50, 0.8)',
                  border: '1px solid rgba(100, 100, 140, 0.3)',
                  color: 'var(--color-muted-text)'
                }}
              >
                <Github className="w-4 h-4" />
                View Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:brightness-110 flex-1"
                style={{
                  background: `linear-gradient(135deg, ${catColor.glow}, rgba(15, 10, 35, 0.9))`,
                  border: `1px solid ${catColor.text}50`,
                  color: catColor.text
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            )}
          </div>
        </div>

        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 rounded-tl-2xl" style={{ borderColor: `${catColor.text}30` }} />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 rounded-br-2xl" style={{ borderColor: `${catColor.text}30` }} />
      </m.div>
    </m.div>
  );
};

// Enhanced Filter Button
const FilterButton = ({ label, isActive, onClick, count }: { label: string; isActive: boolean; onClick: () => void; count?: number }) => {
  const activeStyle = {
    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%)',
    border: '1px solid rgba(0, 212, 255, 0.5)',
    color: 'var(--color-cyan)',
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
  };

  const inactiveStyle = {
    background: 'rgba(20, 15, 40, 0.6)',
    border: '1px solid rgba(100, 100, 140, 0.2)',
    color: 'var(--color-muted-text)'
  };

  // Don't show categories with 0 count (except "All")
  if (label !== "All" && count === 0) return null;

  return (
    <m.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2"
      style={isActive ? activeStyle : inactiveStyle}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          className="text-xs px-2 py-0.5 rounded-full font-bold"
          style={{
            background: isActive ? 'rgba(0, 212, 255, 0.3)' : 'rgba(100, 100, 140, 0.2)',
            color: isActive ? '#00d4ff' : '#6b6b7b'
          }}
        >
          {count}
        </span>
      )}
    </m.button>
  );
};

export default function Projects() {
  const { data: projects, isLoading, error } = useProjects();
  const [filter, setFilter] = useState("All");
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  const categories = ["All", "Web", "System", "Academic", "Backend", "Utility"];

  const filteredProjects = (Array.isArray(projects) ? projects : [])?.filter(p => {
    if (p.isHidden) return false;

    if (filter === "All") return true;
    return p.category === filter;
  }) || [];

  const getCategoryCount = (cat: string) => {
    const allProjects = (Array.isArray(projects) ? projects : []).filter(p => !p.isHidden);
    if (cat === "All") return allProjects.length;
    return allProjects.filter(p => p.category === cat).length;
  };

  return (
    <section
      id="projects"
      className="relative py-20 md:py-28 overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <m.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)'
            }}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">Featured Work</span>
          </m.div>

          <m.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 40%, #ec4899 80%, #00d4ff 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient-x 8s ease infinite'
            }}
          >
            Projects
          </m.h2>

          <m.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-xl mx-auto"
          >
            A collection of projects demonstrating my journey through software engineering and system design.
          </m.p>
          <m.div
            className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-3 mb-12 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {categories.map((category) => (
              <FilterButton
                key={category}
                label={category}
                isActive={filter === category}
                onClick={() => setFilter(category)}
                count={getCategoryCount(category)}
              />
            ))}
          </m.div>

          {/* Projects Grid - Bento Style */}
          {isLoading ? (
            <div className="flex flex-wrap justify-center gap-8">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] h-[450px] rounded-3xl animate-pulse"
                  style={{ background: 'rgba(20, 15, 40, 0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
                />
              ))}
            </div>
          ) : (
            <m.div
              layout
              className="flex flex-wrap justify-center gap-8"
            >
              <AnimatePresence mode="popLayout">
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                >
                  {filteredProjects.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onPreview={setPreviewProject}
                      index={index}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </m.div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-red-400 mb-2">Failed to load projects.</p>
              <p className="text-sm text-gray-500">
                {error instanceof Error ? error.message : 'Please try again later.'}
              </p>
            </div>
          )}

          {filteredProjects.length === 0 && !isLoading && !error && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Folder className="w-16 h-16 mx-auto text-gray-700 mb-4" />
              <p className="text-gray-500">No projects found in this category.</p>
            </m.div>
          )}

          {/* Project Count */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: 'var(--color-purple)'
              }}
            >
              <Cpu className="w-4 h-4" />
              {filteredProjects.length} Projects Displayed
            </div>
          </m.div>
        </div>

        {/* Preview Modal */}
        <AnimatePresence>
          {previewProject && (
            <PreviewModal project={previewProject} onClose={() => setPreviewProject(null)} />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
