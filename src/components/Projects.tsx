import { useState, useRef, useMemo, useEffect } from "react";
import { FloatingParticles } from "@/components/FloatingParticles";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects } from "@/hooks/use-portfolio";
import { Github, ExternalLink, Folder, Code, Layers, X, ArrowRight, Sparkles, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";



// Enhanced 3D Tilt Card with Sci-Fi styling
const ProjectCard = ({ project, onPreview, index }: { project: any; onPreview: (p: any) => void; index: number }) => {
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
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative group"
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.1s ease-out",
      }}
    >
      {/* Outer Glow */}
      <motion.div
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
          <motion.div
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
          </motion.div>
        )}

        {/* Image Area */}
        <div className="relative h-48 overflow-hidden">
          {project.imageUrl ? (
            <>
              <motion.img
                src={project.imageUrl}
                alt={project.title}
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0520] via-transparent to-transparent" />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(20, 15, 40, 1) 0%, rgba(30, 20, 50, 1) 100%)' }}
            >
              <motion.div
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              >
                <Folder className="w-16 h-16 text-gray-600" />
              </motion.div>
            </div>
          )}

          {/* Overlay Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-center pb-4 gap-3"
          >
            {project.githubUrl && (
              <motion.a
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
              </motion.a>
            )}
            {project.liveUrl && (
              <motion.a
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
              </motion.a>
            )}
            <motion.button
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
              <Layers className="w-5 h-5 text-pink-400" />
            </motion.button>
          </motion.div>

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <motion.span
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
            </motion.span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col flex-grow">
          <motion.h3
            className="text-lg font-bold mb-2 flex items-center gap-2 transition-colors"
            style={{ color: isHovered ? catColor.text : '#e2e8f0' }}
          >
            {project.title}
            <motion.span
              initial={{ x: -5, opacity: 0 }}
              animate={{ x: isHovered ? 0 : -5, opacity: isHovered ? 1 : 0 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </motion.h3>
          <p className="text-gray-400 mb-4 line-clamp-2 flex-grow text-sm leading-relaxed">
            {project.description}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1.5 mb-4 pt-3 border-t border-gray-800/50">
            {project.techStack.slice(0, 4).map((tech: string, idx: number) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border ${techColors[tech] || "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}
              >
                {tech}
              </motion.span>
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
                  color: '#a0a0b0'
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
                Details
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 rounded-tl-2xl" style={{ borderColor: `${catColor.text}30` }} />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 rounded-br-2xl" style={{ borderColor: `${catColor.text}30` }} />
      </div>
    </motion.div>
  );
};

// Enhanced Preview Modal
const PreviewModal = ({ project, onClose }: { project: any; onClose: () => void }) => {
  const catColors: Record<string, { glow: string; text: string }> = {
    System: { glow: 'rgba(0, 212, 255, 0.3)', text: '#00d4ff' },
    Academic: { glow: 'rgba(168, 85, 247, 0.3)', text: '#a855f7' },
    Backend: { glow: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
    Utility: { glow: 'rgba(236, 72, 153, 0.3)', text: '#ec4899' },
    Web: { glow: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' },
  };
  const catColor = catColors[project.category] || catColors.Utility;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 10, 40, 0.98) 0%, rgba(10, 8, 30, 0.98) 100%)',
          border: `1px solid ${catColor.text}40`,
          boxShadow: `0 30px 100px rgba(0, 0, 0, 0.6), 0 0 60px ${catColor.glow}`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(100, 100, 140, 0.2)' }}>
          <div>
            <h3 className="text-xl font-bold text-white">{project.title}</h3>
            <span className="text-sm font-medium" style={{ color: catColor.text }}>{project.category}</span>
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
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {project.imageUrl && (
            <div className="relative rounded-xl overflow-hidden mb-5">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0820] via-transparent to-transparent" />
            </div>
          )}

          <p className="text-gray-300 mb-5 leading-relaxed">{project.description}</p>

          <div className="mb-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{
                    background: 'rgba(0, 212, 255, 0.1)',
                    color: '#00d4ff',
                    border: '1px solid rgba(0, 212, 255, 0.3)'
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all"
                style={{
                  background: 'rgba(30, 30, 50, 0.8)',
                  border: '1px solid rgba(100, 100, 140, 0.3)',
                  color: '#a0a0b0'
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all"
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
      </motion.div>
    </motion.div>
  );
};

// Enhanced Filter Button
const FilterButton = ({ label, isActive, onClick, count }: { label: string; isActive: boolean; onClick: () => void; count?: number }) => {
  const activeStyle = {
    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%)',
    border: '1px solid rgba(0, 212, 255, 0.5)',
    color: '#00d4ff',
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
  };

  const inactiveStyle = {
    background: 'rgba(20, 15, 40, 0.6)',
    border: '1px solid rgba(100, 100, 140, 0.2)',
    color: '#8b8b9b'
  };

  // Don't show categories with 0 count (except "All")
  if (label !== "All" && count === 0) return null;

  return (
    <motion.button
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
    </motion.button>
  );
};

export default function Projects() {
  const { data: projects, isLoading, error } = useProjects();
  const [filter, setFilter] = useState("All");
  const [previewProject, setPreviewProject] = useState<any>(null);

  const categories = ["All", "Web", "System", "Academic", "Backend", "Utility"];

  const filteredProjects = (Array.isArray(projects) ? projects : [])?.filter(p => {
    const isExcluded = p.title.toLowerCase().includes("netflix") ||
      p.title.toLowerCase().includes("amazon") ||
      p.title === "Python Utilities & Scripts";
    if (isExcluded) return false;

    if (filter === "All") return true;
    return p.category === filter;
  }).slice(0, 3) || [];

  const getCategoryCount = (cat: string) => {
    const allProjects = (Array.isArray(projects) ? projects : []).filter(p => {
      const isExcluded = p.title.toLowerCase().includes("netflix") || p.title.toLowerCase().includes("amazon");
      return !isExcluded;
    });
    if (cat === "All") return allProjects.length;
    return allProjects.filter(p => p.category === cat).length;
  };

  return (
    <section
      id="projects"
      className="relative py-20 md:py-28 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #050510 0%, #0a0520 30%, #0d0525 60%, #050510 100%)'
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <FloatingParticles />

        {/* Nebula gradients */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 20% 30%, rgba(0, 212, 255, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 50% 40% at 80% 60%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 70% 50% at 50% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 40%)
            `
          }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)'
            }}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">Featured Work</span>
          </motion.div>

          <motion.h2
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
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-xl mx-auto"
          >
            A collection of projects demonstrating my journey through software engineering and system design.
          </motion.p>
        </div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12"
        >
          {categories.map((cat) => (
            <FilterButton
              key={cat}
              label={cat}
              isActive={filter === cat}
              onClick={() => setFilter(cat)}
              count={getCategoryCount(cat)}
            />
          ))}
        </motion.div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-[400px] rounded-2xl animate-pulse"
                style={{ background: 'rgba(20, 15, 40, 0.5)' }}
              />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onPreview={setPreviewProject}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Folder className="w-16 h-16 mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500">No projects found in this category.</p>
          </motion.div>
        )}

        {/* Project Count */}
        <motion.div
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
              color: '#a855f7'
            }}
          >
            <Cpu className="w-4 h-4" />
            {filteredProjects.length} Projects Displayed
          </div>
        </motion.div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewProject && (
          <PreviewModal project={previewProject} onClose={() => setPreviewProject(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
