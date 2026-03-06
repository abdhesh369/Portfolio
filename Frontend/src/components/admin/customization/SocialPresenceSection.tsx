import React from "react";
import { UseFormRegister } from "react-hook-form";
import { InsertSiteSettings } from "@portfolio/shared/schema";
import { CollapsibleSection } from "./SectionsCommon";

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
            title="Social Presence"
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SOCIAL_FIELDS.map((social) => (
                    <div key={social.id} className="space-y-2">
                        <label htmlFor={social.id} className="text-xs font-medium text-white/50 uppercase">{social.label}</label>
                        <input id={social.id} {...register(social.id as any)} type="url" className="admin-input" placeholder="https://..." />
                    </div>
                ))}
            </div>
        </CollapsibleSection>
    );
}
