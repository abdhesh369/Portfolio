import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollStore } from "@/hooks/use-scroll-store";

export default function BackToTop() {
    const { scrollY } = useScrollStore();
    const isVisible = scrollY > 500;

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <m.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="fixed bottom-8 right-8 z-[100]"
                >
                    <Button
                        onClick={scrollToTop}
                        size="icon"
                        className="w-12 h-12 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all group overflow-hidden"
                        aria-label="Back to Top"
                    >
                        <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300" />

                        {/* Holographic background effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />

                        {/* Scanline */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none animate-scan h-[200%]" style={{ backgroundSize: '100% 3px' }} />
                    </Button>
                </m.div>
            )}
        </AnimatePresence>
    );
}
