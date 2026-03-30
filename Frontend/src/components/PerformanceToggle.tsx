import { Zap, ZapOff } from "lucide-react";
import { useTheme } from "#src/components/theme-provider";
import { Button } from "#src/components/ui/button";

export function PerformanceToggle() {
    const { performanceMode, setPerformanceMode } = useTheme();
    const isLowPower = performanceMode === "low";

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setPerformanceMode(isLowPower ? "high" : "low")}
            className={`relative w-9 h-9 rounded-full transition-all duration-300 ${isLowPower
                ? "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                }`}
            aria-label={`Switch to Global ${isLowPower ? "High Performance" : "Low Power"} mode`}
            title={isLowPower ? "Enable Global High Performance" : "Enable Global Low Power Mode"}
        >
            <Zap className={`h-4 w-4 transition-all ${isLowPower ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`} />
            <ZapOff className={`absolute h-4 w-4 transition-all ${isLowPower ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`} />

            {/* Visual indication of status */}
            {!isLowPower && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_var(--color-cyan)]" />
            )}
        </Button>
    );
}
