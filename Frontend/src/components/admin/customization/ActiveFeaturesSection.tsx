import React from "react";
import { Control, Controller } from "react-hook-form";
import { InsertSiteSettings } from "@portfolio/shared";
import { CollapsibleSection } from "./SectionsCommon";
import { SpringToggle } from "../AdminShared";

interface ActiveFeaturesSectionProps {
    control: Control<InsertSiteSettings>;
    isOpen: boolean;
    onToggle: () => void;
}

const FEATURE_TOGGLES = [
    { id: "featureBlog", label: "Kernel Blog", desc: "Enable the centralized technical log." },
    { id: "featureGuestbook", label: "Public Signal", desc: "Open the encrypted visitor feedback loop." },
    { id: "featureServices", label: "Task Engine", desc: "Display available modular service units." },
    { id: "featureTestimonials", label: "Validation Grid", desc: "Showcase verified peer feedback." },
    { id: "featurePlayground", label: "Sandbox Lab", desc: "Expose experimental UI components." },
] as const;

export function ActiveFeaturesSection({ control, isOpen, onToggle }: ActiveFeaturesSectionProps) {
    return (
        <CollapsibleSection
            title="MODULAR_FEATURE_GRID"
            description="Toggle active operational modules within the current deployment."
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FEATURE_TOGGLES.map((feature) => (
                    <Controller
                        key={feature.id}
                        name={feature.id as keyof InsertSiteSettings}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <SpringToggle
                                label={feature.label}
                                description={feature.desc}
                                checked={!!value}
                                onChange={onChange}
                                className="rounded-2xl"
                            />
                        )}
                    />
                ))}
            </div>
        </CollapsibleSection>
    );
}
