import { useState, useEffect } from "react";

/**
 * Scroll-spy hook that returns the ID of the section currently in view.
 * Observes sections by their element IDs using IntersectionObserver.
 */
export function useScrollSpy(sectionIds: string[], offset = 100): string | null {
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // Find the entry that is most visible
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible.length > 0) {
                    setActiveId(visible[0].target.id);
                }
            },
            {
                rootMargin: `-${offset}px 0px -40% 0px`,
                threshold: [0, 0.25, 0.5],
            }
        );

        const elements = sectionIds
            .map((id) => document.getElementById(id))
            .filter(Boolean) as HTMLElement[];

        elements.forEach((el) => observer.observe(el));

        return () => {
            elements.forEach((el) => observer.unobserve(el));
        };
    }, [sectionIds, offset]);

    return activeId;
}
