import React from "react";
import { Download, Upload, RotateCcw, Box } from "lucide-react";
import { AdminButton } from "../AdminShared";

interface CustomizationHeaderProps {
    onExport: () => void;
    onImportClick: () => void;
    onReset: () => void;
}

export function CustomizationHeader({ onExport, onImportClick, onReset }: CustomizationHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-purple-500/10">
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                    <Box className="w-5 h-5 text-purple-400" />
                    <h2 className="text-3xl font-black text-admin-text-primary tracking-[-0.04em] uppercase italic">
                        APPEARANCE_&_<span className="text-purple-500">THEMES</span>
                    </h2>
                </div>
                <p className="text-admin-text-muted text-[10px] font-mono tracking-widest uppercase opacity-60">
                    Configure your brand aesthetic, themes, and global navigation links.
                </p>
            </div>
            <div className="flex flex-wrap gap-3">
                <AdminButton variant="secondary" onClick={onExport} className="h-9 px-4">
                    <Download className="w-3.5 h-3.5 mr-2" />
                    <span className="text-[10px] tracking-widest font-bold">EXPORT_DATA</span>
                </AdminButton>

                <AdminButton
                    variant="secondary"
                    onClick={onImportClick}
                    className="h-9 px-4"
                >
                    <Upload className="w-3.5 h-3.5 mr-2" />
                    <span className="text-[10px] tracking-widest font-bold">IMPORT_DATA</span>
                </AdminButton>

                <AdminButton variant="secondary" onClick={onReset} className="h-9 px-4 text-red-400 hover:text-red-300 hover:bg-red-400/5">
                    <RotateCcw className="w-3.5 h-3.5 mr-2" />
                    <span className="text-[10px] tracking-widest font-bold">RESET_ENGINE</span>
                </AdminButton>
            </div>
        </div>
    );
}
