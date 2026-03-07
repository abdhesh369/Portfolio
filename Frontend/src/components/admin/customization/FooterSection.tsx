import React from "react";
import { UseFormRegister } from "react-hook-form";
import { InsertSiteSettings } from "@portfolio/shared";
import { CollapsibleSection } from "./SectionsCommon";

interface FooterSectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    isOpen: boolean;
    onToggle: () => void;
}

export function FooterSection({ register, isOpen, onToggle }: FooterSectionProps) {
    return (
        <CollapsibleSection
            title="Footer Configuration"
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <label htmlFor="footerCopyright" className="text-xs font-medium text-white/50 uppercase">Copyright Text</label>
                    <input id="footerCopyright" {...register("footerCopyright")} className="admin-input" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="footerTagline" className="text-xs font-medium text-white/50 uppercase">Footer Tagline</label>
                    <input id="footerTagline" {...register("footerTagline")} className="admin-input" />
                </div>
            </div>
        </CollapsibleSection>
    );
}
