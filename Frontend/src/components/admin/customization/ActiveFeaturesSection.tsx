import React from "react";
import { UseFormRegister } from "react-hook-form";
import { InsertSiteSettings } from "@portfolio/shared/schema";
import { CollapsibleSection } from "./SectionsCommon";

interface ActiveFeaturesSectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    isOpen: boolean;
    onToggle: () => void;
}

const FEATURE_TOGGLES = [
    { id: "featureBlog", label: "Enable Blog Section" },
    { id: "featureGuestbook", label: "Enable Guestbook" },
    { id: "featureServices", label: "Enable Services" },
    { id: "featureTestimonials", label: "Enable Testimonials" },
    { id: "featurePlayground", label: "Enable Lab/Playground" },
] as const;

export function ActiveFeaturesSection({ register, isOpen, onToggle }: ActiveFeaturesSectionProps) {
    return (
        <CollapsibleSection
            title="Active Features"
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEATURE_TOGGLES.map((feature) => (
                    <label key={feature.id} htmlFor={feature.id} className="flex items-center p-3 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/30 cursor-pointer transition-colors">
                        <input id={feature.id} {...register(feature.id as any)} type="checkbox" className="w-4 h-4 rounded border-white/20 bg-transparent text-purple-600 focus:ring-purple-500" />
                        <span className="ml-3 text-sm text-white/80">{feature.label}</span>
                    </label>
                ))}
            </div>
        </CollapsibleSection>
    );
}
