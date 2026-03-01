import { m, useInView } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import { useMindset } from "@/hooks/use-portfolio";
import type { Mindset } from "@shared/schema";
import { Brain, Layers, Zap, Users, Code2, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  Layers,
  Zap,
  Users,
  Code2,
  Sparkles,
  ArrowRight
};

// Principle Card with Connection
const PrincipleCard = ({
  principle,
  index,
  isActive,
  onClick
}: {
  principle: Omit<Mindset, "icon"> & { icon: React.ElementType };
  index: number;
  isActive: boolean;
  onClick: () => void;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="relative cursor-pointer"
    >
      {/* Connection line to next card */}
      {index < 3 && (
        <m.div
          initial={{ width: 0 }}
          animate={isInView ? { width: "100%" } : {}}
          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
          className="absolute hidden lg:block top-1/2 -right-6 h-0.5 w-12 bg-gradient-to-r from-primary/50 to-transparent z-10"
        />
      )}

      <m.div
        whileHover={{ scale: 1.02, y: -5 }}
        animate={{
          borderColor: isActive ? "rgba(124,58,237,0.5)" : "rgba(0,0,0,0.1)",
          boxShadow: isActive ? "0 20px 40px -10px rgba(124,58,237,0.3)" : "0 0 0 0 transparent"
        }}
        className={`relative p-8 bg-[#0a0520]/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 h-full group ${isActive ? 'border-primary/50' : 'border-white/10 hover:border-primary/30'}`}
      >
        {/* Number badge */}
        <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg">
          {index + 1}
        </div>

        {/* Icon */}
        <m.div
          animate={{ rotate: isActive ? 360 : 0 }}
          transition={{ duration: 0.5 }}
          className={`mb-6 p-4 rounded-2xl w-fit transition-all duration-300 ${isActive
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
            }`}
        >
          {(() => {
            const Icon = principle.icon;
            return <Icon className="w-7 h-7" />;
          })()}
        </m.div>

        {/* Content */}
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
          {principle.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {principle.description}
        </p>

        {/* Expand indicator */}
        <m.div
          animate={{ x: isActive ? 5 : 0, opacity: isActive ? 1 : 0.5 }}
          className="absolute bottom-6 right-6"
        >
          <ChevronRight className="w-5 h-5 text-primary" />
        </m.div>
      </m.div>
    </m.div>
  );
};

// Expanded Detail Panel
const DetailPanel = ({ principle }: { principle: Omit<Mindset, "icon"> & { icon: React.ElementType } }) => (
  <m.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    className="overflow-hidden"
  >
    <div className="p-8 bg-gradient-to-br from-primary/10 via-card to-primary/5 rounded-3xl border border-primary/20 mt-6">
      <div className="flex items-start gap-6">
        <div className="p-4 bg-primary/20 rounded-2xl">
          {(() => {
            const Icon = principle.icon;
            return <Icon className="w-10 h-10 text-primary" />;
          })()}
        </div>
        <div className="flex-1">
          <h4 className="text-2xl font-bold mb-3">{principle.title}</h4>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {principle.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {principle.tags.map((tag: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </m.div>
);

const principles = [
  {
    id: 1,
    title: "Fundamentals over Frameworks",
    description: "Prioritizing strong core understanding of languages and systems before adopting high-level abstractions. Frameworks come and go, but fundamentals remain constant.",
    icon: Code2,
    tags: ["Data Structures", "Algorithms", "Design Patterns", "System Design"]
  },
  {
    id: 2,
    title: "Simplicity over Complexity",
    description: "Designing straightforward solutions that solve the problem efficiently without over-engineering. The best code is code you don't have to write.",
    icon: Layers,
    tags: ["Clean Code", "KISS Principle", "Minimal Dependencies", "Pragmatic"]
  },
  {
    id: 3,
    title: "Logic before Optimization",
    description: "Focusing on correctness and clear business logic before premature performance tuning. Get it working, then get it fast.",
    icon: Zap,
    tags: ["Test-Driven", "Iterative", "Profiling", "Benchmarking"]
  },
  {
    id: 4,
    title: "Readable Code",
    description: "Writing maintainable, well-documented code that is intuitive for other engineers to understand and extend.",
    icon: Users,
    tags: ["Documentation", "Naming Conventions", "Code Reviews", "Collaboration"]
  },
];

export default function EngineeringMindset() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { data: apiPrinciples, isLoading } = useMindset();

  const principlesData = useMemo(() => {
    if (!apiPrinciples || apiPrinciples.length === 0) return principles;
    return apiPrinciples.map(p => ({
      ...p,
      icon: ICON_MAP[p.icon] || Brain
    }));
  }, [apiPrinciples]);

  return (
    <section id="mindset" className="section-container bg-muted/30 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-16">
        <m.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4"
        >
          <Brain className="w-4 h-4" />
          Philosophy
        </m.div>
        <m.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold mb-4"
        >
          Engineering Mindset
        </m.h2>
        <m.div
          initial={{ width: 0 }}
          whileInView={{ width: "5rem" }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="h-1.5 bg-primary mx-auto rounded-full mb-6"
        />
        <m.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground max-w-xl mx-auto"
        >
          Core principles that guide my approach to software development
        </m.p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Flowchart Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 mb-8">
          {principlesData.map((principle, index) => (
            <PrincipleCard
              key={index}
              principle={principle}
              index={index}
              isActive={activeIndex === index}
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Expanded Detail */}
        {activeIndex !== null && (
          <DetailPanel principle={principlesData[activeIndex]} />
        )}

        {/* Quote Section */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 relative"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl" />

          <div className="relative p-12 bg-[#0a0520]/80 backdrop-blur-sm rounded-3xl border border-white/10 text-center">
            {/* Animated quote icon */}
            <m.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="flex justify-center mb-6"
            >
              <div className="p-4 bg-primary/10 rounded-full">
                <Brain className="w-10 h-10 text-primary" />
              </div>
            </m.div>

            <m.blockquote
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl italic text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              "Engineering is not just about solving problems, it's about solving them in a way that is{" "}
              <span className="text-primary font-semibold">robust</span>,{" "}
              <span className="text-primary font-semibold">scalable</span>, and{" "}
              <span className="text-primary font-semibold">maintainable</span>{" "}
              for years to come."
            </m.blockquote>

            {/* Decorative sparkles */}
            <div className="absolute top-8 left-8">
              <Sparkles className="w-6 h-6 text-primary/30" />
            </div>
            <div className="absolute bottom-8 right-8">
              <Sparkles className="w-6 h-6 text-primary/30" />
            </div>
          </div>
        </m.div>

        {/* CTA */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <m.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-full font-medium hover:bg-primary hover:text-primary-foreground transition-all"
          >
            See my principles in action
            <ArrowRight className="w-4 h-4" />
          </m.button>
        </m.div>
      </div>
    </section>
  );
}
