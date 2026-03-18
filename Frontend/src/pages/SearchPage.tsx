import { useState } from "react";
import { type Article, type Project, type Skill } from "@portfolio/shared";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-helpers";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, BookOpen, ExternalLink, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface SearchResults {
    projects: Project[];
    articles: Article[];
    skills: Skill[];
}

export default function SearchPage() {
    const [_location] = useLocation();
    const queryParams = new URLSearchParams(window.location.search);
    const initialQuery = queryParams.get("q") || "";
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    const { data, isLoading } = useQuery<SearchResults>({
        queryKey: ["search", searchQuery],
        queryFn: async () => {
            if (!searchQuery) return { projects: [], articles: [], skills: [] };
            const res = await fetch(`${API_BASE_URL}/api/v1/search?q=${encodeURIComponent(searchQuery)}`);
            if (!res.ok) throw new Error("Search failed");
            return res.json();
        },
        enabled: searchQuery.length > 2,
    });

    return (
        <div className="container max-w-4xl py-20 px-4 mx-auto">
            <div className="flex flex-col space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        Global Search
                    </h1>
                    <p className="text-muted-foreground">
                        Find projects, articles, and skills across the entire portfolio.
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for projects, articles, or skills..."
                        className="pl-10 h-12 text-lg bg-background/50 backdrop-blur-sm border-white/10"
                        autoFocus
                    />
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}

                {!isLoading && searchQuery.length > 2 && (
                    <div className="space-y-12">
                        {/* Projects section */}
                        {data?.projects && data.projects.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold flex items-center gap-2">
                                    <Code2 className="w-6 h-6 text-blue-400" />
                                    Projects
                                </h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {data.projects.map((project) => (
                                        <Link key={project.id} href={`/projects/${project.slug}`}>
                                            <Card className="group hover:border-blue-500/50 transition-all cursor-pointer bg-white/5 border-white/10">
                                                <CardContent className="p-6">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">
                                                                {project.title}
                                                            </h3>
                                                            <p className="text-muted-foreground mt-2 line-clamp-2">
                                                                {project.description}
                                                            </p>
                                                        </div>
                                                        <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all text-blue-400" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Articles section */}
                        {data?.articles && data.articles.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-indigo-400" />
                                    Articles
                                </h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {data.articles.map((article) => (
                                        <Link key={article.id} href={`/blog/${article.slug}`}>
                                            <Card className="group hover:border-indigo-500/50 transition-all cursor-pointer bg-white/5 border-white/10">
                                                <CardContent className="p-6">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-xl font-bold group-hover:text-indigo-400 transition-colors">
                                                                {article.title}
                                                            </h3>
                                                            <p className="text-muted-foreground mt-2 line-clamp-2">
                                                                {article.excerpt}
                                                            </p>
                                                        </div>
                                                        <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all text-indigo-400" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Skills section */}
                        {data?.skills && data.skills.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold flex items-center gap-2">
                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Skills</Badge>
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {data.skills.map((skill) => (
                                        <Badge 
                                            key={skill.id} 
                                            variant="outline" 
                                            className="px-4 py-2 text-md bg-white/5 border-white/10 hover:border-blue-400/50 transition-all"
                                        >
                                            {skill.name}
                                            <span className="ml-2 text-muted-foreground text-xs">
                                                {skill.mastery}% mastery
                                            </span>
                                        </Badge>
                                    ))}
                                </div>
                            </section>
                        )}

                        {(!data?.projects.length && !data?.articles.length && !data?.skills.length) && (
                            <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                                <p className="text-muted-foreground">No matches found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
