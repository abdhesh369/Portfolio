import React from "react";
import { UseFormRegister, UseFieldArrayMove } from "react-hook-form";
import { GripVertical, ChevronDown } from "lucide-react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { InsertSiteSettings } from "@shared/schema";
import { CollapsibleSection, SortableItem } from "./SectionsCommon";

interface SectionLayoutSectionProps {
    register: UseFormRegister<InsertSiteSettings>;
    sectionOrderFields: Record<string, any>[];
    moveSection: UseFieldArrayMove;
    sensors: any;
    handleSectionDragEnd: (event: DragEndEvent) => void;
    sectionLabels: Record<string, string>;
    settings: any;
    isOpen: boolean;
    onToggle: () => void;
}

export function SectionLayoutSection({
    register,
    sectionOrderFields,
    moveSection,
    sensors,
    handleSectionDragEnd,
    sectionLabels,
    settings,
    isOpen,
    onToggle
}: SectionLayoutSectionProps) {
    return (
        <CollapsibleSection
            title="Section Layout & Visibility"
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="space-y-4">
                <p className="text-xs text-white/40 italic">
                    Drag sections to reorder how they appear on your homepage. Use the toggle to hide/show sections.
                </p>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleSectionDragEnd}
                >
                    <SortableContext
                        items={sectionOrderFields.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {sectionOrderFields.map((field, index) => {
                                const sectionId = (settings?.sectionOrder?.[index] || field.id) as string;
                                const label = sectionLabels[sectionId] || sectionId;

                                return (
                                    <SortableItem key={field.id} id={field.id}>
                                        {({ attributes, listeners, isDragging }: { attributes: any, listeners: any, isDragging: boolean }) => (
                                            <div className={`flex items-center gap-3 p-3 rounded-lg bg-white/5 border transition-colors group ${isDragging ? "border-purple-500/50 bg-white/10 shadow-xl" : "border-white/5 hover:border-purple-500/30"}`}>
                                                <div
                                                    className="text-white/20 group-hover:text-white/40 cursor-grab px-1 active:cursor-grabbing"
                                                    {...attributes}
                                                    {...listeners}
                                                >
                                                    <GripVertical className="w-4 h-4" />
                                                </div>

                                                <span className="text-sm font-medium text-white/80 grow">{label}</span>

                                                <div className="flex items-center gap-4">
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            {...register(`sectionVisibility.${sectionId}` as any)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="relative w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white"></div>
                                                    </label>

                                                    <div className="flex gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={index === 0}
                                                            onClick={() => moveSection(index, index - 1)}
                                                            className="text-white/30 h-7 w-7"
                                                        >
                                                            <ChevronDown className="w-3 h-3 rotate-180" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={index === sectionOrderFields.length - 1}
                                                            onClick={() => moveSection(index, index + 1)}
                                                            className="text-white/30 h-7 w-7"
                                                        >
                                                            <ChevronDown className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </SortableItem>
                                );
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </CollapsibleSection>
    );
}
