import React, { useState, useEffect, useRef } from "react";
import type { Article } from "@shared/schema";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useArticles, useArticleSearch } from "@/hooks/use-portfolio";
import { m } from "framer-motion";
import { fadeUp, fadeLeft } from "@/lib/animation";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Eye } from "lucide-react";

function BlogCard({ article }: { article: Article }) {
    return (
        <m.div
            initial={fadeUp.initial}
            whileInView={fadeUp.animate}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <Link href={`/blog/${article.slug}`}>
                <Card className="group cursor-pointer bg-card/50 border-white/5 hover:border-primary/20 transition-all duration-300 overflow-hidden h-full flex flex-col">
                    <div className="aspect-video relative overflow-hidden bg-white/5">
                        {article.featuredImage ? (
                            <img
                                src={article.featuredImage}
                                alt={article.featuredImageAlt || `Cover illustration for the article "${article.title}": ${article.excerpt?.substring(0, 100)}...`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl opacity-20 group-hover:scale-110 transition-transform duration-500">
                                📝
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Draft"}
                            </Badge>
                            <span className="text-[10px] text-white/30">•</span>
                            <span className="text-[10px] text-white/30">{article.readTimeMinutes || 5} min read</span>
                            <span className="text-[10px] text-white/30">•</span>
                            <span className="text-[10px] text-white/40 flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {article.viewCount || 0}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-2 line-clamp-2" style={{ fontFamily: "var(--font-display)" }}>
                            {article.title}
                        </h3>
                        <p className="text-sm text-white/50 line-clamp-3 mb-4">
                            {article.excerpt || "No excerpt available."}
                        </p>
                        <div className="mt-auto flex flex-wrap gap-2">
                            {article.tags?.map((tag: string) => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </m.div>
    );
}

function BlogSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="aspect-video w-full rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
            ))}
        </div>
    );
}

export default function BlogList() {
    const { data: articles, isLoading } = useArticles("published");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Debounce search query by 300ms
    useEffect(() => {
        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [searchQuery]);

    // Use server-side FTS when query is >= 2 chars, otherwise client-side filter
    const { data: searchResults, isFetching: isSearching } = useArticleSearch(debouncedQuery);
    const useServerSearch = debouncedQuery.trim().length >= 2;

    // Extract unique tags from all articles
    const allTags = Array.from(
        new Set(articles?.flatMap(a => a.tags || []) || [])
    ).sort();

    const filteredArticles = (() => {
        const source = useServerSearch ? (searchResults || []) : (articles || []);

        return source.filter(a => {
            // If using server search, only apply tag filter
            if (useServerSearch) {
                return !selectedTag || a.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase());
            }

            // Client-side filtering for short queries
            const matchesSearch = !searchQuery ||
                a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesTag = !selectedTag || a.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase());

            return matchesSearch && matchesTag;
        });
    })();

    return (
        <div className="min-h-screen selection:bg-primary/20 bg-background text-foreground">
            <SEO
                slug="blog"
                title="Blog | Abdhesh Sah - Tech Thoughts & Tutorials"
                description="Articles about web development, engineering mindset, and modern technologies by Abdhesh Sah."
            />
            <Navbar />

            <main className="container mx-auto px-6 pt-32 pb-24">
                <header className="max-w-2xl mb-16">
                    <m.h1
                        {...fadeLeft}
                        className="text-4xl md:text-5xl font-bold text-white mb-4"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        Thoughts & <span className="text-primary italic">Insights</span>
                    </m.h1>
                    <m.p
                        initial={fadeLeft.initial}
                        animate={fadeLeft.animate}
                        transition={{ delay: 0.1 }}
                        className="text-white/60 text-lg"
                    >
                        Deep dives into full-stack development, software architecture, and the engineering mindset.
                    </m.p>
                </header>

                <section className="mb-12 space-y-4">
                    <div className="relative max-w-md">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
                        <input
                            type="text"
                            placeholder="Search articles, tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-11 pr-6 text-sm text-white focus:border-primary/50 outline-none transition-all"
                        />
                    </div>

                    {/* Tag filter chips */}
                    {allTags.length > 0 && (
                        <m.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap gap-2"
                        >
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!selectedTag
                                    ? "bg-primary/20 text-primary border-primary/30"
                                    : "bg-white/5 text-white/40 border-white/10 hover:text-white/60 hover:border-white/20"
                                    }`}
                            >
                                All
                            </button>
                            {allTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedTag === tag
                                        ? "bg-primary/20 text-primary border-primary/30"
                                        : "bg-white/5 text-white/40 border-white/10 hover:text-white/60 hover:border-white/20"
                                        }`}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </m.div>
                    )}
                </section>

                {isLoading ? (
                    <BlogSkeleton />
                ) : filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.map((article) => (
                            <BlogCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-4xl mb-4">📭</p>
                        <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
                        <p className="text-white/40">Try a different search query or check back later.</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
