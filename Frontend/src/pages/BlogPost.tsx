import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useArticle } from "@/hooks/use-portfolio";
import { useRoute } from "wouter";
import { m } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Link2, Check } from "lucide-react";
import { Link } from "wouter";
import { API_BASE_URL } from "@/lib/api-helpers";

function PostSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <div className="space-y-4 pt-8">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    );
}

import { getDynamicOgImage } from "@/lib/cloudinary";

export default function BlogPost() {
    const [, params] = useRoute("/blog/:slug");
    const slug = params?.slug;
    const { data: article, isLoading, error } = useArticle(slug || "");
    const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);

    // Dynamic OG image generation
    const ogImage = article ? getDynamicOgImage(article.title, article.featuredImage || undefined) : undefined;

    useEffect(() => {
        if (!slug) return;
        fetch(`${API_BASE_URL}/api/v1/articles/related/${slug}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => setRelatedArticles(data))
            .catch(() => setRelatedArticles([]));
    }, [slug]);

    function copyLink() {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <main className="container mx-auto px-6 pt-32 pb-24">
                    <PostSkeleton />
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <main className="container mx-auto px-6 pt-32 pb-24 text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
                    <p className="text-white/40 mb-8">The article you're looking for doesn't exist or has been removed.</p>
                    <Link href="/blog">
                        <Button>Back to Blog</Button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen selection:bg-primary/20 bg-background text-foreground">
            <SEO
                slug={`blog/${article.slug}`}
                title={`${article.title} | Abdhesh Sah`}
                description={article.excerpt || article.title}
                image={ogImage}
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": (article as any).title as string,
                    "image": article.featuredImage ? [article.featuredImage] : [],
                    "datePublished": article.publishedAt,
                    "dateModified": article.updatedAt,
                    "author": {
                        "@type": "Person",
                        "name": "Abdhesh Sah",
                        "url": "https://abdheshsah.com.np"
                    }
                }}
            />
            <Navbar />

            <main className="container mx-auto px-6 pt-32 pb-24">
                <div className="max-w-4xl mx-auto">
                    <m.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <Link href="/blog">
                            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white group">
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back to Blog
                            </Button>
                        </Link>
                    </m.div>

                    <header className="mb-12">
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-wrap items-center gap-4 mb-6"
                        >
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                {new Date(article.publishedAt!).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </Badge>
                            <span className="text-white/30 text-sm">{article.readTimeMinutes || 5} min read</span>
                            {(article as any).tags?.map((tag: string) => (
                                <span key={tag} className="text-xs text-white/40">#{tag}</span>
                            ))}
                        </m.div>

                        <m.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            {article.title}
                        </m.h1>

                        {article.featuredImage && (
                            <m.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="aspect-video relative rounded-3xl overflow-hidden bg-white/5 border border-white/10"
                            >
                                <img
                                    src={article.featuredImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                            </m.div>
                        )}
                    </header>

                    <article
                        className="prose prose-invert prose-purple max-w-none 
                        prose-headings:font-display prose-headings:font-bold prose-headings:text-white
                        prose-p:text-white/70 prose-p:leading-relaxed prose-p:text-lg
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-white prose-code:text-primary prose-pre:bg-white/5
                        prose-img:rounded-2xl prose-img:border prose-img:border-white/10
                        animate-fade-in pt-8"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                    />

                    {/* Share button */}
                    <div className="mt-12 flex items-center gap-3">
                        <button
                            onClick={copyLink}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm"
                        >
                            {copied ? (
                                <><Check className="w-4 h-4 text-green-400" /> Copied!</>
                            ) : (
                                <><Link2 className="w-4 h-4" /> Copy Link</>
                            )}
                        </button>
                    </div>

                    {/* Related articles strip */}
                    {relatedArticles.length > 0 && (
                        <section className="mt-16 pt-16 border-t border-white/10">
                            <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                                Related Articles
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedArticles.map((related: any) => (
                                    <Link key={related.id} href={`/blog/${related.slug}`}>
                                        <m.div
                                            whileHover={{ y: -4 }}
                                            className="group cursor-pointer rounded-2xl overflow-hidden border border-white/5 hover:border-primary/20 transition-all bg-white/[0.02]"
                                        >
                                            <div className="aspect-video bg-white/5 relative overflow-hidden">
                                                {related.featuredImage ? (
                                                    <img src={related.featuredImage} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📝</div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h4 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                                    {related.title}
                                                </h4>
                                                <p className="text-xs text-white/40 line-clamp-2">{related.excerpt}</p>
                                            </div>
                                        </m.div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    <footer className="mt-16 pt-16 border-t border-white/10">
                        <div className="bg-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 border border-white/5">
                            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-4xl shrink-0">
                                AS
                            </div>
                            <div className="text-center md:text-left">
                                <h4 className="text-xl font-bold text-white mb-2">Written by Abdhesh Sah</h4>
                                <p className="text-white/50 mb-4">
                                    Full-stack engineer passionate about building high-performance web applications and sharing knowledge with the community.
                                </p>
                                <div className="flex justify-center md:justify-start gap-4">
                                    <a href="https://twitter.com/SahAbdhesh" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">Twitter</a>
                                    <a href="https://linkedin.com/in/abdhesh-sah-06900a266" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">LinkedIn</a>
                                    <a href="https://github.com/abdheshnayak" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">GitHub</a>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </main>

            <Footer />
        </div>
    );
}
