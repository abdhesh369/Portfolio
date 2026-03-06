import React from "react";
import { UseFormRegister } from "react-hook-form";
import { InsertSiteSettings } from "@shared/schema";
import { CollapsibleSection } from "./SectionsCommon";

interface ThemeSectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    isOpen: boolean;
    onToggle: () => void;
}

export function ThemeSection({ register, isOpen, onToggle }: ThemeSectionProps) {
    return (
        <CollapsibleSection
            title="Theme & Typography"
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="colorBackground" className="text-xs font-medium text-white/50 uppercase">Background (HSL)</label>
                    <input id="colorBackground" {...register("colorBackground")} className="admin-input font-mono" placeholder="hsl(224, 71%, 4%)" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="colorSurface" className="text-xs font-medium text-white/50 uppercase">Surface (HSL)</label>
                    <input id="colorSurface" {...register("colorSurface")} className="admin-input font-mono" placeholder="hsl(224, 71%, 10%)" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="fontDisplay" className="text-xs font-medium text-white/50 uppercase">Display Font (Google Fonts)</label>
                    <input id="fontDisplay" {...register("fontDisplay")} className="admin-input" placeholder="Inter" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="fontBody" className="text-xs font-medium text-white/50 uppercase">Body Font (Google Fonts)</label>
                    <input id="fontBody" {...register("fontBody")} className="admin-input" placeholder="Inter" />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label htmlFor="customCss" className="text-xs font-medium text-white/50 uppercase">Custom CSS Injector</label>
                    <textarea id="customCss" {...register("customCss")} rows={4} className="admin-input font-mono text-xs" placeholder=".my-class { color: red; }" />
                    <p className="text-[10px] text-white/30 italic">Unsafe constructs like url() and @import will be stripped server-side.</p>
                </div>
            </div>
        </CollapsibleSection>
    );
}
