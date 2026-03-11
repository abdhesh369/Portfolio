import { useRef, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { type Project } from "@portfolio/shared/schema";
import { OptimizedImage } from "@/components/OptimizedImage";
import { ExternalLink, Github, ArrowRight, Folder, Eye, Zap, Cpu, Layers, Terminal, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface ProjectCardProps {
  project: Project;
  showPinBadge?: boolean;
  priority?: boolean;
}

// Category colors for glow effects
const categoryColors: Record<string, { glow: string; text: string; bg: string }> = {
  System: { glow: 'rgba(0, 212, 255, 0.5)', text: '#00d4ff', bg: 'rgba(0, 212, 255, 0.1)' },
  Academic: { glow: 'rgba(168, 85, 247, 0.5)', text: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
  Backend: { glow: 'rgba(34, 197, 94, 0.5)', text: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  Utility: { glow: 'rgba(236, 72, 153, 0.5)', text: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
  Web: { glow: 'rgba(59, 130, 246, 0.5)', text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
};

// Tech colors
const techColors: Record<string, string> = {
  React: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "Node.js": "bg-green-500/15 text-green-400 border-green-500/30",
  TypeScript: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  JavaScript: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Python: "bg-yellow-600/15 text-yellow-500 border-yellow-600/30",
};

const techIcons: Record<string, React.ReactNode> = {
  React: <CodeIcon className="w-3 h-3" />,
  "Node.js": <Cpu className="w-3 h-3" />,
  TypeScript: <Layers className="w-3 h-3" />,
  Python: <Terminal className="w-3 h-3" />,
};

function CodeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export function ProjectCard({ project, showPinBadge = true, priority = false }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || shouldReduceMotion) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateXValue = (e.clientY - centerY) / 25;
    const rotateYValue = (centerX - e.clientX) / 25;
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const catColor = categoryColors[project.category] || categoryColors.Utility;

  return (
    <Link href={`/project/${project.id}`}>
      <m.div
        ref={cardRef}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative group cursor-pointer outline-none h-full"
        style={{
          transform: shouldReduceMotion
            ? "none"
            : `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.1s ease-out",
        }}
      >
        {/* Outer Glow */}
        <m.div
          animate={{ opacity: isHovered ? 0.6 : 0 }}
          className="absolute -inset-1 rounded-2xl blur-xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle, ${catColor.glow} 0%, transparent 70%)`
          }}
        />

        {/* Card Body */}
        <div
          className="relative rounded-2xl overflow-hidden flex flex-col h-full bg-slate-900/90 border border-white/10 transition-all duration-300 group-hover:border-primary/50"
          style={{
            boxShadow: isHovered
              ? `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px ${catColor.glow}`
              : '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Image */}
          <div className="relative aspect-video overflow-hidden">
            {project.imageUrl ? (
              <OptimizedImage
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                width={800}
                height={450}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <Folder className="w-12 h-12 text-slate-600" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

            {/* Pinned Badge */}
            {showPinBadge && project.isFlagship && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold backdrop-blur-md flex items-center gap-1">
                📌 Pinned
              </div>
            )}

            {/* View Count */}
            <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] text-gray-300 backdrop-blur-md flex items-center gap-1">
              <Eye className="w-3 h-3" /> {project.viewCount || 0}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-grow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                {project.title}
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <span 
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: catColor.bg,
                  color: catColor.text,
                  borderColor: `${catColor.text}40`
                }}
              >
                {project.category}
              </span>
            </div>

            <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
              {project.description}
            </p>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.techStack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border border-white/5 bg-white/5 text-gray-300`}
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 4 && (
                <span className="text-[10px] font-medium text-gray-500 py-0.5">
                  +{project.techStack.length - 4} more
                </span>
              )}
            </div>

            {/* Links */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-500 hover:text-white transition-colors"
                  aria-label="GitHub Repository"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-500 hover:text-white transition-colors"
                  aria-label="Live Demo"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </m.div>
    </Link>
  );
}
