import React from "react";
import { Download, Upload, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomizationHeaderProps {
    onExport: () => void;
    onImportClick: () => void;
    onReset: () => void;
}

export function CustomizationHeader({ onExport, onImportClick, onReset }: CustomizationHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Customization</h2>
                <p className="text-white/40 text-sm mt-1">Configure your branding, layout, and toggles.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={onExport} className="text-white/70">
                    <Download className="w-4 h-4 mr-2" /> Export
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onImportClick}
                    className="text-white/70"
                >
                    <Upload className="w-4 h-4 mr-2" /> Import
                </Button>

                <Button variant="outline" size="sm" onClick={onReset} className="text-white/70 hover:text-red-400">
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
            </div>
        </div>
    );
}
