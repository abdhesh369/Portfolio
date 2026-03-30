import React from "react";
import { UseFormRegister, UseFieldArrayRemove, UseFieldArrayMove, UseFieldArrayAppend } from "react-hook-form";
import { GripVertical, Plus, Trash2, ChevronDown, Link as LinkIcon } from "lucide-react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { InsertSiteSettings } from "#shared";
import { CollapsibleSection, SortableItem } from "./SectionsCommon";
import { FloatingLabelInput, AdminButton } from "../AdminShared";

interface NavbarSectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    navFields: { id: string; label: string; href: string; icon?: string }[];
    appendNav: UseFieldArrayAppend<InsertSiteSettings, "navbarLinks">;
    removeNav: UseFieldArrayRemove;
    moveNav: UseFieldArrayMove;
    sensors: ReturnType<typeof import("@dnd-kit/core").useSensors>;
    handleNavDragEnd: (event: DragEndEvent) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export function NavbarSection({
    register,
    navFields,
    appendNav,
    removeNav,
    moveNav,
    sensors,
    handleNavDragEnd,
    isOpen,
    onToggle
}: NavbarSectionProps) {
    return (
        <CollapsibleSection
            title="QUICK_LINKS_ENGINE_V1"
            isOpen={isOpen}
            onToggle={onToggle}
            icon={<LinkIcon className="w-4 h-4" />}
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between bg-[#0d0d1a] p-3 rounded-lg border border-purple-500/20 nm-inset">
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-bold text-purple-400 tracking-[0.2em] uppercase">Quick Links Inventory (Footer)</h4>
                        <p className="text-[9px] text-admin-text-muted leading-relaxed">Map core access points to systemic routes in the footer.</p>
                    </div>
                    <AdminButton
                        type="button"
                        variant="primary"
                        onClick={() => appendNav({ label: "New Link", href: "#", icon: "link" })}
                        className="h-8 px-4"
                    >
                        <Plus className="w-3 h-3 mr-2" /> <span className="text-[10px] tracking-widest">ADD_QUICK_LINK</span>
                    </AdminButton>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleNavDragEnd}
                >
                    <SortableContext
                        items={navFields.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4">
                            {navFields.map((field, index) => (
                                <SortableItem key={field.id} id={field.id}>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {({ attributes, listeners, isDragging }: { attributes: any; listeners: any; isDragging: boolean }) => (
                                        <div className={`
                                            flex flex-col md:flex-row gap-4 p-4 rounded-xl border transition-all duration-300 group
                                            ${isDragging
                                                ? "border-purple-500/50 bg-[#121225] shadow-[0_0_30px_rgba(124,58,237,0.2)] scale-[1.02] z-50 nm-flat"
                                                : "border-purple-500/10 bg-[#0d0d1a] nm-inset hover:border-purple-500/30"}
                                        `}>
                                            <div className="flex items-start gap-4 grow">
                                                <div
                                                    className="mt-3 text-admin-text-muted hover:text-purple-400 cursor-grab px-1 active:cursor-grabbing transition-colors"
                                                    {...attributes}
                                                    {...listeners}
                                                >
                                                    <GripVertical className="w-5 h-5" />
                                                </div>

                                                <div className="flex flex-col gap-4 grow">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 grow">
                                                        <FloatingLabelInput
                                                            label="LINK_CAPTION"
                                                            {...register(`navbarLinks.${index}.label` as const)}
                                                            className="h-11"
                                                            placeholder="Entry Label"
                                                        />
                                                        <FloatingLabelInput
                                                            label="TARGET_ROUTE"
                                                            {...register(`navbarLinks.${index}.href` as const)}
                                                            className="h-11 font-mono text-[11px]"
                                                            placeholder="#section-id"
                                                        />
                                                        <FloatingLabelInput
                                                            label="ICON_IDENTIFIER"
                                                            {...register(`navbarLinks.${index}.icon` as const)}
                                                            className="h-11 font-mono text-[11px] lg:col-span-1 md:col-span-2"
                                                            placeholder="lucide-icon-name"
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-purple-500/5">
                                                        <span className="text-[9px] font-mono text-admin-text-muted opacity-50 uppercase tracking-tighter">
                                                            OBJ_ID: {field.id.substring(0, 8)}...
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <AdminButton
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                disabled={index === 0}
                                                                onClick={() => moveNav(index, index - 1)}
                                                                className="h-7 w-7 p-0"
                                                            >
                                                                <ChevronDown className="w-3 h-3 rotate-180" />
                                                            </AdminButton>
                                                            <AdminButton
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                disabled={index === navFields.length - 1}
                                                                onClick={() => moveNav(index, index + 1)}
                                                                className="h-7 w-7 p-0"
                                                            >
                                                                <ChevronDown className="w-3 h-3" />
                                                            </AdminButton>
                                                            <AdminButton
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeNav(index)}
                                                                className="h-7 px-3 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                            >
                                                                <Trash2 className="w-3 h-3 mr-2" />
                                                                <span className="text-[9px] tracking-[0.2em] font-bold">PURGE</span>
                                                            </AdminButton>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </SortableItem>
                            ))}

                            {navFields.length === 0 && (
                                <div className="p-8 border border-dashed border-purple-500/20 rounded-xl bg-[#050509] flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3 nm-flat">
                                        <LinkIcon className="w-6 h-6 text-purple-400/50" />
                                    </div>
                                    <h4 className="text-xs font-bold text-admin-text-muted uppercase tracking-widest">No routes registered</h4>
                                    <p className="text-[10px] text-admin-text-muted/60 mt-1">Deploy navigation links to populate the Link Matrix.</p>
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </CollapsibleSection>
    );
}
