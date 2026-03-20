import { useRef, ReactNode } from "react";
import { m, useInView } from "framer-motion";
import { EASE } from "@/lib/animation";

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    width?: "fit-content" | "100%";
}

export default function Reveal({ children, className = "", delay = 0, width = "100%" }: RevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <div ref={ref} className={className} style={{ width }}>
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{
                    duration: 0.8,
                    delay: delay,
                    ease: EASE.premium,
                }}
            >
                {children}
            </m.div>
        </div>
    );
}
