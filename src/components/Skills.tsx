import { motion } from "framer-motion";
import { 
  Code, 
  Code2, 
  Coffee, 
  Database, 
  Layout, 
  FileJson, 
  Cpu, 
  Server, 
  Atom, 
  GitBranch,
  Braces
} from "lucide-react";
import { useSkills } from "@/hooks/use-portfolio";

// Local Skill Type (instead of importing from @shared/schema)
interface Skill {
  id: string | number;
  name: string;
  category: string;
  icon?: string;
}

// Icon mapping
const iconMap: Record<string, any> = {
  Code, 
  Code2, 
  Coffee, 
  Database, 
  Layout, 
  FileJson, 
  Cpu, 
  Server, 
  Atom, 
  GitBranch,
  Braces,
  Snake: Braces
};

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

// Skill Card Component
const SkillCard = ({ skill }: { skill: Skill }) => {
  const IconComponent = skill.icon && iconMap[skill.icon] ? iconMap[skill.icon] : Code;
  
  return (
    <motion.div 
      variants={item} 
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative bg-card p-6 rounded-2xl border-2 border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      
      <div className="relative flex flex-col items-center text-center gap-3">
        {/* Icon */}
        <motion.div 
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm group-hover:shadow-md"
        >
          <IconComponent className="w-6 h-6" />
        </motion.div>
        
        {/* Name */}
        <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
          {skill.name}
        </h4>
        
        {/* Category badge */}
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-all">
          {skill.category}
        </span>
      </div>
    </motion.div>
  );
};

// Loading Skeleton
const SkillsSkeleton = () => (
  <section className="section-container">
    <div className="text-center mb-16">
      <div className="h-12 w-64 bg-muted animate-pulse rounded-lg mx-auto mb-4" />
      <div className="h-1.5 w-20 bg-muted animate-pulse mx-auto rounded-full" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
      ))}
    </div>
  </section>
);

// Category Section Component
const CategorySection = ({ category, skills }: { category: string; skills: Skill[] }) => (
  <div className="mb-12 last:mb-0">
    <motion.h3 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3"
    >
      <span className="w-2 h-8 bg-primary rounded-full" />
      {category}
    </motion.h3>
    <motion.div 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </motion.div>
  </div>
);

// Main Component - Connected to API
export default function Skills() {
  // Fetch skills from API using the hook
  const { data: skills, isLoading, error } = useSkills();

  if (isLoading) {
    return <SkillsSkeleton />;
  }

  if (error) {
    console.error('Skills fetch error:', error);
    return (
      <section className="section-container">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load skills.</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Please try again later.'}
          </p>
        </div>
      </section>
    );
  }

  // Ensure skills is an array
  const skillsArray = Array.isArray(skills) ? skills : [];

  // Group skills by category
  const groupedSkills = skillsArray.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const categories = Object.keys(groupedSkills).sort();

  return (
    <section id="skills" className="section-container scroll-mt-20">
      <div className="text-center mb-16 relative">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-5xl font-bold mb-4"
        >
          Skills & Technologies
        </motion.h2>
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: "5rem" }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="h-1.5 bg-primary mx-auto rounded-full" 
        />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-muted-foreground max-w-2xl mx-auto"
        >
          Technologies and tools I work with to bring ideas to life
        </motion.p>
      </div>
      
      <div className="max-w-6xl mx-auto">
        {categories.length > 0 ? (
          categories.map((category) => (
            <CategorySection 
              key={category} 
              category={category} 
              skills={groupedSkills[category] || []} 
            />
          ))
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>No skills available at the moment.</p>
          </div>
        )}
      </div>

      {/* Skill count badge */}
      {skillsArray.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            {skillsArray.length} Skills & Technologies
          </div>
        </motion.div>
      )}
    </section>
  );
}