import React from "react";
import { Save, AlertCircle, Cpu } from "lucide-react";
import { AdminButton } from "../AdminShared";

interface StickyFormFooterProps {
    isDirty: boolean;
    isPending: boolean;
}

export function StickyFormFooter({ isDirty, isPending }: StickyFormFooterProps) {
    return (
        <div className="sticky bottom-4 mx-2 bg-[#050509]/80 backdrop-blur-xl border border-purple-500/20 p-4 px-6 rounded-2xl flex items-center justify-between gap-4 z-50 nm-flat shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
                <AdminButton
                    type="submit"
                    variant="primary"
                    disabled={!isDirty || isPending}
                    className="px-10 h-10 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                >
                    <Save className="w-4 h-4 mr-2" />
                    <span className="text-xs tracking-[0.2em] font-black uppercase">
                        {isPending ? "SYNCHRONIZING..." : "DEPLOY_CHANGES"}
                    </span>
                </AdminButton>

                {isDirty && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-yellow-400/80 uppercase tracking-widest italic">
                            Local State Mismatch Detected
                        </span>
                    </div>
                )}
            </div>

            <div className="hidden lg:flex items-center gap-3 px-4 py-2 border-l border-purple-500/10">
                <div className="text-right">
                    <p className="text-[9px] font-mono text-admin-text-muted uppercase tracking-tighter opacity-50">Config Engine Status</p>
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">READY_FOR_DEPLOY</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center nm-inset">
                    <Cpu className="w-4 h-4 text-purple-500/70" />
                </div>
            </div>
        </div>
    );
}
