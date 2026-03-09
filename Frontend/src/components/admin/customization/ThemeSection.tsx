import React from "react";
import { UseFormRegister } from "react-hook-form";
import { InsertSiteSettings } from "@portfolio/shared";
import { CollapsibleSection } from "./SectionsCommon";
import { FloatingLabelInput, FormTextarea } from "../AdminShared";

interface ThemeSectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    isOpen: boolean;
    onToggle: () => void;
}

export function ThemeSection({ register, isOpen, onToggle }: ThemeSectionProps) {
    return (
        <CollapsibleSection
            title="VISUAL_KERNEL_CONFIG"
            isOpen={isOpen}
            onToggle={onToggle}
            description="Manage the visual kernel and typographic engine of the portfolio."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 p-2">
                <FloatingLabelInput
                    label="Background (HSL)"
                    placeholder="hsl(224, 71%, 4%)"
                    {...register("colorBackground")}
                    className="font-mono"
                />
                <FloatingLabelInput
                    label="Surface (HSL)"
                    placeholder="hsl(224, 71%, 10%)"
                    {...register("colorSurface")}
                    className="font-mono"
                />
                <FloatingLabelInput
                    label="Display Font"
                    placeholder="Inter"
                    {...register("fontDisplay")}
                />
                <FloatingLabelInput
                    label="Body Font"
                    placeholder="Inter"
                    {...register("fontBody")}
                />
                <div className="md:col-span-2">
                    <FormTextarea
                        label="Custom CSS Injector"
                        placeholder=".my-class { color: red; }"
                        {...register("customCss")}
                        className="font-mono text-[10px]"
                    />
                    <p className="text-[9px] text-admin-text-muted mt-3 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-pink-500/50" />
                        Unsafe constructs like url() and @import will be stripped server-side.
                    </p>
                </div>
            </div>
        </CollapsibleSection>
    );
}
