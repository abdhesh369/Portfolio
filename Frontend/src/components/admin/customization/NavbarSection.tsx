import React from "react";
import { UseFormRegister, UseFieldArrayRemove, UseFieldArrayMove, UseFieldArrayAppend } from "react-hook-form";
import { Plus, Trash2, GripVertical, ChevronDown } from "lucide-react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { InsertSiteSettings } from "@portfolio/shared/schema";
import { CollapsibleSection, SortableItem } from "./SectionsCommon";

interface NavbarSectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    navFields: Record<string, any>[];
    appendNav: UseFieldArrayAppend<InsertSiteSettings, "navbarLinks">;
    removeNav: UseFieldArrayRemove;
    moveNav: UseFieldArrayMove;
    sensors: any;
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
            title="Navbar Configuration"
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-white/40">Manage your site's navigation menu.</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendNav({ label: "New Link", href: "#", icon: "link" })} className="h-7 text-[10px]">
                        <Plus className="w-3 h-3 mr-1" /> Add Link
                    </Button>
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
                        <div className="space-y-2">
                            {navFields.map((field, index) => (
                                <SortableItem key={field.id} id={field.id}>
                                    {({ attributes, listeners, isDragging }: { attributes: any, listeners: any, isDragging: boolean }) => (
                                        <div className={`flex flex-col md:flex-row gap-2 p-3 rounded-lg bg-white/5 border transition-colors group ${isDragging ? "border-purple-500/50 bg-white/10 shadow-xl" : "border-white/5"}`}>
                                            <div className="flex items-center gap-2 grow">
                                                <div
                                                    className="text-white/20 group-hover:text-white/40 cursor-grab px-1 active:cursor-grabbing"
                                                    {...attributes}
                                                    {...listeners}
                                                >
                                                    <GripVertical className="w-4 h-4" />
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 grow">
                                                    <input
                                                        {...register(`navbarLinks.${index}.label` as any)}
                                                        className="admin-input h-9"
                                                        placeholder="Label"
                                                    />
                                                    <input
                                                        {...register(`navbarLinks.${index}.href` as any)}
                                                        className="admin-input h-9"
                                                        placeholder="Href (e.g. #projects)"
                                                    />
                                                    <input
                                                        {...register(`navbarLinks.${index}.icon` as any)}
                                                        className="admin-input h-9 md:col-span-1 col-span-2"
                                                        placeholder="Icon name (lucide)"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 shrink-0">
                                                <div className="flex gap-1 md:flex-col">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={index === 0}
                                                        onClick={() => moveNav(index, index - 1)}
                                                        className="text-white/30 h-7 w-7"
                                                    >
                                                        <ChevronDown className="w-4 h-4 rotate-180" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={index === navFields.length - 1}
                                                        onClick={() => moveNav(index, index + 1)}
                                                        className="text-white/30 h-7 w-7"
                                                    >
                                                        <ChevronDown className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeNav(index)}
                                                    className="text-white/30 hover:text-red-400 hover:bg-red-400/10 h-9 w-9 self-center"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </SortableItem>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </CollapsibleSection>
    );
}
