import React from "react";
import { UseFormRegister } from "react-hook-form";
import { InsertSiteSettings } from "#shared";
import { CollapsibleSection } from "./SectionsCommon";
import { FloatingLabelInput } from "../AdminShared";

interface SocialPresenceSectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    isOpen: boolean;
    onToggle: () => void;
}

const SOCIAL_FIELDS = [
    { id: "socialGithub", label: "GitHub" },
    { id: "socialLinkedin", label: "LinkedIn" },
    { id: "socialTwitter", label: "Twitter / X" },
    { id: "socialInstagram", label: "Instagram" },
    { id: "socialFacebook", label: "Facebook" },
    { id: "socialYoutube", label: "YouTube" },
    { id: "socialDiscord", label: "Discord" },
    { id: "socialStackoverflow", label: "StackOverflow" },
    { id: "socialDevto", label: "Dev.to" },
    { id: "socialMedium", label: "Medium" },
    { id: "socialEmail", label: "Contact Email" },
] as const;

export function SocialPresenceSection({ register, isOpen, onToggle }: SocialPresenceSectionProps) {
    return (
        <CollapsibleSection
            title="SOCIAL_LINKS_MANAGEMENT"
            description="Manage external links and protocol access points for the entity."
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 p-2">
                {SOCIAL_FIELDS.map((social) => (
                    <FloatingLabelInput
                        key={social.id}
                        label={social.label}
                        placeholder="https://..."
                        type={social.id === 'socialEmail' ? 'email' : 'url'}
                        {...register(social.id as keyof InsertSiteSettings)}
                    />
                ))}
            </div>
        </CollapsibleSection>
    );
}
