import * as React from "react"
import { cn } from "#src/lib/utils"

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ className, checked, onCheckedChange, ...props }, ref) => {
        return (
            <button
                type="button"
                role="switch"
                aria-checked={checked ?? false} data-state={checked ? "checked" : "unchecked"}
                className={cn(
                    "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    checked ? "bg-slate-900" : "bg-slate-200",
                    className
                )}
                onClick={() => onCheckedChange?.(!checked)}
                ref={ref}
                {...props}
            >
                <span
                    className={cn(
                        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
                        checked ? "translate-x-4" : "translate-x-0"
                    )}
                />
            </button>
        )
    }
)
Switch.displayName = "Switch"

export { Switch }
