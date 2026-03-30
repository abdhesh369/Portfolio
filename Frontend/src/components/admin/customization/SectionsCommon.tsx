import React from "react";
import { ChevronDown } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DraggableAttributes } from "@dnd-kit/core";
import { cn } from "#src/lib/utils";

type SyntheticListenerMap = ReturnType<typeof useSortable>['listeners'];

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

export interface CollapsibleSectionProps {
    title: string;
    description?: string;
    isOpen: boolean;
    onToggle: () => void;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export function CollapsibleSection({ title, description, isOpen, onToggle, icon, children }: CollapsibleSectionProps) {
    return (
        <div className="border border-white/5 rounded-[1.5rem] overflow-hidden transition-all duration-300 nm-flat bg-[#0d0d1a]">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between px-8 py-7 hover:bg-white/[0.02] transition-colors focus:outline-none"
            >
                <div className="flex items-center gap-4 text-left">
                    {icon && <div className="text-purple-500 opacity-80">{icon}</div>}
                    <div className="space-y-1">
                        <h3 className="text-[11px] font-black text-white tracking-[0.25em] uppercase">{title}</h3>
                        {description && <p className="text-[9px] text-admin-text-muted font-medium tracking-wide">{description}</p>}
                    </div>
                </div>
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                    isOpen ? "bg-purple-500/20 text-purple-400 rotate-180" : "bg-black/20 text-slate-500 nm-inset"
                )}>
                    <ChevronDown size={14} />
                </div>
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all duration-500 ease-[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
                    isOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="px-8 pb-8 space-y-6 pt-2 border-t border-white/[0.03]">
                    {children}
                </div>
            </div>
        </div>
    );
}
