import { m, AnimatePresence } from "framer-motion";
import { useVisitorCount } from "@/hooks/use-visitor-count";
import { Users } from "lucide-react";

export function LiveVisitorCount() {
    const count = useVisitorCount();

    if (count <= 0) return null;

    return (
        <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 backdrop-blur-sm rounded-full text-xs font-medium text-primary shadow-sm shadow-primary/5"
        >
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <Users className="w-3 h-3" />
            <AnimatePresence mode="wait">
                <m.span
                    key={count}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                >
                    {count} {count === 1 ? 'person' : 'people'} currently viewing
                </m.span>
            </AnimatePresence>
        </m.div>
    );
}
