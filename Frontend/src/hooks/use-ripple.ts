import { useCallback, type MouseEvent } from "react";

/**
 * Returns an onClick handler that injects a `.ripple-effect` span
 * at the click coordinates inside the target element.
 * The span auto-removes after the 700ms animation completes.
 */
export function useRipple() {
    return useCallback((e: MouseEvent<HTMLElement>) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement("span");
        ripple.className = "ripple-effect";
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        target.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
    }, []);
}
