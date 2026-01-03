import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useExperiences } from "@/hooks/use-portfolio";
import { Calendar, Briefcase, GraduationCap, ChevronDown, MapPin, ExternalLink } from "lucide-react";

// Animated Timeline Line
const TimelineLine = ({ isActive }: { isActive: boolean }) => (
  <div className="absolute left-0 top-0 h-full w-1 overflow-hidden">
    <div className="absolute inset-0 bg-border/50" />
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: isActive ? "100%" : "0%" }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-primary to-primary/50"
    />
    {/* Glow effect */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      className="absolute top-0 left-0 w-full h-full bg-primary/30 blur-sm"
    />
  </div>
);

// Timeline Dot with Pulse
const TimelineDot = ({ isActive, delay }: { isActive: boolean; delay: number }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200 }}
    className="absolute -left-[10px] top-2"
  >
    {/* Outer pulse ring */}
    {isActive && (
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 w-[21px] h-[21px] rounded-full bg-primary"
      />
    )}
    {/* Main dot */}
    <div className={`relative w-[21px] h-[21px] rounded-full border-4 border-background shadow-lg ${isActive ? 'bg-primary shadow-primary/50' : 'bg-muted'}`}>
      {isActive && (
        <div className="absolute inset-1 rounded-full bg-primary-foreground/30" />
      )}
    </div>
  </motion.div>
);

// Expandable Timeline Item
const TimelineItem = ({
  role,
  org,
  period,
  desc,
  delay,
  type,
  isLast
}: {
  role: string;
  org: string;
  period: string;
  desc: string;
  delay: number;
  type: "education" | "work";
  isLast?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className={`relative pl-10 ${!isLast ? 'pb-10' : ''}`}
    >
      <TimelineLine isActive={isInView} />
      <TimelineDot isActive={isInView} delay={delay} />

      <motion.div
        whileHover={{ x: 5 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-card p-6 rounded-2xl border-2 border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {role}
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              <span className="text-primary font-semibold flex items-center gap-1">
                {type === "education" ? <GraduationCap className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                {org}
              </span>
              <span className="flex items-center text-sm text-muted-foreground gap-1">
                <Calendar className="w-3 h-3" />
                {period}
              </span>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </motion.div>
        </div>

        {/* Expandable Content */}
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="pt-4 mt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {desc}
            </p>

            {/* Additional info based on type */}
            {type === "education" && (
              <div className="flex flex-wrap gap-2 mt-4">
                {["Electronics", "Communication", "Programming"].map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Section Header with Icon
const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="flex items-center gap-4 mb-8"
  >
    <motion.div
      whileHover={{ rotate: 360, scale: 1.1 }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-primary/10 rounded-2xl text-primary"
    >
      <Icon className="w-7 h-7" />
    </motion.div>
    <div>
      <h3 className="text-2xl font-bold">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  </motion.div>
);

// Current Status Badge
const CurrentStatusBadge = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-sm font-medium border border-green-500/20"
  >
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
    Currently Learning
  </motion.div>
);

export default function Experience() {
  const { data: experiences, isLoading } = useExperiences();

  // Split into education and work
  const education = (experiences as any[])?.filter(e => e.type === "Education") || [];
  const work = (experiences as any[])?.filter(e => e.type === "Experience") || [];

  return (
    <section id="experience" className="section-container bg-muted/30 overflow-hidden">
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold mb-4"
        >
          My Journey
        </motion.h2>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "5rem" }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="h-1.5 bg-primary mx-auto rounded-full mb-6"
        />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground max-w-xl mx-auto"
        >
          A timeline of my educational background and professional experiences
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">
        {/* Education Column */}
        <div>
          <SectionHeader
            icon={GraduationCap}
            title="Education"
            subtitle="Academic Background"
          />

          <div className="space-y-0 relative">
            {isLoading || education.length === 0 ? (
              <>
                <TimelineItem
                  role="B.E. in Electronics & Communication"
                  org="Tribhuvan University"
                  period="2023 - Present"
                  desc="Pursuing Bachelor's degree focusing on Embedded Systems, Signal Processing, Digital Electronics, and Software Engineering principles. Building strong foundation in both hardware and software development."
                  delay={0.1}
                  type="education"
                />
                <TimelineItem
                  role="+2 Science (PCM)"
                  org="Higher Secondary"
                  period="2021 - 2023"
                  desc="Completed higher secondary education with focus on Physics, Chemistry, and Mathematics. Developed strong analytical and problem-solving skills."
                  delay={0.2}
                  type="education"
                  isLast
                />
              </>
            ) : (
              education.map((edu, idx) => (
                <TimelineItem
                  key={edu.id}
                  role={edu.role}
                  org={edu.organization}
                  period={edu.period}
                  desc={edu.description}
                  delay={idx * 0.15}
                  type="education"
                  isLast={idx === education.length - 1}
                />
              ))
            )}
          </div>

          {/* Current Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 pl-10"
          >
            <CurrentStatusBadge />
          </motion.div>
        </div>

        {/* Experience Column */}
        <div>
          <SectionHeader
            icon={Briefcase}
            title="Experience"
            subtitle="Professional Journey"
          />

          <div className="space-y-0 relative">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-32 bg-card rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : work.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Open to Opportunities Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border-2 border-dashed border-primary/30 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center"
                  >
                    <Briefcase className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h4 className="text-xl font-bold mb-2">Open to Opportunities</h4>
                  <p className="text-muted-foreground mb-4">
                    I'm actively seeking internships and entry-level opportunities to apply my skills and grow professionally.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
                  >
                    Get In Touch
                  </motion.button>
                </motion.div>

                {/* What I'm Looking For */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-6 bg-card rounded-2xl border border-border"
                >
                  <h5 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    What I'm Looking For
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Software Development",
                      "Full Stack Roles",
                      "System Design",
                      "Remote/Hybrid"
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              work.map((exp, idx) => (
                <TimelineItem
                  key={exp.id}
                  role={exp.role}
                  org={exp.organization}
                  period={exp.period}
                  desc={exp.description}
                  delay={idx * 0.15}
                  type="work"
                  isLast={idx === work.length - 1}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
