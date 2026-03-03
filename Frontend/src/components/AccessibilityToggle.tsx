import React from "react";
import { useTheme } from "./theme-provider";
import {
    Eye,
    Zap,
    Settings2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export function AccessibilityToggle() {
    const { reducedMotion, setReducedMotion, highContrast, setHighContrast } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" title="Accessibility Settings">
                    <Settings2 className="h-5 w-5" />
                    {(reducedMotion || highContrast) && (
                        <span className="absolute top-1 right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuCheckboxItem
                    checked={reducedMotion}
                    onCheckedChange={setReducedMotion}
                    className="cursor-pointer"
                >
                    <Zap className="mr-2 h-4 w-4" />
                    <span>Reduced Motion</span>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    checked={highContrast}
                    onCheckedChange={setHighContrast}
                    className="cursor-pointer"
                >
                    <Eye className="mr-2 h-4 w-4" />
                    <span>High Contrast</span>
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <div className="p-2 text-xs text-muted-foreground">
                    Adjust settings for a more comfortable viewing experience.
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
