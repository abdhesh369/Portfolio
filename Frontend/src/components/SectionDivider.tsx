import { m } from "framer-motion";

/**
 * Glowing gradient divider placed between sections to break visual monotony.
 */
export default function SectionDivider() {
    return (
        <m.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative py-2"
        >
            <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            <div className="absolute inset-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-sm top-1/2" />
        </m.div>
    );
}
