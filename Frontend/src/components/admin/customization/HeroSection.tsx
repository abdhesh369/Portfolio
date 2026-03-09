import { UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { InsertSiteSettings } from "@portfolio/shared";
import { CollapsibleSection } from "./SectionsCommon";
import { FloatingLabelInput, AdminButton } from "../AdminShared";

interface HeroSectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    taglineFields: any[];
    appendTagline: (value: string) => void;
    removeTagline: (index: number) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export function HeroSection({ register, taglineFields, appendTagline, removeTagline, isOpen, onToggle }: HeroSectionProps) {
    return (
        <CollapsibleSection
            title="CORE_MESSAGING_V1"
            description="Manage the primary entry-point messaging and dynamic tagline array."
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 p-2">
                <FloatingLabelInput
                    label="Initialization Message"
                    placeholder="Hey, I am"
                    {...register("heroGreeting")}
                />
                <FloatingLabelInput
                    label="Status Badge"
                    placeholder="Available for work"
                    {...register("heroBadgeText")}
                />

                <div className="md:col-span-2 space-y-6 pt-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <label className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Dynamic Taglines</label>
                        <AdminButton
                            variant="secondary"
                            size="sm"
                            onClick={() => appendTagline("")}
                            icon={Plus}
                        >
                            Append
                        </AdminButton>
                    </div>

                    <div className="space-y-4">
                        {taglineFields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-center animate-in slide-in-from-right-4 duration-300">
                                <span className="text-[9px] font-mono text-purple-500/50 w-4">{String(index + 1).padStart(2, '0')}</span>
                                <FloatingLabelInput
                                    label={`Tagline Array [${index}]`}
                                    placeholder="e.g. Building high-performance apps"
                                    {...register(`heroTaglines.${index}` as const)}
                                />
                                <AdminButton
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeTagline(index)}
                                    className="h-11 w-11 p-0 text-pink-500 hover:text-pink-400 hover:bg-pink-500/10 rounded-xl"
                                >
                                    <Trash2 size={16} />
                                </AdminButton>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
}
