import { useEffect, useState } from "react";
import { m } from "framer-motion";

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        // Only enable custom cursor on devices with fine pointer (not touchscreens)
        const checkDesktop = () => {
            setIsDesktop(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
        };

        checkDesktop();
        window.addEventListener("resize", checkDesktop);

        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        if (isDesktop) {
            window.addEventListener("mousemove", updateMousePosition);
        }

        return () => {
            window.removeEventListener("resize", checkDesktop);
            window.removeEventListener("mousemove", updateMousePosition);
        };
    }, [isDesktop]);

    if (!isDesktop) return null;

    return (
        <m.div
            className="fixed top-0 left-0 w-3 h-3 bg-cyan-400 rounded-full pointer-events-none z-[9999] mix-blend-screen shadow-[0_0_15px_#22d3ee]"
            animate={{
                x: mousePosition.x - 6,
                y: mousePosition.y - 6,
            }}
            transition={{
                type: "spring",
                stiffness: 1000,
                damping: 40,
                mass: 0.1,
            }}
        />
    );
}
