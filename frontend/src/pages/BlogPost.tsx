import React from "react";
import DOMPurify from "dompurify";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useArticle } from "@/hooks/use-portfolio";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

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

export default function BlogPost() {
    const [, params] = useRoute("/blog/:slug");
    const slug = params?.slug;
    const { data: article, isLoading, error } = useArticle(slug || "");

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
                image={article.featuredImage ?? undefined}
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
                    <motion.div
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
                    </motion.div>

                    <header className="mb-12">
                        <motion.div
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
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            {article.title}
                        </motion.h1>

                        {article.featuredImage && (
                            <motion.div
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
                            </motion.div>
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
