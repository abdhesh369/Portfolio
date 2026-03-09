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
            title="IDENTITY_SYSTEM_V1"
            description="Configure the primary identity parameters for the portfolio entity."
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 p-2">
                <FloatingLabelInput
                    label="Formal Designation"
                    placeholder="John Doe"
                    {...register("personalName")}
                />
                <FloatingLabelInput
                    label="Core Specialization"
                    placeholder="Software Engineer"
                    {...register("personalTitle")}
                />
                <div className="md:col-span-2">
                    <FormTextarea
                        label="Entity Narrative"
                        placeholder="Detail your technical journey..."
                        {...register("personalBio")}
                    />
                </div>
                <div className="md:col-span-2">
                    <FloatingLabelInput
                        label="Visualization URI (Avatar)"
                        placeholder="https://..."
                        type="url"
                        {...register("personalAvatar")}
                    />
                </div>
            </div>
        </CollapsibleSection>
    );
}
