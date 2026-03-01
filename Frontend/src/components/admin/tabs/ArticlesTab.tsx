import React, { useState, type FormEvent } from "react";
import { useArticles } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/admin/LazyRichTextEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { apiFetch } from "@/lib/api-helpers";
import { FormField, FormTextarea, EmptyState } from "@/components/admin/AdminShared";
import type { Article } from "@shared/schema";

type ArticleWithTags = Article & { tags: string[] };

const emptyArticle = {
    title: "",
    slug: "",
    content: "",
    excerpt: null as string | null,
    featuredImage: null as string | null,
    status: "draft" as const,
    tags: [] as string[],
    metaTitle: null as string | null,
    metaDescription: null as string | null,
};

function ArticleItem({ article, onEdit, onDelete }: {
    article: Article,
    onEdit: (a: Article) => void,
    onDelete: (id: number) => void
}) {
    const statusColors: Record<string, string> = {
        "draft": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        "published": "bg-green-500/10 text-green-400 border-green-500/20",
        "archived": "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };

    return (
        <div className="rounded-xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center gap-4 group hover:border-white/20 transition-colors bg-[#0a0520]/80 backdrop-blur-sm">
            {article.featuredImage && (
                <img src={article.featuredImage} alt={article.title} className="w-16 h-16 rounded-lg object-cover shrink-0 bg-white/5" />
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white text-sm truncate">{article.title}</p>
                    <Badge variant="outline" className={`text-[10px] border ${statusColors[article.status] || "border-white/10"}`}>
                        {article.status}
                    </Badge>
                </div>
                <p className="text-xs text-white/40 mt-0.5 truncate">/{article.slug}</p>
                <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-white/30">👁️ {article.viewCount} views</span>
                    {article.publishedAt && (
                        <span className="text-[10px] text-white/30">📅 {new Date(article.publishedAt).toLocaleDateString()}</span>
                    )}
                </div>
            </div>
            <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => onEdit(article)} className="text-white/60">Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(article.id)} className="opacity-60 group-hover:opacity-100">Delete</Button>
            </div>
        </div>
    );
}

export function ArticlesTab({ token }: { token: string | null }) {
    const { data: articles, refetch, isLoading } = useArticles();
    const { toast } = useToast();
    const [editing, setEditing] = useState<(Partial<Article> & typeof emptyArticle) | null>(null);
    const [saving, setSaving] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const openNew = () => {
        setEditing({ ...emptyArticle });
        setTagInput("");
    };

    const openEdit = (a: Article) => {
        const articleTags = (a as ArticleWithTags).tags || [];
        setEditing({
            ...a,
            status: a.status as any,
            excerpt: a.excerpt ?? null,
            featuredImage: a.featuredImage ?? null,
            metaTitle: a.metaTitle ?? null,
            metaDescription: a.metaDescription ?? null,
            tags: articleTags,
        } as any);
        setTagInput(articleTags.join(", "));
    };

    const save = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);

        const { id, tags: _oldTags, ...articleData } = editing;
        const body = {
            ...articleData,
            tags: tagInput.split(",").map((s) => s.trim()).filter(Boolean),
            slug: articleData.slug || undefined,
            featuredImage: articleData.featuredImage || null,
            excerpt: articleData.excerpt || null,
        };

        try {
            if (editing.id) {
                await apiFetch(`/api/articles/${editing.id}`, token, { method: "PATCH", body: JSON.stringify(body) });
                toast({ title: "Article updated" });
            } else {
                await apiFetch("/api/articles", token, { method: "POST", body: JSON.stringify(body) });
                toast({ title: "Article created" });
            }
            setEditing(null);
            refetch();
        } catch (err: any) {
            toast({ title: "Save failed", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const deleteArticle = async (id: number) => {
        if (!confirm("Delete this article?")) return;
        try {
            await apiFetch(`/api/articles/${id}`, token, { method: "DELETE" });
            toast({ title: "Article deleted" });
            refetch();
        } catch (err: any) {
            toast({ title: "Delete failed", description: err.message, variant: "destructive" });
        }
    };

    if (editing) {
        return (
            <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                        {editing.id ? "Edit Article" : "New Article"}
                    </h2>
                    <Button variant="ghost" onClick={() => setEditing(null)} className="text-white/50">Cancel</Button>
                </div>

                <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <FormField label="Title *" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} required />
                        <FormField label="Slug (optional)" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} placeholder="auto-generated-from-title" />

                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">Content *</label>
                            <RichTextEditor value={editing.content} onChange={(v) => setEditing({ ...editing, content: v })} />
                        </div>

                        <FormTextarea label="Excerpt" value={editing.excerpt ?? ""} onChange={(v) => setEditing({ ...editing, excerpt: v })} />
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">Status</label>
                                <select
                                    value={editing.status}
                                    onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}
                                    className="w-full px-3 py-2 rounded-lg text-white text-sm bg-white/5 border border-white/10 focus:border-purple-500 outline-none transition-all"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <ImageUpload label="Featured Image" value={editing.featuredImage ?? ""} onChange={(v) => setEditing({ ...editing, featuredImage: v })} />

                            <FormField label="Tags (comma separated)" value={tagInput} onChange={setTagInput} />

                            <div className="pt-4 border-t border-white/10 space-y-4">
                                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">SEO Settings</p>
                                <FormField label="Meta Title" value={editing.metaTitle ?? ""} onChange={(v) => setEditing({ ...editing, metaTitle: v })} />
                                <FormTextarea label="Meta Description" value={editing.metaDescription ?? ""} onChange={(v) => setEditing({ ...editing, metaDescription: v })} />
                            </div>

                            <Button type="submit" className="w-full" disabled={saving}>
                                {saving ? "Saving..." : (editing.id ? "Update Article" : "Create Article")}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    const filtered = articles?.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.slug.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white shrink-0" style={{ fontFamily: "var(--font-display)" }}>
                    Articles <Badge variant="secondary" className="ml-2">{articles?.length ?? 0}</Badge>
                </h2>
                <div className="flex flex-1 max-w-md gap-3">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">🔍</span>
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-purple-500 outline-none transition-all"
                        />
                    </div>
                    <Button onClick={openNew}>+ New Article</Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
            ) : !filtered.length ? (
                <EmptyState icon="📝" text={searchQuery ? "No matches found" : "No articles yet"} />
            ) : (
                <div className="grid gap-3">
                    {filtered.map((a) => (
                        <ArticleItem
                            key={a.id}
                            article={a}
                            onEdit={openEdit}
                            onDelete={deleteArticle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
