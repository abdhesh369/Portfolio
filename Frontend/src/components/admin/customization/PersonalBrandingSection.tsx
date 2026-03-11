import React from "react";
import { UseFormRegister } from "react-hook-form";
import { InsertSiteSettings } from "@portfolio/shared";
import { CollapsibleSection } from "./SectionsCommon";
import { FloatingLabelInput, FormTextarea } from "../AdminShared";

interface PersonalBrandingSectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    isOpen: boolean;
    onToggle: () => void;
}

export function PersonalBrandingSection({ register, isOpen, onToggle }: PersonalBrandingSectionProps) {
    return (
        <CollapsibleSection
            title="BRANDING_AND_IDENTITY"
            description="Control your primary branding logo and personal identify details."
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 p-2">
                <div className="md:col-span-2">
                    <FloatingLabelInput
                        label="Logo Text (controls navbar logo only)"
                        placeholder="Portfolio.Dev"
                        {...register("logoText")}
                    />
                    <p className="text-[9px] text-admin-text-muted mt-2 px-1 italic">Displays in the top-left of the site. Use a period (.) to match styling.</p>
                </div>

                <FloatingLabelInput
                    label="Personal Name (used in bio + page title)"
                    placeholder="Abdhesh Sah"
                    {...register("personalName")}
                />
                <FloatingLabelInput
                    label="Professional Title / Role"
                    placeholder="Full Stack Engineer"
                    {...register("personalTitle")}
                />
                <div className="md:col-span-2">
                    <FloatingLabelInput
                        label="Location (e.g., Kathmandu, Nepal)"
                        placeholder="Kathmandu, Nepal"
                        {...register("locationText")}
                    />
                </div>
                <div className="md:col-span-2">
                    <FloatingLabelInput
                        label="Personal Avatar URL"
                        placeholder="https://..."
                        type="url"
                        {...register("personalAvatar")}
                    />
                </div>
            </div>
        </CollapsibleSection>
    );
}
