import React from "react";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/portfolio";
import { LoadingSkeleton } from "@/components/admin/AdminShared";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Briefcase, Sparkles, RefreshCcw, CheckCircle2, AlertCircle, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-helpers";
import { Button } from "@/components/ui/button";

export function SettingsTab() {
    const { toast } = useToast();
    const { data: settings, isLoading, isError } = useSiteSettings();
    const updateMutation = useUpdateSiteSettings();

    const [isOptimizing, setIsOptimizing] = React.useState(false);
    const [isDeploying, setIsDeploying] = React.useState(false);
    const [stats, setStats] = React.useState<{
        totalScanned: number;
        migratedToCloudinary: number;
        optimizedUrls: number;
        failed: number;
    } | null>(null);

    if (isLoading) return <LoadingSkeleton />;
    if (isError) return <div className="text-red-400">Failed to load settings.</div>;

    const handleToggleOpenToWork = (checked: boolean) => {
        updateMutation.mutate(
            { isOpenToWork: checked },
            {
                onError: (error: Error) => {
                    toast({ title: "Error", description: error.message || "Failed to update settings", variant: "destructive" });
                },
            }
        );
    };

    const handleOptimizeImages = async () => {
        setIsOptimizing(true);
        setStats(null);
        try {
            const result = await apiFetch("/api/v1/admin/optimize-images", {
                method: "POST"
            });
            setStats(result.data);
            toast({
                title: "Optimization Complete",
                description: `Successfully optimized ${result.data.optimizedUrls} images.`,
            });
        } catch (error: any) {
            toast({
                title: "Optimization Failed",
                description: error.message || "An error occurred during optimization.",
                variant: "destructive",
            });
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        try {
            await apiFetch("/api/v1/admin/deploy", {
                method: "POST"
            });
            toast({
                title: "Deployment Triggered",
                description: "Production deployment has been initiated on Render.",
            });
        } catch (error: any) {
            toast({
                title: "Deployment Failed",
                description: error.message || "Failed to trigger deployment.",
                variant: "destructive",
            });
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Site Settings
                </h2>
            </div>

            <div className="grid gap-6">
                {/* Availability Section */}
                <div className="rounded-xl border border-white/10 p-6 bg-white/5 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Briefcase className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Availability</h3>
                            <p className="text-sm text-white/40">Control your current work status across the site.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                        <div className="space-y-0.5">
                            <Label htmlFor="open-to-work" className="text-base text-white cursor-pointer">Open to Work</Label>
                            <p className="text-sm text-white/40">When enabled, "Available for new projects" badges will be shown.</p>
                        </div>
                        <Switch
                            id="open-to-work"
                            checked={settings?.isOpenToWork ?? false}
                            onCheckedChange={handleToggleOpenToWork}
                            disabled={updateMutation.isPending}
                        />
                    </div>
                </div>

                {/* Maintenance & Tools Section */}
                <div className="rounded-xl border border-white/10 p-6 bg-white/5 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Maintenance & Tools</h3>
                            <p className="text-sm text-white/40">Run various maintenance tasks to keep the site optimized.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 p-4 rounded-lg bg-white/5 border border-white/5">
                        {/* Bulk Image Optimizer */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-medium text-white">Bulk Image Optimizer</h4>
                                <p className="text-xs text-white/40">
                                    Migrates external images to Cloudinary and injects optimization parameters.
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={handleOptimizeImages}
                                disabled={isOptimizing}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-medium min-w-[140px]"
                            >
                                {isOptimizing ? (
                                    <>
                                        <RefreshCcw className="w-3 h-3 mr-2 animate-spin" />
                                        Optimizing...
                                    </>
                                ) : (
                                    "Optimize All Images"
                                )}
                            </Button>
                        </div>

                        {/* Deploy Hook */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-6">
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-medium text-white">Production Deployment</h4>
                                <p className="text-xs text-white/40">
                                    Triggers a fresh production build on Render.
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={handleDeploy}
                                disabled={isDeploying}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-medium min-w-[140px]"
                            >
                                {isDeploying ? (
                                    <>
                                        <RefreshCcw className="w-3 h-3 mr-2 animate-spin" />
                                        Deploying...
                                    </>
                                ) : (
                                    <>
                                        <Rocket className="w-3 h-3 mr-2" />
                                        Deploy to Production
                                    </>
                                )}
                            </Button>
                        </div>

                        {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                                <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Scanned</p>
                                    <p className="text-xl font-bold text-white">{stats.totalScanned}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Migrated</p>
                                    <p className="text-xl font-bold text-blue-400">{stats.migratedToCloudinary}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Optimized</p>
                                    <p className="text-xl font-bold text-green-400">{stats.optimizedUrls}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-black/20 border border-white/5 flex flex-col">
                                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Failed</p>
                                    <div className="flex items-center gap-1.5">
                                        <p className={`text-xl font-bold ${stats.failed > 0 ? "text-red-400" : "text-white/20"}`}>{stats.failed}</p>
                                        {stats.failed > 0 && <AlertCircle className="w-4 h-4 text-red-500/50" />}
                                    </div>
                                </div>
                                <div className="col-span-full py-2 px-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-green-400/80 font-medium">Last optimization run completed successfully.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* More settings can be added here */}
                <div className="rounded-xl border border-dashed border-white/10 p-12 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl mb-3 opacity-20">⚙️</div>
                    <p className="text-white/30 text-sm italic">More granular site controls coming soon...</p>
                </div>
            </div>
        </div>
    );
}
