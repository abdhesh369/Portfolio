import { useRoute, Link } from "wouter";
import { useProjects } from "@/hooks/use-portfolio";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Code2,
  Lightbulb,
  Settings,
  AlertCircle,
  BookOpen,
  Layers,
  Sparkles,
  ChevronRight
} from "lucide-react";
import DOMPurify from "dompurify";
import { SEO } from "@/components/SEO";

// Floating particles (reused from main components)
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 10 + Math.random() * 8,
    size: 2 + Math.random() * 4,
    color: Math.random() > 0.5 ? 'cyan' : 'purple'
  }));

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
              ? 'radial-gradient(circle, rgba(0, 212, 255, 0.6) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%)'
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.7, 0.2],
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

// Section Card Component
const SectionCard = ({
  title,
  icon: Icon,
  children,
  accentColor = '#00d4ff',
  variant = 'default',
  className
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  accentColor?: string;
  variant?: 'default' | 'warning' | 'success';
  className?: string;
}) => {
  const bgColors = {
    default: 'rgba(15, 10, 35, 0.8)',
    warning: 'rgba(239, 68, 68, 0.05)',
    success: 'rgba(34, 197, 94, 0.05)'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${bgColors[variant]} 0%, rgba(10, 8, 25, 0.9) 100%)`,
        border: `1px solid ${accentColor}25`,
        boxShadow: `0 10px 40px rgba(0, 0, 0, 0.3)`
      }}
    >
      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 rounded-tl-2xl"
        style={{ borderColor: `${accentColor}40` }}
      />
      <div
        className="absolute bottom-0 right-0 w-10 h-10 border-r-2 border-b-2 rounded-br-2xl"
        style={{ borderColor: `${accentColor}40` }}
      />

      <div className="p-6 md:p-8">
        <h3 className="text-xl font-bold flex items-center gap-3 mb-4">
          <div
            className="p-2 rounded-lg"
            style={{
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}30`
            }}
          >
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <span className="text-white">{title}</span>
        </h3>
        <div className="text-gray-300 leading-relaxed w-full">{children}</div>
      </div>
    </motion.div>
  );
};

// Tech Badge Component
const TechBadge = ({ tech }: { tech: string }) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    React: { bg: 'rgba(0, 212, 255, 0.1)', text: '#00d4ff', border: 'rgba(0, 212, 255, 0.3)' },
    TypeScript: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
    JavaScript: { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308', border: 'rgba(234, 179, 8, 0.3)' },
    Python: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
    "Node.js": { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
    Express: { bg: 'rgba(100, 100, 140, 0.1)', text: '#8b8ba0', border: 'rgba(100, 100, 140, 0.3)' },
    SQLite: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
    TailwindCSS: { bg: 'rgba(0, 212, 255, 0.1)', text: '#00d4ff', border: 'rgba(0, 212, 255, 0.3)' },
    CSS3: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' },
    "C++": { bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.3)' },
    C: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' },
  };

  const color = colors[tech] || { bg: 'rgba(100, 100, 140, 0.1)', text: '#8b8ba0', border: 'rgba(100, 100, 140, 0.3)' };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
      style={{
        background: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
        boxShadow: `0 0 15px ${color.bg}`
      }}
    >
      {tech}
    </motion.span>
  );
};

export default function ProjectDetail() {
  const [, params] = useRoute("/project/:id");
  const { data: projects, isLoading } = useProjects();

  const project = projects?.find(p => p.id === parseInt(params?.id || "0"));



  // Category colors
  const categoryColors: Record<string, { glow: string; text: string }> = {
    System: { glow: 'rgba(0, 212, 255, 0.3)', text: '#00d4ff' },
    Academic: { glow: 'rgba(168, 85, 247, 0.3)', text: '#a855f7' },
    Backend: { glow: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
    Utility: { glow: 'rgba(236, 72, 153, 0.3)', text: '#ec4899' },
    Web: { glow: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' },
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen pt-24 px-4 flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #050510 0%, #0a0520 50%, #050510 100%)' }}
      >
        <div className="w-full max-w-4xl space-y-8">
          <div className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(30, 25, 50, 0.5)' }} />
          <div className="h-64 rounded-2xl animate-pulse" style={{ background: 'rgba(30, 25, 50, 0.5)' }} />
          <div className="space-y-4">
            <div className="h-8 rounded w-1/4 animate-pulse" style={{ background: 'rgba(30, 25, 50, 0.5)' }} />
            <div className="h-32 rounded animate-pulse" style={{ background: 'rgba(30, 25, 50, 0.5)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div
        className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #050510 0%, #0a0520 50%, #050510 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Project Not Found</h1>
          <p className="text-gray-400 mb-8">The project you're looking for doesn't exist.</p>
          <Link href="/">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(15, 10, 35, 0.9) 100%)',
                border: '1px solid rgba(0, 212, 255, 0.4)',
                color: '#00d4ff'
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const catColor = categoryColors[project.category] || categoryColors.Utility;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #050510 0%, #0a0520 30%, #0d0525 60%, #050510 100%)'
      }}
    >
      <SEO
        slug={`project-${project.id}`}
        title={project.title ? `${project.title} - Abdhesh Sah` : "Project Detail"}
        description={project.description || "Project details and overview."}
        image={project.imageUrl || undefined}
        keywords={project.techStack?.join(", ")}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          "name": project.title,
          "description": project.description,
          "codeRepository": project.githubUrl,
          "programmingLanguage": project.techStack,
          "author": {
            "@type": "Person",
            "name": "Abdhesh Sah"
          },
          "dateCreated": new Date().toISOString().split('T')[0], // Approximated
        }}
      />

      {/* Background */}
      <div className="absolute inset-0">
        <FloatingParticles />

        {/* Nebula gradients */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 30% 20%, ${catColor.glow} 0%, transparent 50%),
              radial-gradient(ellipse 50% 40% at 70% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)
            `
          }}
        />
      </div>

      <div className="relative z-10 pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Breadcrumb & Back Button */}
            <div className="flex items-center gap-3">
              <Link href="/">
                <motion.button
                  whileHover={{ x: -3 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    background: 'rgba(20, 15, 40, 0.6)',
                    border: '1px solid rgba(100, 100, 140, 0.2)',
                    color: '#8b8ba0'
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Home
                </motion.button>
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-600" />
              <span className="text-gray-500">Projects</span>
              <ChevronRight className="w-4 h-4 text-gray-600" />
              <span style={{ color: catColor.text }}>{project.title}</span>
            </div>

            {/* Hero Section */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                    style={{
                      background: `${catColor.text}15`,
                      border: `1px solid ${catColor.text}40`
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" style={{ color: catColor.text }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: catColor.text }}>
                      {project.category}
                    </span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl md:text-5xl font-bold mb-2"
                    style={{
                      background: `linear-gradient(135deg, #ffffff 0%, ${catColor.text} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {project.title}
                  </motion.h1>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {project.githubUrl && (
                    <motion.a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all"
                      style={{
                        background: 'rgba(25, 20, 45, 0.8)',
                        border: '1px solid rgba(100, 100, 140, 0.3)',
                        color: '#a0a0b0'
                      }}
                    >
                      <Github className="w-4 h-4" />
                      Source Code
                    </motion.a>
                  )}
                  {project.liveUrl && (
                    <motion.a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${catColor.glow} 0%, rgba(15, 10, 35, 0.9) 100%)`,
                        border: `1px solid ${catColor.text}50`,
                        color: catColor.text,
                        boxShadow: `0 0 25px ${catColor.glow}`
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </motion.a>
                  )}
                </div>
              </div>

              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative rounded-2xl overflow-hidden"
                style={{
                  border: `1px solid ${catColor.text}30`,
                  boxShadow: `0 20px 80px rgba(0, 0, 0, 0.5), 0 0 60px ${catColor.glow}`
                }}
              >
                <div className="aspect-video relative">
                  {project.imageUrl ? (
                    <>
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        width={1200}
                        height={675}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent" />
                    </>
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(20, 15, 40, 1) 0%, rgba(30, 20, 50, 1) 100%)' }}
                    >
                      <Layers className="w-20 h-20 text-gray-700" />
                    </div>
                  )}
                </div>

                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 rounded-tl-2xl" style={{ borderColor: `${catColor.text}40` }} />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 rounded-br-2xl" style={{ borderColor: `${catColor.text}40` }} />
              </motion.div>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Motivation */}
                <SectionCard title="Motivation" icon={Lightbulb} accentColor="#00d4ff">
                  <div
                    className="prose prose-invert max-w-none text-gray-300"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.motivation || project.description) }}
                  />
                </SectionCard>

                {/* The Problem */}
                <SectionCard title="The Problem" icon={AlertCircle} accentColor="#ef4444" variant="warning">
                  <div
                    className="prose prose-invert max-w-none text-gray-300"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.problemStatement || "Problem statement not documented yet.") }}
                  />
                </SectionCard>

                {/* System Design */}
                <SectionCard title="System Design" icon={Settings} accentColor="#a855f7">
                  <div
                    className="prose prose-invert max-w-none text-gray-300"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.systemDesign || "System design details coming soon.") }}
                  />
                </SectionCard>

                {/* Challenges & Learnings Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <SectionCard title="Key Challenges" icon={Settings} accentColor="#f59e0b">
                    <div
                      className="prose prose-invert max-w-none text-gray-300 text-sm"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.challenges || "No challenges documented.") }}
                    />
                  </SectionCard>

                  <SectionCard title="Key Learnings" icon={BookOpen} accentColor="#22c55e" variant="success">
                    <div
                      className="prose prose-invert max-w-none text-gray-300 text-sm"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.learnings || "Continuing to learn and iterate.") }}
                    />
                  </SectionCard>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Technologies */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="sticky top-24 rounded-2xl p-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.9) 0%, rgba(10, 8, 25, 0.95) 100%)',
                    border: '1px solid rgba(100, 100, 140, 0.2)'
                  }}
                >
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech: string, idx: number) => (
                      <TechBadge key={idx} tech={tech} />
                    ))}
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-800/50 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category</span>
                      <span style={{ color: catColor.text }}>{project.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tech Count</span>
                      <span className="text-gray-300">{project.techStack.length}</span>
                    </div>
                    {project.liveUrl && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className="text-green-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          Live
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Back to Projects */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center pt-8 border-t border-gray-800/30"
            >
              <Link href="/#projects">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
                  style={{
                    background: 'rgba(20, 15, 40, 0.6)',
                    border: '1px solid rgba(100, 100, 140, 0.3)',
                    color: '#a0a0b0'
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  View All Projects
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
