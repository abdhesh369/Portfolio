import { useRef, ReactNode } from "react";
import { m, useInView } from "framer-motion";

interface SectionRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    width?: "fit-content" | "100%";
}

export default function SectionReveal({ children, className = "", delay = 0, width = "100%" }: SectionRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <div ref={ref} className={className} style={{ width, overflow: "hidden" }}>
            <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{
                    duration: 0.6,
                    delay: delay,
                    ease: [0.21, 0.47, 0.32, 0.98],
                }}
            >
                {children}
            </m.div>
        </div>
    );
}
