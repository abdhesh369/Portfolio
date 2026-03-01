import { m } from "framer-motion";
import { useTestimonials } from "@/hooks/use-portfolio";
import { Quote } from "lucide-react";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
};

export default function Testimonials() {
    const { data: testimonials, isLoading } = useTestimonials();

    if (isLoading) {
        return (
            <section id="testimonials" className="py-24 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-8 w-48 rounded-lg bg-white/5 animate-pulse" />
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section
            id="testimonials"
            className="py-24 relative overflow-hidden"
            style={{ background: "linear-gradient(180deg, transparent 0%, hsl(224 71% 4% / 0.5) 100%)" }}
        >
            {/* Decorative background glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
                }}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Section Header */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/60" />
                        <span
                            className="text-xs font-semibold tracking-[0.25em] uppercase"
                            style={{ color: "hsl(var(--primary))" }}
                        >
                            Testimonials
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/60" />
                    </div>
                    <h2
                        className="text-3xl sm:text-4xl font-bold text-white"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        What People Say
                    </h2>
                    <p className="mt-3 text-white/50 max-w-xl mx-auto text-sm sm:text-base">
                        Kind words from colleagues, mentors, and clients I've had the privilege to work with.
                    </p>
                </m.div>

                {/* Testimonial Cards */}
                <m.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {testimonials.map((t) => (
                        <m.div
                            key={t.id}
                            variants={cardVariants}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="group relative rounded-2xl p-6 border border-white/[0.06] backdrop-blur-sm"
                            style={{
                                background:
                                    "linear-gradient(135deg, hsl(222 47% 11% / 0.6) 0%, hsl(224 71% 4% / 0.8) 100%)",
                            }}
                        >
                            {/* Hover glow */}
                            <div
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{
                                    background:
                                        "radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.08) 0%, transparent 60%)",
                                }}
                            />

                            <div className="relative z-10">
                                {/* Quote icon */}
                                <Quote
                                    className="w-8 h-8 mb-4 opacity-20"
                                    style={{ color: "hsl(var(--primary))" }}
                                />

                                {/* Quote text */}
                                <p className="text-white/70 text-sm leading-relaxed mb-6 italic">
                                    "{t.quote}"
                                </p>

                                {/* Author info */}
                                <div className="flex items-center gap-3 mt-auto">
                                    {t.avatarUrl ? (
                                        <img
                                            src={t.avatarUrl}
                                            alt={t.name}
                                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                                        />
                                    ) : (
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white border border-white/10"
                                            style={{ background: "hsl(var(--primary) / 0.2)" }}
                                        >
                                            {t.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-white text-sm font-medium">{t.name}</p>
                                        <p className="text-white/40 text-xs">
                                            {t.role}
                                            {t.company ? ` · ${t.company}` : ""}
                                        </p>
                                    </div>
                                </div>

                                {/* Relationship badge */}
                                {t.relationship && (
                                    <span
                                        className="inline-block mt-4 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/10"
                                        style={{
                                            color: "hsl(var(--primary) / 0.8)",
                                            background: "hsl(var(--primary) / 0.05)",
                                        }}
                                    >
                                        {t.relationship}
                                    </span>
                                )}
                            </div>
                        </m.div>
                    ))}
                </m.div>
            </div>
        </section>
    );
}
