import React from "react";
import { Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyFormFooterProps {
    isDirty: boolean;
    isPending: boolean;
}

export function StickyFormFooter({ isDirty, isPending }: StickyFormFooterProps) {
    return (
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-white/10 p-4 -mx-4 mt-8 flex items-center gap-4 z-50">
            <Button
                type="submit"
                disabled={!isDirty || isPending}
                className="bg-purple-600 hover:bg-purple-500 text-white px-8"
            >
                <Save className="w-4 h-4 mr-2" />
                {isPending ? "Saving..." : "Save Changes"}
            </Button>

            {isDirty && (
                <span className="text-yellow-400 text-sm flex items-center animate-pulse">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    You have unsaved changes
                </span>
            )}
        </div>
    );
}
