import React, { useState, type FormEvent } from "react";
import { useArticles } from "#src/hooks/use-portfolio";
import { useToast } from "#src/hooks/use-toast";
import { RichTextEditor } from "#src/components/admin/LazyRichTextEditor";

import { ImageUpload } from "#src/components/admin/ImageUpload";
import { OptimizedImage } from "#src/components/OptimizedImage";
import { apiFetch } from "#src/lib/api-helpers";
import { queryClient } from "#src/lib/queryClient";
import { clearQueryCache } from "#src/lib/query-cache-persister";
import { FormField, FormTextarea, EmptyState, FormSelect, AdminButton, LoadingSkeleton } from "#src/components/admin/AdminShared";
import {
    FileText, Plus, Trash2, Edit3, X, Eye, Calendar,
    Tag, Globe, Search, ChevronRight, Save, Image as ImageIcon,
    Layout
} from "lucide-react";
import { cn } from "#src/lib/utils";
import type { Article } from "#shared/schema";
import type { AdminTabProps } from "./types";
import { formatDate } from "#src/lib/utils/date";

type ArticleWithTags = Article & { tags: string[] };

const emptyArticle = {
    title: "",
    slug: "",
    content: "",
    excerpt: null as string | null,
    featuredImage: null as string | null,
    status: "draft" as "draft" | "published" | "archived",
    tags: [] as string[],
    metaTitle: null as string | null,
    metaDescription: null as string | null,
};

function ArticleItem({ article, onEdit, onDelete }: {
    article: Article,
    onEdit: (a: Article) => void,
    onDelete: (id: number) => void
}) {
    const statusConfig: Record<string, { label: string, color: string, icon: React.ComponentType<{ className?: string }> }> = {
        "draft": { label: "DRAFT", color: "text-amber-500", icon: FileText },
        "published": { label: "PUBLISHED", color: "text-emerald-500", icon: Globe },
        "archived": { label: "ARCHIVED", color: "text-slate-400", icon: X },
    };

    const config = statusConfig[article.status] || statusConfig.draft;

    return (
        <div className="nm-flat p-5 flex flex-col md:flex-row items-center gap-6 group transition-all relative overflow-hidden">
            {article.featuredImage ? (
                <div className="w-24 h-24 rounded-2xl nm-inset overflow-hidden shrink-0">
                    <OptimizedImage
                        src={article.featuredImage}
                        alt={article.title}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                </div>
            ) : (
                <div className="w-24 h-24 rounded-2xl nm-inset flex items-center justify-center text-[var(--admin-text-muted)] shrink-0 opacity-30">
                    <ImageIcon size={32} />
                </div>
            )}

            <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                    <h4 className="text-lg font-black text-[var(--admin-text-primary)] truncate uppercase tracking-tight">
                        {article.title}
                    </h4>
                    <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-full nm-inset",
                        config.color
                    )}>
                        {config.label}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest justify-center md:justify-start">
                    <span className="flex items-center gap-1.5">
                        <ChevronRight size={12} className="text-indigo-400" />
                        /{article.slug}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Eye size={12} />
                        {article.viewCount} VIEWS
                    </span>
                    {article.publishedAt && (
                        <span className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {formatDate(article.publishedAt)}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex gap-4 shrink-0">
                <AdminButton
                    onClick={() => onEdit(article)}
                    className="w-12 h-12 rounded-2xl p-0 flex items-center justify-center"
                    title="Edit Protocol"
                    icon={Edit3}
                />
                <AdminButton
                    variant="danger"
                    onClick={() => onDelete(article.id)}
                    className="w-12 h-12 rounded-2xl p-0 flex items-center justify-center"
                    title="Terminate Entry"
                    icon={Trash2}
                />
            </div>
        </div>
    );
}

export function ArticlesTab(_props: AdminTabProps) {
    const { data: articles, refetch, isLoading } = useArticles();
    const { toast } = useToast();
    const [editing, setEditing] = useState<(Partial<ArticleWithTags> & typeof emptyArticle) | null>(null);
    const [saving, setSaving] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const openNew = () => {
        setEditing({ ...emptyArticle });
        setTagInput("");
    };

    const openEdit = (a: Article) => {
        const articleTags = a.tags || [];
        setEditing({
            ...a,
            status: a.status as "draft" | "published" | "archived",
            excerpt: a.excerpt ?? null,
            featuredImage: a.featuredImage ?? null,
            metaTitle: a.metaTitle ?? null,
            metaDescription: a.metaDescription ?? null,
            tags: articleTags,
        });
        setTagInput(articleTags.join(", "));
    };

    const save = async (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);

        const { id: _id, ...articleData } = editing;
        const body = {
            ...articleData,
            tags: tagInput.split(",").map((s) => s.trim()).filter(Boolean),
            slug: articleData.slug || undefined,
            featuredImage: articleData.featuredImage || null,
            excerpt: articleData.excerpt || null,
        };

        const previousArticles = queryClient.getQueryData<Article[]>(["articles"]);

        try {
            if (editing.id) {
                queryClient.setQueryData<Article[]>(["articles"], old =>
                    old ? old.map(a => a.id === editing.id ? { ...a, ...body } as Article : a) : []
                );

                await apiFetch(`/api/v1/articles/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) });
                toast({ title: "Protocol updated" });
            } else {
                await apiFetch("/api/v1/articles", { method: "POST", body: JSON.stringify(body) });
                toast({ title: "New protocol initialized" });
            }
            setEditing(null);
            clearQueryCache();
            refetch();
        } catch (_err) {
            if (previousArticles) queryClient.setQueryData(["articles"], previousArticles);
            toast({ title: "Execution failed", description: _err instanceof Error ? _err.message : "Internal error", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const deleteArticle = async (id: number) => {
        if (!confirm("Terminate this article protocol?")) return;

        const previousArticles = queryClient.getQueryData<Article[]>(["articles"]);
        queryClient.setQueryData<Article[]>(["articles"], old =>
            old ? old.filter(a => a.id !== id) : []
        );

        try {
            await apiFetch(`/api/v1/articles/${id}`, { method: "DELETE" });
            toast({ title: "Protocol deleted" });
            clearQueryCache();
            refetch();
        } catch (_err) {
            if (previousArticles) queryClient.setQueryData(["articles"], previousArticles);
            toast({ title: "Termination failed", variant: "destructive" });
        }
    };

    if (editing) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 nm-inset rounded-2xl flex items-center justify-center text-indigo-500">
                            <FileText size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic">
                                {editing.id ? "Edit_Article" : "New_Article"}
                            </h2>
                            <p className="text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.3em] ml-1">
                                Protocol: {editing.id ? `ID_${editing.id}` : "Allocation"}
                            </p>
                        </div>
                    </div>
                    <AdminButton
                        variant="secondary"
                        onClick={() => setEditing(null)}
                        className="h-12 px-6"
                        icon={X}
                    >
                        Abort_Changes
                    </AdminButton>
                </div>

                <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="nm-flat p-8 rounded-3xl space-y-8">
                            <FormField
                                label="Protocol Title *"
                                value={editing.title}
                                onChange={(v) => setEditing(prev => prev ? ({ ...prev, title: v }) : null)}
                                required
                                placeholder="E.G. THE NEUMORPHIC REVOLUTION"
                            />

                            <div className="grid md:grid-cols-2 gap-8">
                                <FormField
                                    label="Access_Slug"
                                    value={editing.slug}
                                    onChange={(v) => setEditing(prev => prev ? ({ ...prev, slug: v }) : null)}
                                    placeholder="auto-generated-id"
                                />
                                <FormSelect
                                    label="Index_Status"
                                    value={editing.status}
                                    onChange={(v) => setEditing(prev => prev ? ({ ...prev, status: v as "draft" | "published" | "archived" }) : null)}
                                    options={[
                                        { label: "DRAFT_MODE", value: "draft" },
                                        { label: "LIVE_SYNC", value: "published" },
                                        { label: "ARCHIVED", value: "archived" },
                                    ]}
                                    icon={<Layout size={14} />}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em] ml-1">Rich_Text_Payload</label>
                                <div className="nm-inset rounded-3xl p-4 min-h-[400px]">
                                    <RichTextEditor value={editing.content} onChange={(v) => setEditing(prev => prev ? ({ ...prev, content: v }) : null)} />
                                </div>
                            </div>
                        </div>

                        <div className="nm-flat p-8 rounded-3xl space-y-6">
                            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4 italic">Core_Metadata</h3>
                            <FormTextarea
                                label="Excerpt_Summary"
                                value={editing.excerpt ?? ""}
                                onChange={(v) => setEditing(prev => prev ? ({ ...prev, excerpt: v }) : null)}
                                placeholder="BRIEF CONTENT OVERVIEW..."
                            />
                        </div>
                    </div>

                    <div className="space-y-10">
                        <div className="nm-flat p-8 rounded-3xl space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em] ml-1">Visual_Asset</label>
                                <div className="nm-inset rounded-2xl p-4">
                                    <ImageUpload value={editing.featuredImage ?? ""} onChange={(v) => setEditing(prev => prev ? ({ ...prev, featuredImage: v }) : null)} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em] ml-1">Taxonomy_Tags</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="JS, TECH, DESIGN..."
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        className="h-14 pl-12 pr-6 nm-inset rounded-2xl text-[10px] font-black tracking-widest focus:outline-none w-full transition-all"
                                    />
                                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 opacity-50" />
                                </div>
                            </div>
                        </div>

                        <div className="nm-flat p-8 rounded-3xl space-y-8">
                            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-4 italic">SEO_Optimization</h3>
                            <FormField
                                label="Meta_Title"
                                value={editing.metaTitle ?? ""}
                                onChange={(v) => setEditing(prev => prev ? ({ ...prev, metaTitle: v }) : null)}
                                placeholder="SEARCH ENGINE TITLE"
                            />
                            <FormTextarea
                                label="Meta_Description"
                                value={editing.metaDescription ?? ""}
                                onChange={(v) => setEditing(prev => prev ? ({ ...prev, metaDescription: v }) : null)}
                                placeholder="SEARCH EXCERPT..."
                            />
                        </div>

                        <AdminButton
                            type="submit"
                            isLoading={saving}
                            variant="primary"
                            className="w-full h-16"
                            icon={Save}
                        >
                            {editing.id ? "SYNC_PROTOCOL" : "INIT_PROTOCOL"}
                        </AdminButton>
                    </div>
                </form >
            </div >
        );
    }

    const filtered = articles?.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.slug.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="animate-in fade-in duration-700 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 nm-inset rounded-xl flex items-center justify-center text-indigo-500">
                            <FileText size={20} strokeWidth={3} />
                        </div>
                        <h1 className="text-4xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic">
                            Articles
                        </h1>
                    </div>
                    <p className="text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 ml-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_var(--nm-accent)]" />
                        Entries_Indexed: {articles?.length ?? 0}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="FIND_PROTOCOL..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 pl-12 pr-6 nm-inset rounded-2xl text-[10px] font-black tracking-widest focus:outline-none w-64 transition-all focus:w-80"
                        />
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 opacity-50" />
                    </div>
                    <AdminButton
                        onClick={openNew}
                        variant="primary"
                        icon={Plus}
                        className="h-14 px-10"
                    >
                        New_Article
                    </AdminButton>
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-8">
                    {[1, 2, 3].map(i => (
                        <LoadingSkeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            ) : !filtered.length ? (
                <div className="nm-flat p-24 text-center">
                    <EmptyState
                        icon={FileText}
                        text={searchQuery ? "No matching protocols found" : "No articles yet indexed"}
                        className="opacity-20"
                    />
                </div>
            ) : (
                <div className="grid gap-8">
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

