import { useState, useEffect } from "react";

export type ScrollData = {
    scrollY: number;
    scrollDirection: "up" | "down";
    progress: number;
};

class ScrollStore {
    private listeners = new Set<(data: ScrollData) => void>();
    private scrollY = 0;
    private lastScrollY = 0;
    private scrollDirection: "up" | "down" = "down";
    private progress = 0;
    private ticking = false;

    constructor() {
        if (typeof window !== "undefined") {
            window.addEventListener("scroll", this.onScroll, { passive: true });
            // Initial value
            this.scrollY = window.scrollY;
            this.lastScrollY = window.scrollY;
        }
    }

    private onScroll = () => {
        if (!this.ticking) {
            requestAnimationFrame(this.update);
            this.ticking = true;
        }
    };

    private update = () => {
        const currentY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        // Smooth out direction changes if they are jittery at the very top/bottom
        if (Math.abs(currentY - this.lastScrollY) > 5) {
            this.scrollDirection = currentY > this.lastScrollY ? "down" : "up";
        }

        this.scrollY = currentY;
        this.progress = docHeight > 0 ? Math.min((currentY / docHeight) * 100, 100) : 0;
        this.lastScrollY = currentY;

        const data: ScrollData = {
            scrollY: this.scrollY,
            scrollDirection: this.scrollDirection,
            progress: this.progress,
        };

        this.listeners.forEach((l) => l(data));
        this.ticking = false;
    };

    subscribe(listener: (data: ScrollData) => void) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    getData(): ScrollData {
        return {
            scrollY: this.scrollY,
            scrollDirection: this.scrollDirection,
            progress: this.progress,
        };
    }
}

// Singleton instance
const scrollStore = new ScrollStore();

/**
 * Hook to access shared scroll data with a single window listener.
 * Highly performant as it uses requestAnimationFrame and shares the listener.
 */
export function useScrollStore() {
    const [data, setData] = useState<ScrollData>(scrollStore.getData());

    useEffect(() => {
        return scrollStore.subscribe(setData);
    }, []);

    return data;
}
