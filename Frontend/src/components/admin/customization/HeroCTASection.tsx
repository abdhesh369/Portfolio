import React from "react";
import { UseFormRegister } from "react-hook-form";
import { InsertSiteSettings } from "@shared/schema";
import { CollapsibleSection } from "./SectionsCommon";

interface HeroCTASectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    isOpen: boolean;
    onToggle: () => void;
}

export function HeroCTASection({ register, isOpen, onToggle }: HeroCTASectionProps) {
    return (
        <CollapsibleSection
            title="Hero Call-to-Actions"
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-4">
                    <h4 className="text-sm font-semibold text-purple-400">Primary CTA</h4>
                    <div className="space-y-2">
                        <label htmlFor="heroCtaPrimary" className="text-xs font-medium text-white/50 uppercase">Label</label>
                        <input id="heroCtaPrimary" {...register("heroCtaPrimary")} className="admin-input" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="heroCtaPrimaryUrl" className="text-xs font-medium text-white/50 uppercase">URL / Hash</label>
                        <input id="heroCtaPrimaryUrl" {...register("heroCtaPrimaryUrl")} className="admin-input" />
                    </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-4">
                    <h4 className="text-sm font-semibold text-cyan-400">Secondary CTA</h4>
                    <div className="space-y-2">
                        <label htmlFor="heroCtaSecondary" className="text-xs font-medium text-white/50 uppercase">Label</label>
                        <input id="heroCtaSecondary" {...register("heroCtaSecondary")} className="admin-input" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="heroCtaSecondaryUrl" className="text-xs font-medium text-white/50 uppercase">URL / Hash</label>
                        <input id="heroCtaSecondaryUrl" {...register("heroCtaSecondaryUrl")} className="admin-input" />
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
}
