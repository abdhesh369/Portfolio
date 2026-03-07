import React from "react";
import { ChevronDown } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

export interface CollapsibleSectionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export interface SortableItemProps {
    id: string;
    children: (props: {
        attributes: DraggableAttributes;
        listeners: SyntheticListenerMap | undefined;
        isDragging: boolean;
    }) => React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 60 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children({ attributes, listeners, isDragging })}
        </div>
    );
}

export function CollapsibleSection({ title, isOpen, onToggle, children }: CollapsibleSectionProps) {
    return (
        <div className="border border-white/10 rounded-lg overflow-hidden transition-all duration-200">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <ChevronDown
                    size={20}
                    className={`text-white/60 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen ? "max-h-[3000px]" : "max-h-0"}`}
            >
                <div className="p-4 space-y-4 bg-white/[0.02] border-t border-white/5">
                    {children}
                </div>
            </div>
        </div>
    );
}
