/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SeoSettings, InsertSeoSettings } from "@portfolio/shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save, Globe, Search, Monitor, Share2, X, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api-helpers";
import { FormField, FormTextarea, FormSelect, FormCheckbox, LoadingSkeleton, EmptyState, AdminButton } from "../AdminShared";
import { QUERY_KEYS } from "@/lib/query-keys";

import type { AdminTabProps } from "./types";

export function SeoTab(_props: AdminTabProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [editingSeo, setEditingSeo] = useState<SeoSettings | null>(null);

    const { data: seoSettingsList, isLoading } = useQuery<SeoSettings[]>({
        queryKey: QUERY_KEYS.seoSettings,
        queryFn: async () => {
            return apiFetch("/api/v1/seo");
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: InsertSeoSettings) => {
            return apiFetch("/api/v1/seo", { method: "POST", body: JSON.stringify(data) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seoSettings });
            setIsEditing(false);
            setEditingSeo(null);
            toast({ title: "Success", description: "SEO settings created successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: InsertSeoSettings }) => {
            return apiFetch(`/api/v1/seo/${id}`, { method: "PATCH", body: JSON.stringify(data) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seoSettings });
            setIsEditing(false);
            setEditingSeo(null);
            toast({ title: "Success", description: "SEO settings updated successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiFetch(`/api/v1/seo/${id}`, { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seoSettings });
            toast({ title: "Success", description: "SEO settings deleted successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const getString = (key: string) => {
            const value = formData.get(key);
            return typeof value === 'string' ? value : '';
        };

        const data: InsertSeoSettings = {
            pageSlug: getString("pageSlug"),
            metaTitle: getString("metaTitle"),
            metaDescription: getString("metaDescription"),
            keywords: getString("keywords"),
            ogTitle: getString("ogTitle") || null,
            ogDescription: getString("ogDescription") || null,
            ogImage: getString("ogImage") || null,
            canonicalUrl: getString("canonicalUrl") || null,
            noindex: (formData.get("noindex") === "on" || formData.get("noindex") === "true"),
            twitterCard: getString("twitterCard") || "summary_large_image",
        };

        if (editingSeo) {
            updateMutation.mutate({ id: editingSeo.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-admin-text-primary uppercase">
                        SEO <span className="text-nm-accent">Vault</span>
                    </h2>
                    <p className="text-sm font-medium text-admin-text-secondary tracking-tight">
                        Optimize your digital presence with precision meta-tags.
                    </p>
                </div>
                {!isEditing && (
                    <AdminButton
                        onClick={() => { setEditingSeo(null); setIsEditing(true); }}
                        variant="primary"
                        icon={Plus}
                    >
                        Add Page Settings
                    </AdminButton>
                )}
            </div>

            {isEditing ? (
                <div className="nm-flat p-8 rounded-[2.5rem] relative overflow-hidden animate-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="icon-container-inset text-nm-accent">
                                <Search className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-admin-text-primary">
                                    {editingSeo ? "Refine Meta" : "Create New Config"}
                                </h3>
                                <p className="text-xs font-semibold text-admin-text-secondary uppercase tracking-widest">
                                    SEO Attributes Engine
                                </p>
                            </div>
                        </div>
                        <AdminButton
                            variant="secondary"
                            size="sm"
                            onClick={() => { setIsEditing(false); setEditingSeo(null); }}
                            className="w-10 h-10 rounded-full text-admin-text-secondary hover:text-rose-500"
                            icon={X}
                        >
                            {""}
                        </AdminButton>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Primary Info */}
                            <div className="space-y-6">
                                <div className="p-1 px-2 border-l-4 border-nm-accent/30 mb-2">
                                    <span className="text-[10px] font-black text-nm-accent uppercase tracking-widest">Core Meta</span>
                                </div>
                                <FormField
                                    label="Page Slug"
                                    name="pageSlug"
                                    value={editingSeo?.pageSlug || ""}
                                    onChange={(val) => setEditingSeo(prev => ({ ...prev, pageSlug: val } as any))}
                                    placeholder="e.g. projects, about-page"
                                    required
                                />
                                <FormField
                                    label="Meta Title"
                                    name="metaTitle"
                                    value={editingSeo?.metaTitle || ""}
                                    onChange={(val) => setEditingSeo(prev => ({ ...prev, metaTitle: val } as any))}
                                    placeholder="Page title for search results"
                                    required
                                />
                                <FormTextarea
                                    label="Meta Description"
                                    name="metaDescription"
                                    value={editingSeo?.metaDescription || ""}
                                    onChange={(val) => setEditingSeo(prev => ({ ...prev, metaDescription: val } as any))}
                                    placeholder="Concise summary for SERP"
                                    required
                                />
                                <FormField
                                    label="Keywords"
                                    name="keywords"
                                    value={editingSeo?.keywords || ""}
                                    onChange={(val) => setEditingSeo(prev => ({ ...prev, keywords: val } as any))}
                                    placeholder="Separated, by, commas"
                                />
                            </div>

                            {/* Social Meta */}
                            <div className="space-y-6">
                                <div className="p-1 px-2 border-l-4 border-indigo-400 mb-2">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Social & Graph</span>
                                </div>
                                <FormField
                                    label="OG Title"
                                    name="ogTitle"
                                    value={editingSeo?.ogTitle || ""}
                                    onChange={(val) => setEditingSeo(prev => ({ ...prev, ogTitle: val } as any))}
                                    placeholder="Share title (defaults to meta title)"
                                />
                                <FormTextarea
                                    label="OG Description"
                                    name="ogDescription"
                                    value={editingSeo?.ogDescription || ""}
                                    onChange={(val) => setEditingSeo(prev => ({ ...prev, ogDescription: val } as any))}
                                    placeholder="Share summary"
                                />
                                <FormField
                                    label="OG Image URL"
                                    name="ogImage"
                                    value={editingSeo?.ogImage || ""}
                                    onChange={(val) => setEditingSeo(prev => ({ ...prev, ogImage: val } as any))}
                                    placeholder="https://..."
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormSelect
                                        label="Twitter Card"
                                        name="twitterCard"
                                        value={editingSeo?.twitterCard || "summary_large_image"}
                                        onChange={(val) => setEditingSeo(prev => ({ ...prev, twitterCard: val } as any))}
                                        options={[
                                            { value: "summary", label: "Summary" },
                                            { value: "summary_large_image", label: "Large Image" },
                                            { value: "app", label: "App" },
                                            { value: "player", label: "Player" },
                                        ]}
                                    />
                                    <FormField
                                        label="Canonical"
                                        name="canonicalUrl"
                                        value={editingSeo?.canonicalUrl || ""}
                                        onChange={(val) => setEditingSeo(prev => ({ ...prev, canonicalUrl: val } as any))}
                                        placeholder="Target URL"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-nm-shadow/10">
                            <FormCheckbox
                                label="Block Search Indexing (NoIndex)"
                                name="noindex"
                                checked={editingSeo?.noindex || false}
                                onChange={(checked) => setEditingSeo(prev => ({ ...prev, noindex: checked } as any))}
                            />
                            <div className="flex gap-4 w-full md:w-auto">
                                <AdminButton
                                    variant="secondary"
                                    onClick={() => { setIsEditing(false); setEditingSeo(null); }}
                                    className="px-8 py-3 rounded-2xl text-sm flex-1 md:flex-none"
                                >
                                    Discard
                                </AdminButton>
                                <AdminButton
                                    type="submit"
                                    isLoading={createMutation.isPending || updateMutation.isPending}
                                    variant="primary"
                                    icon={Save}
                                    className="px-10 py-3 rounded-2xl text-sm flex-1 md:flex-none"
                                >
                                    {editingSeo ? "Update Vault" : "Store Settings"}
                                </AdminButton>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {seoSettingsList?.map((seo, idx) => (
                        <div
                            key={seo.id}
                            className="nm-flat p-6 rounded-[2rem] group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="icon-container-inset text-indigo-400">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-admin-text-primary capitalize">{seo.pageSlug}</h4>
                                        <div className="flex items-center gap-1">
                                            {seo.noindex ? (
                                                <span className="flex items-center gap-1 text-[8px] font-bold text-rose-500 uppercase tracking-tighter">
                                                    <AlertCircle className="w-2 h-2" /> Hidden
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">
                                                    <CheckCircle2 className="w-2 h-2" /> Indexed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <AdminButton
                                        size="sm"
                                        onClick={() => { setEditingSeo(seo); setIsEditing(true); }}
                                        className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        icon={Pencil}
                                    >
                                        {""}
                                    </AdminButton>
                                    <AdminButton
                                        variant="danger"
                                        size="sm"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this SEO setting?')) {
                                                deleteMutation.mutate(seo.id);
                                            }
                                        }}
                                        className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        icon={Trash2}
                                    >
                                        {""}
                                    </AdminButton>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="nm-inset p-3 rounded-xl">
                                    <p className="text-[10px] font-bold text-admin-text-secondary line-clamp-1 mb-1">{seo.metaTitle}</p>
                                    <p className="text-[10px] text-admin-text-muted line-clamp-2 leading-relaxed">
                                        {seo.metaDescription}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between px-1">
                                    <div className="flex gap-2">
                                        <div className="w-6 h-6 nm-inset rounded-lg flex items-center justify-center text-admin-text-muted">
                                            <Monitor className="w-3 h-3" />
                                        </div>
                                        <div className="w-6 h-6 nm-inset rounded-lg flex items-center justify-center text-admin-text-muted">
                                            <Share2 className="w-3 h-3" />
                                        </div>
                                    </div>
                                    <AdminButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setEditingSeo(seo); setIsEditing(true); }}
                                        className="text-[10px] font-black text-nm-accent uppercase tracking-widest flex items-center gap-1 group/btn p-0 h-auto"
                                        icon={ChevronRight}
                                    >
                                        Manage
                                    </AdminButton>
                                </div>
                            </div>
                        </div>
                    ))}
                    {seoSettingsList?.length === 0 && (
                        <div className="col-span-full">
                            <EmptyState
                                icon={Globe}
                                text="No SEO configurations found. Secure your search engine dominance by creating your first entry."
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
