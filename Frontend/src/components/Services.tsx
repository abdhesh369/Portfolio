import { m, useReducedMotion } from "framer-motion";
import { useServices } from "@/hooks/use-portfolio";
import { Sparkles, ChevronRight, Layers } from "lucide-react";

function getFallbackServices() {
  return [
    {
      id: 1,
      title: "Backend & API Architecture",
      summary:
        "Design and implement robust, observable backend services with clean boundaries, typed contracts, and a focus on reliability.",
      category: "Backend",
      tags: ["Node.js", "TypeScript", "Postgres", "Drizzle ORM"],
      isFeatured: true,
      displayOrder: 0,
    },
    {
      id: 2,
      title: "System Design & Scalability",
      summary:
        "Help you go from idea to production-ready architecture: data modeling, caching, background work, queues, and failure handling.",
      category: "Systems",
      tags: ["System Design", "Performance", "Observability"],
      isFeatured: false,
      displayOrder: 1,
    },
    {
      id: 3,
      title: "Full-Stack Product Delivery",
      summary:
        "Own features end-to-end across frontend, backend, and deployment, with a strong bias toward clean UX and maintainable code.",
      category: "Full-Stack",
      tags: ["React", "Vite", "Tailwind", "DX"],
      isFeatured: false,
      displayOrder: 2,
    },
  ];
}

export default function Services() {
  const { data, isLoading, error } = useServices();
  const shouldReduceMotion = useReducedMotion();

  const services = (data && data.length > 0 ? data : getFallbackServices()).slice().sort(
    (a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );

  return (
    <section id="services" className="relative py-20 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              How I can help
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{
              background:
                "linear-gradient(135deg, #bbf7d0 0%, #4ade80 40%, #22c55e 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Services & Collaboration
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Concrete ways I can contribute to your team or product. Each
            service maps directly to the skills and case studies you see on this
            page.
          </p>
        </m.div>

        {error && (
          <p className="text-center text-xs text-red-400 mb-4">
            Failed to load services from backend. Showing defaults.
          </p>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {(isLoading ? getFallbackServices() : services).map((svc: any, index: number) => (
            <m.div
              key={svc.id ?? index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={
                shouldReduceMotion ? { duration: 0 } : { delay: index * 0.05 }
              }
              className="relative rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_55%),_rgba(15,23,42,0.9)] p-5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <Layers className="w-4 h-4 text-emerald-300" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {svc.title}
                    </h3>
                    <p className="text-[11px] text-emerald-300/80 uppercase tracking-wide">
                      {svc.category}
                    </p>
                  </div>
                </div>
                {svc.isFeatured && (
                  <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-400/40">
                    Featured
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mb-4 flex-1">
                {svc.summary}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {(svc.tags ?? []).slice(0, 5).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-200 border border-emerald-400/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-emerald-500/15 flex items-center justify-between text-[11px] text-emerald-200/80">
                <span>Ideal for teams who need a builder–architect hybrid.</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}

