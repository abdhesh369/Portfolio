import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "#src/components/ui/tooltip";

export interface ContributionDay {
    date: string;
    count: number;
    level: number;
}

interface ContributionGridProps {
    contributions: ContributionDay[];
    variant?: "emerald" | "cyan";
}

export const ContributionGrid: React.FC<ContributionGridProps> = ({ contributions, variant = "emerald" }) => {
    const getLevelColor = (level: number) => {
        if (variant === "cyan") {
            switch (level) {
                case 0: return "bg-white/[0.03]";
                case 1: return "bg-cyan-500/20";
                case 2: return "bg-cyan-500/40";
                case 3: return "bg-cyan-500/70";
                case 4: return "bg-cyan-500";
                default: return "bg-white/[0.03]";
            }
        }
        switch (level) {
            case 0: return "bg-white/[0.03]";
            case 1: return "bg-emerald-500/20";
            case 2: return "bg-emerald-500/40";
            case 3: return "bg-emerald-500/70";
            case 4: return "bg-emerald-500";
            default: return "bg-white/[0.03]";
        }
    };

    return (
        <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 min-w-max p-1">
                <TooltipProvider delayDuration={0}>
                    {contributions.map((day, i) => (
                        <Tooltip key={day.date + i}>
                            <TooltipTrigger asChild>
                                <div 
                                    className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-[2px] transition-colors duration-500 ${getLevelColor(day.level)}`}
                                />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-black/90 border-white/20 text-xs py-1 px-2">
                                <span className="font-bold">{day.count} contributions</span> on {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>
        </div>
    );
};
