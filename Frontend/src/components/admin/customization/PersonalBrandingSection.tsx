import React from "react";
import { UseFormRegister } from "react-hook-form";
import { InsertSiteSettings } from "@shared/schema";
import { CollapsibleSection } from "./SectionsCommon";

interface PersonalBrandingSectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    isOpen: boolean;
    onToggle: () => void;
}

export function PersonalBrandingSection({ register, isOpen, onToggle }: PersonalBrandingSectionProps) {
    return (
        <CollapsibleSection
            title="Personal Branding"
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="personalName" className="text-xs font-medium text-white/50 uppercase">Full Name</label>
                    <input id="personalName" {...register("personalName")} className="admin-input" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="personalTitle" className="text-xs font-medium text-white/50 uppercase">Professional Title</label>
                    <input id="personalTitle" {...register("personalTitle")} className="admin-input" placeholder="Software Engineer" />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label htmlFor="personalBio" className="text-xs font-medium text-white/50 uppercase">Bio</label>
                    <textarea id="personalBio" {...register("personalBio")} rows={3} className="admin-input resize-none" />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label htmlFor="personalAvatar" className="text-xs font-medium text-white/50 uppercase">Avatar URL</label>
                    <input id="personalAvatar" {...register("personalAvatar")} type="url" className="admin-input" placeholder="https://..." />
                </div>
            </div>
        </CollapsibleSection>
    );
}
