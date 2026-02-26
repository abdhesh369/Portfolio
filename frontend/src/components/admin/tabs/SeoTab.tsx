import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { insertSeoSettingsApiSchema, type SeoSettings, type InsertSeoSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiFetch } from "@/lib/api-helpers";

export function SeoTab({ token }: { token: string | null }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [editingSeo, setEditingSeo] = useState<SeoSettings | null>(null);

    const { data: seoSettingsList, isLoading } = useQuery<SeoSettings[]>({
        queryKey: ["seo-settings"],
        queryFn: async () => {
            return apiFetch("/api/seo", token);
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: InsertSeoSettings) => {
            return apiFetch("/api/seo", token, { method: "POST", body: JSON.stringify(data) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
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
            return apiFetch(`/api/seo/${id}`, token, { method: "PATCH", body: JSON.stringify(data) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
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
            await apiFetch(`/api/seo/${id}`, token, { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
            toast({ title: "Success", description: "SEO settings deleted successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Helper to get string values
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
            noindex: (formData.get("noindex") === "on"),
            twitterCard: getString("twitterCard") || "summary_large_image",
        };

        if (editingSeo) {
            updateMutation.mutate({ id: editingSeo.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">SEO Management</h2>
                    <p className="text-muted-foreground">Manage meta tags and SEO settings for your pages.</p>
                </div>
                {!isEditing && (
                    <Button onClick={() => { setEditingSeo(null); setIsEditing(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Add SEO Settings
                    </Button>
                )}
            </div>

            {isEditing ? (
                <Card className="border-primary/20 bg-background/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle>{editingSeo ? "Edit SEO Settings" : "New SEO Settings"}</CardTitle>
                        <CardDescription>
                            Configure meta tags for search engine optimization.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="pageSlug" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Page Slug</label>
                                    <input
                                        id="pageSlug"
                                        name="pageSlug"
                                        defaultValue={editingSeo?.pageSlug}
                                        required
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="e.g. home, about, project-1"
                                    />
                                    <p className="text-xs text-muted-foreground">Unique identifier for the page.</p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="metaTitle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Meta Title</label>
                                    <input
                                        id="metaTitle"
                                        name="metaTitle"
                                        defaultValue={editingSeo?.metaTitle}
                                        required
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label htmlFor="metaDescription" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Meta Description</label>
                                    <textarea
                                        id="metaDescription"
                                        name="metaDescription"
                                        defaultValue={editingSeo?.metaDescription}
                                        required
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label htmlFor="keywords" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Keywords</label>
                                    <input
                                        id="keywords"
                                        name="keywords"
                                        defaultValue={editingSeo?.keywords || ""}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Comma separated keywords"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="ogTitle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">OG Title (Optional)</label>
                                    <input
                                        id="ogTitle"
                                        name="ogTitle"
                                        defaultValue={editingSeo?.ogTitle || ""}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="ogImage" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">OG Image URL (Optional)</label>
                                    <input
                                        id="ogImage"
                                        name="ogImage"
                                        defaultValue={editingSeo?.ogImage || ""}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label htmlFor="ogDescription" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">OG Description (Optional)</label>
                                    <textarea
                                        id="ogDescription"
                                        name="ogDescription"
                                        defaultValue={editingSeo?.ogDescription || ""}
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="canonicalUrl" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Canonical URL (Optional)</label>
                                    <input
                                        id="canonicalUrl"
                                        name="canonicalUrl"
                                        defaultValue={editingSeo?.canonicalUrl || ""}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="twitterCard" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Twitter Card Type</label>
                                    <select
                                        id="twitterCard"
                                        name="twitterCard"
                                        defaultValue={editingSeo?.twitterCard || "summary_large_image"}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-background"
                                    >
                                        <option value="summary">Summary</option>
                                        <option value="summary_large_image">Summary Large Image</option>
                                        <option value="app">App</option>
                                        <option value="player">Player</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="noindex"
                                        name="noindex"
                                        defaultChecked={editingSeo?.noindex || false}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="noindex" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">No Index (prevent indexing)</label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setEditingSeo(null); }}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Settings
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {seoSettingsList?.map((seo) => (
                        <Card key={seo.id} className="bg-card/50 backdrop-blur hover:bg-card/80 transition-colors">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{seo.pageSlug}</CardTitle>
                                        <CardDescription className="line-clamp-1">{seo.metaTitle}</CardDescription>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingSeo(seo); setIsEditing(true); }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => {
                                            if (confirm('Are you sure you want to delete this SEO setting?')) {
                                                deleteMutation.mutate(seo.id);
                                            }
                                        }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p className="line-clamp-2">{seo.metaDescription}</p>
                                    {seo.noindex && (
                                        <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive ring-1 ring-inset ring-destructive/20">
                                            No Index
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {seoSettingsList?.length === 0 && (
                        <div className="col-span-full text-center p-8 text-muted-foreground">
                            No SEO settings found. create one to get started.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
