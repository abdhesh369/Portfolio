import { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useProjects } from "@/hooks/use-portfolio";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Search, Folder, Filter, SortAsc, LayoutGrid, Calendar, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function ProjectsPage() {
  const [sortBy, setSortBy] = useState("default");
  const { data: projects, isLoading, error } = useProjects(sortBy);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const allProjects = useMemo(() => 
    (Array.isArray(projects) ? projects : []).filter(p => !p.isHidden),
    [projects]
  );

  // Derive categories dynamically
  const categories = useMemo(() => {
    const cats = new Set(allProjects.map(p => p.category));
    return ["All", ...Array.from(cats).sort()];
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    return allProjects.filter(p => {
      const matchesCategory = filter === "All" || p.category === filter;
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesSearch = !normalizedQuery || 
                            p.title.toLowerCase().includes(normalizedQuery) || 
                            p.techStack.some((tech: string) => tech.toLowerCase().includes(normalizedQuery));
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      // Pinned projects first
      if (a.isFlagship && !b.isFlagship) return -1;
      if (!a.isFlagship && b.isFlagship) return 1;
      
      if (sortBy === "views") return (b.viewCount || 0) - (a.viewCount || 0);
      if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
  }, [allProjects, filter, searchQuery, sortBy]);

  const getCategoryCount = (cat: string) => {
    if (cat === "All") return allProjects.length;
    return allProjects.filter(p => p.category === cat).length;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="All Projects | Abdhesh Sah" 
        description="Browse all my software engineering projects, system designs, and technical experiments."
        slug="projects"
      />
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <m.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent"
            >
              All Projects
            </m.h1>
            <m.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400"
            >
              Exploring {allProjects.length} projects across different domains.
            </m.p>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="w-full lg:max-w-md relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Search projects or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      filter === cat 
                      ? "bg-primary/20 border-primary/50 text-primary" 
                      : "bg-slate-900/50 border-white/10 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {cat} <span className="ml-1 opacity-60">({getCategoryCount(cat)})</span>
                  </button>
                ))}
              </div>

              {/* Sort Select */}
              <div className="flex items-center gap-2 bg-slate-900/50 border border-white/10 rounded-xl p-1">
                {[
                  { id: "default", icon: LayoutGrid, label: "Order" },
                  { id: "views", icon: Eye, label: "Views" },
                  { id: "newest", icon: Calendar, label: "Newest" }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      sortBy === s.id 
                      ? "bg-white/10 text-white" 
                      : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <s.icon className="w-3 h-3" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div 
                  key={i} 
                  className="aspect-video rounded-2xl animate-pulse bg-slate-900/50 border border-white/5" 
                />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProjects.length > 0 ? (
                <m.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filteredProjects.map((project) => (
                    <ProjectCard 
                      key={project.id}
                      project={project}
                    />
                  ))}
                </m.div>
              ) : (
                <m.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-32"
                >
                  <Folder className="w-16 h-16 mx-auto text-slate-800 mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters.</p>
                  <button 
                    onClick={() => { setFilter("All"); setSearchQuery(""); }}
                    className="mt-6 text-primary hover:underline text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                </m.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
