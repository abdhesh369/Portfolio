import React from "react";
import { UseFormRegister } from "react-hook-form";
import { InsertSiteSettings } from "@portfolio/shared";
import { CollapsibleSection } from "./SectionsCommon";
import { FloatingLabelInput } from "../AdminShared";

interface HeroCTASectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    isOpen: boolean;
    onToggle: () => void;
}

export function HeroCTASection({ register, isOpen, onToggle }: HeroCTASectionProps) {
    return (
        <CollapsibleSection
            title="INTERACTION_VECTOR_CONFIG"
            description="Configure the primary and secondary interaction vectors for the main landing interface."
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
                <div className="p-8 rounded-[2rem] nm-inset space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent opacity-30" />
                    <h4 className="text-[10px] font-black text-purple-400 tracking-[0.3em] uppercase opacity-70">Primary Protocol</h4>
                    <div className="space-y-8">
                        <FloatingLabelInput
                            label="Action Label"
                            {...register("heroCtaPrimary")}
                        />
                        <FloatingLabelInput
                            label="Target URI / Anchor"
                            {...register("heroCtaPrimaryUrl")}
                            className="font-mono"
                        />
                    </div>
                </div>

                <div className="p-8 rounded-[2rem] nm-inset space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent opacity-30" />
                    <h4 className="text-[10px] font-black text-cyan-400 tracking-[0.3em] uppercase opacity-70">Secondary Protocol</h4>
                    <div className="space-y-8">
                        <FloatingLabelInput
                            label="Action Label"
                            {...register("heroCtaSecondary")}
                        />
                        <FloatingLabelInput
                            label="Target URI / Anchor"
                            {...register("heroCtaSecondaryUrl")}
                            className="font-mono"
                        />
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
}
