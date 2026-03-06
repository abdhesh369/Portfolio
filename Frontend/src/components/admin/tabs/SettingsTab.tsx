import React from "react";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/portfolio";
import { LoadingSkeleton } from "@/components/admin/AdminShared";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Briefcase } from "lucide-react";

export function SettingsTab() {
    const { data: settings, isLoading } = useSiteSettings();
    const updateMutation = useUpdateSiteSettings();

    if (isLoading) return <LoadingSkeleton />;

    const handleToggleOpenToWork = (checked: boolean) => {
        updateMutation.mutate({ isOpenToWork: checked });
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

                {/* More settings can be added here */}
                <div className="rounded-xl border border-dashed border-white/10 p-12 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl mb-3 opacity-20">⚙️</div>
                    <p className="text-white/30 text-sm italic">More granular site controls coming soon...</p>
                </div>
            </div>
        </div>
    );
}
