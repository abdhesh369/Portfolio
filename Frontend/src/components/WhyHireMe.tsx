import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { CheckCircle2, Award, Zap, ShieldCheck, Download, ArrowRight, Sparkles, Target, TrendingUp, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

// Animated Counter
const AnimatedCounter = ({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-primary mb-1">
        {count}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
};

// Skill Progress Bar
const SkillBar = ({ skill, level, delay, color }: { skill: string; level: number; delay: number; color: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay }}
      className="mb-4"
    >
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{skill}</span>
        <span className="text-sm text-muted-foreground">{level}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : {}}
          transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </motion.div>
  );
};

interface Point {
  title: string;
  description: string;
  icon: React.ElementType;
}

// Point Card with Hover Effects
const PointCard = ({ point, index }: { point: Point; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Glow Effect */}
      <motion.div
        animate={{ opacity: isHovered ? 0.6 : 0 }}
        className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-3xl blur-xl"
      />

      <div className="relative p-8 bg-[#0a0520]/80 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 h-full hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        {/* Icon */}
        <motion.div
          animate={{
            rotate: isHovered ? 360 : 0,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.5 }}
          className="p-4 bg-primary/10 rounded-2xl text-primary w-fit mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
        >
          <point.icon className="w-7 h-7" />
        </motion.div>

        {/* Content */}
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
          {point.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {point.description}
        </p>

        {/* Hover Indicator */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
          className="absolute bottom-8 right-8"
        >
          <ArrowRight className="w-5 h-5 text-primary" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const points = [
  {
    title: "Strong Fundamentals",
    description: "Solid foundation in electronics, communication engineering, and core computer science principles that enable me to understand systems at a deeper level.",
    icon: Award,
  },
  {
    title: "Honest Representation",
    description: "Clear and truthful showcase of my current technical abilities and project experiences. What you see is what you get.",
    icon: ShieldCheck,
  },
  {
    title: "Growth Mindset",
    description: "High willingness to learn new technologies and adapt to evolving engineering challenges. I thrive on continuous improvement.",
    icon: Zap,
  },
  {
    title: "Disciplined Practice",
    description: "Consistent daily practice in coding and system design to maintain high-quality output and stay sharp.",
    icon: CheckCircle2,
  },
];

const skills = [
  { skill: "Problem Solving", level: 85, color: "bg-gradient-to-r from-violet-500 to-purple-500" },
  { skill: "Learning Speed", level: 90, color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
  { skill: "Communication", level: 80, color: "bg-gradient-to-r from-green-500 to-emerald-500" },
  { skill: "Team Collaboration", level: 85, color: "bg-gradient-to-r from-orange-500 to-yellow-500" },
];

export default function WhyHireMe() {
  return (
    <section id="why-hire-me" className="section-container overflow-hidden">
      {/* Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4"
        >
          <Sparkles className="w-4 h-4" />
          Why Choose Me
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold mb-4"
        >
          Why Hire Me as a Student Engineer
        </motion.h2>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "5rem" }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="h-1.5 bg-primary mx-auto rounded-full"
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-[#0a0520]/80 backdrop-blur-sm rounded-3xl border border-white/10 mb-12"
        >
          <AnimatedCounter value={10} suffix="+" label="Skills Learned" />
          <AnimatedCounter value={5} suffix="+" label="Projects Built" />
          <AnimatedCounter value={500} suffix="+" label="Hours Coding" />
          <AnimatedCounter value={100} suffix="%" label="Dedication" />
        </motion.div>

        {/* Points Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {points.map((point, index) => (
            <PointCard key={index} point={point} index={index} />
          ))}
        </div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 mb-12"
        >
          {/* Soft Skills */}
          <div className="p-8 bg-[#0a0520]/80 backdrop-blur-sm rounded-3xl border border-white/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Core Strengths
            </h3>
            {skills.map((s, i) => (
              <SkillBar key={i} {...s} delay={i * 0.1} />
            ))}
          </div>

          {/* What Sets Me Apart */}
          <div className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border border-primary/20">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              What Sets Me Apart
            </h3>
            <ul className="space-y-4">
              {[
                "Blend of hardware and software knowledge",
                "Strong foundation in data structures & algorithms",
                "Passion for clean, maintainable code",
                "Quick learner with adaptability",
                "Proactive problem-solving approach"
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Tech Stack Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="p-8 bg-[#0a0520]/80 backdrop-blur-sm rounded-3xl border border-white/10">
            <h3 className="text-xl font-bold mb-8 flex items-center justify-center gap-2 text-center text-white">
              <Terminal className="w-5 h-5 text-primary" />
              Development Stack
            </h3>

            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {["TypeScript", "React", "Node.js", "Express", "PostgreSQL", "Drizzle ORM", "Tailwind CSS", "Framer Motion", "Vite", "Docker", "REST APIs", "Git"].map((tech, i) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="px-4 py-2 bg-primary/5 hover:bg-primary/20 border border-primary/20 hover:border-primary/50 text-gray-200 hover:text-white rounded-xl transition-all font-mono text-sm cursor-default shadow-sm"
                >
                  {tech}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center p-12 bg-gradient-to-br from-primary/10 via-card to-primary/5 rounded-3xl border border-primary/20 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>

            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to contribute to your team</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              As a student, I bring fresh perspectives, high energy, and a commitment to professional growth. Let's discuss how I can help your organization succeed.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="h-14 px-8 gap-3 rounded-full font-bold shadow-lg shadow-primary/25 text-base"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = "/Abdhesh_Sah_CV.docx";
                    link.download = "Abdhesh_Sah_CV.docx";
                    link.click();
                  }}
                >
                  <Download className="w-5 h-5" />
                  Download My Resume
                </Button>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: 'smooth' })}
                className="h-14 px-8 bg-[#0a0520]/80 backdrop-blur-sm border border-white/10 text-white rounded-full font-bold hover:bg-white/5 hover:border-cyan-500/50 transition-all flex items-center gap-2"
              >
                Let's Talk
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
