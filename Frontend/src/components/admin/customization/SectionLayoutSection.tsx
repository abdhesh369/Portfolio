import React from "react";
import { UseFormRegister, UseFieldArrayMove, Path, Control, Controller } from "react-hook-form";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { DndContext, closestCenter, DragEndEvent, SensorDescriptor, SensorOptions, DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { InsertSiteSettings } from "@portfolio/shared";
import { CollapsibleSection, SortableItem } from "./SectionsCommon";
import { SpringToggle, AdminButton } from "../AdminShared";

interface SectionLayoutSectionProps {
    control: Control<InsertSiteSettings>;
    sectionOrderFields: { id: string }[];
    moveSection: UseFieldArrayMove;
    sensors: SensorDescriptor<SensorOptions>[];
    handleSectionDragEnd: (event: DragEndEvent) => void;
    sectionLabels: Record<string, string>;
    settings: InsertSiteSettings | null | undefined;
    isOpen: boolean;
    onToggle: () => void;
}

export function SectionLayoutSection({
    control,
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
            title="HIERARCHY_ACTIVATION_STACK"
            description="Reorder the activation stack and manage modular visibility states."
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="space-y-6 p-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleSectionDragEnd}
                >
                    <SortableContext
                        items={sectionOrderFields.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {sectionOrderFields.map((field, index) => {
                                const sectionId = (settings?.sectionOrder?.[index] || field.id) as string;
                                const label = sectionLabels[sectionId] || sectionId;

                                return (
                                    <SortableItem key={field.id} id={field.id}>
                                        {({ attributes, listeners, isDragging }: { attributes: DraggableAttributes; listeners: SyntheticListenerMap | undefined; isDragging: boolean }) => (
                                            <div className={`
                                                flex items-center gap-4 p-4 rounded-[1.5rem] nm-inset border transition-all duration-300 group
                                                ${isDragging ? "border-purple-500/50 scale-[1.02] shadow-[0_20px_50px_rgba(124,58,237,0.2)] z-50" : "border-transparent hover:border-white/5"}
                                            `}>
                                                <div
                                                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-admin-text-muted cursor-grab active:cursor-grabbing hover:text-white transition-colors"
                                                    {...attributes}
                                                    {...listeners}
                                                >
                                                    <GripVertical size={16} />
                                                </div>

                                                <div className="flex flex-col grow min-w-0">
                                                    <span className="text-[10px] font-black text-admin-text-muted tracking-[0.2em] uppercase mb-1">Module {String(index).padStart(2, '0')}</span>
                                                    <span className="text-sm font-bold text-white truncate">{label}</span>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-[9px] font-bold text-admin-text-muted uppercase tracking-wider">Visibility</span>
                                                        <Controller
                                                            name={`sectionVisibility.${sectionId}` as Path<InsertSiteSettings>}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <SpringToggle
                                                                    label="VISIBILITY"
                                                                    checked={!!field.value}
                                                                    onChange={field.onChange}
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="h-10 w-px bg-white/5" />

                                                    <div className="flex gap-2">
                                                        <AdminButton
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            disabled={index === 0}
                                                            onClick={() => moveSection(index, index - 1)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <ChevronUp size={14} />
                                                        </AdminButton>
                                                        <AdminButton
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            disabled={index === sectionOrderFields.length - 1}
                                                            onClick={() => moveSection(index, index + 1)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <ChevronDown size={14} />
                                                        </AdminButton>
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
