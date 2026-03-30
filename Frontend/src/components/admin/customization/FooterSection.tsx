import React from "react";
import { UseFormRegister } from "react-hook-form";
import { InsertSiteSettings } from "#shared";
import { CollapsibleSection } from "./SectionsCommon";
import { FloatingLabelInput } from "../AdminShared";

interface FooterSectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    isOpen: boolean;
    onToggle: () => void;
}

export function FooterSection({ register, isOpen, onToggle }: FooterSectionProps) {
    return (
        <CollapsibleSection
            title="TERMINAL_DATA_BASE"
            description="Operationalize the persistent data at the base of the interface."
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
                <FloatingLabelInput
                    label="Terminal Copyright"
                    placeholder="© 2026 Your Name"
                    {...register("footerCopyright")}
                />
                <FloatingLabelInput
                    label="Footer Descriptor"
                    placeholder="Built with React & Framer Motion"
                    {...register("footerTagline")}
                />
            </div>
        </CollapsibleSection>
    );
}
