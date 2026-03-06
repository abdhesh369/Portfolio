import React from "react";
import { UseFormRegister, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InsertSiteSettings } from "@portfolio/shared/schema";
import { CollapsibleSection } from "./SectionsCommon";

interface HeroSectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    taglineFields: Record<string, any>[];
    appendTagline: UseFieldArrayAppend<any, "heroTaglines">;
    removeTagline: UseFieldArrayRemove;
    isOpen: boolean;
    onToggle: () => void;
}

export function HeroSection({ register, taglineFields, appendTagline, removeTagline, isOpen, onToggle }: HeroSectionProps) {
    return (
        <CollapsibleSection
            title="Hero Section"
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="heroGreeting" className="text-xs font-medium text-white/50 uppercase">Greeting Text</label>
                    <input id="heroGreeting" {...register("heroGreeting")} className="admin-input" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="heroBadgeText" className="text-xs font-medium text-white/50 uppercase">Badge Text</label>
                    <input id="heroBadgeText" {...register("heroBadgeText")} className="admin-input" />
                </div>
                <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-white/50 uppercase">Dynamic Taglines</label>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendTagline("")} className="h-7 text-[10px]">
                            <Plus className="w-3 h-3 mr-1" /> Add Tagline
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {taglineFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <input
                                    {...register(`heroTaglines.${index}` as any)}
                                    className="admin-input"
                                    placeholder="e.g. Building high-performance apps"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeTagline(index)}
                                    className="text-white/30 hover:text-red-400 hover:bg-red-400/10 shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
}
