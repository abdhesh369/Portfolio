import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { TableOfContents } from "@/components/TableOfContents";
import { useArticle } from "@/hooks/use-portfolio";
import { useCodeBlockCopy } from "@/hooks/use-code-block-copy";
import type { ArticleWithRelated } from "@shared/schema";
import { useRoute } from "wouter";
import { m } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Link2, Check, Eye } from "lucide-react";
import { Link } from "wouter";
import { AUTHOR } from "@/lib/author";
import { OptimizedImage } from "@/components/OptimizedImage";

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
    const [copied, setCopied] = useState(false);
    const articleRef = useRef<HTMLElement>(null);

    // Add copy-to-clipboard buttons on code blocks after content renders
    useCodeBlockCopy(articleRef.current);

    // Related articles come from the article response itself (GET /:slug returns { ...article, relatedArticles })
    const relatedArticles = (article as ArticleWithRelated)?.relatedArticles || [];

    // Dynamic OG image generation
    const ogImage = article ? getDynamicOgImage(article.title, article.featuredImage || undefined) : undefined;

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
                title={`${article.title} | ${AUTHOR.name}`}
                description={article.excerpt || article.title}
                image={ogImage}
                structuredData={[
                    {
                        "@context": "https://schema.org",
                        "@type": "TechArticle",
                        "headline": article.title,
                        "image": article.featuredImage ? [article.featuredImage] : [],
                        "datePublished": article.publishedAt,
                        "dateModified": article.updatedAt,
                        "wordCount": article.content ? article.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0,
                        "author": {
                            "@type": "Person",
                            "name": AUTHOR.name,
                            "url": "https://abdheshsah.com.np"
                        },
                        "publisher": {
                            "@type": "Person",
                            "name": AUTHOR.name
                        },
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": `https://abdheshsah.com.np/blog/${article.slug}`
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": "https://abdheshsah.com.np"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Blog",
                                "item": "https://abdheshsah.com.np/blog"
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": article.title,
                                "item": `https://abdheshsah.com.np/blog/${article.slug}`
                            }
                        ]
                    }
                ]}
            />
            <Navbar />

            <main className="container mx-auto px-6 pt-24 md:pt-32 pb-16 md:pb-24">
                <div className="max-w-4xl xl:max-w-6xl mx-auto">
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

                    <div className="flex gap-12">
                        {/* Main article content */}
                        <div className="flex-1 max-w-4xl">
                            <header className="mb-8 md:mb-12">
                                <m.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-wrap items-center gap-4 mb-6"
                                >
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Draft"}
                                    </Badge>
                                    <span className="text-white/30 text-sm">{article.readTimeMinutes || 5} min read</span>
                                    <span className="text-white/40 text-sm flex items-center gap-1.5">
                                        <Eye className="w-4 h-4" />
                                        {article.viewCount || 0} views
                                    </span>
                                    {article.tags?.map((tag: string) => (
                                        <span key={tag} className="text-xs text-white/40">#{tag}</span>
                                    ))}
                                </m.div>

                                <m.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-8 leading-tight"
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
                                        <OptimizedImage
                                            src={article.featuredImage}
                                            alt={article.featuredImageAlt || `${article.title} - Featured image for blog post`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                                    </m.div>
                                )}
                            </header>

                            <article
                                ref={articleRef}
                                className="prose prose-invert prose-purple max-w-none 
                        prose-headings:font-display prose-headings:font-bold prose-headings:text-white
                        prose-p:text-white/70 prose-p:leading-relaxed prose-p:text-base md:text-lg
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-white prose-code:text-primary prose-pre:bg-white/5
                        prose-img:rounded-2xl prose-img:border prose-img:border-white/10
                        animate-fade-in pt-4 md:pt-8"
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
                                    <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                                        Related Articles
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {relatedArticles.map((related: any) => (
                                            <Link key={related.id} href={`/blog/${related.slug}`}>
                                                <m.div
                                                    whileHover={{ y: -4 }}
                                                    className="group cursor-pointer rounded-2xl overflow-hidden border border-white/5 hover:border-primary/20 transition-all bg-white/[0.02]"
                                                >
                                                    <div className="aspect-video bg-white/5 relative overflow-hidden">
                                                        {related.featuredImage ? (
                                                            <OptimizedImage src={related.featuredImage} alt={`${related.title} - Related article thumbnail`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📝</div>
                                                        )}
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                                            {related.title}
                                                        </h3>
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
                                        <h3 className="text-xl font-bold text-white mb-2">Written by {AUTHOR.name}</h3>
                                        <p className="text-white/50 mb-4">
                                            {AUTHOR.bio}
                                        </p>
                                        <div className="flex justify-center md:justify-start gap-4">
                                            <a href={AUTHOR.socials.twitter} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">Twitter</a>
                                            <a href={AUTHOR.socials.linkedin} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">LinkedIn</a>
                                            <a href={AUTHOR.socials.github} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">GitHub</a>
                                        </div>
                                    </div>
                                </div>
                            </footer>
                        </div>

                        {/* Table of Contents sidebar — visible on xl screens */}
                        <aside className="hidden xl:block w-64 shrink-0">
                            <TableOfContents contentSelector="article" />
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
