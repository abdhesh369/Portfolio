import { m } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface SectionHeadingProps {
    badge: string;
    badgeIcon?: LucideIcon;
    title: string;
    highlight?: string;
    subtitle?: string;
    /** Accent color for badge and gradient. Defaults to cyan. */
    color?: "cyan" | "purple" | "emerald" | "pink";
}

const colorMap = {
    cyan: {
        badge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
        gradient: "from-cyan-400 via-blue-500 to-purple-500",
    },
    purple: {
        badge: "bg-purple-500/10 border-purple-500/30 text-purple-400",
        gradient: "from-purple-400 via-violet-500 to-fuchsia-500",
    },
    emerald: {
        badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        gradient: "from-emerald-300 via-green-400 to-emerald-500",
    },
    pink: {
        badge: "bg-pink-500/10 border-pink-500/30 text-pink-400",
        gradient: "from-pink-400 via-rose-500 to-red-500",
    },
};

/**
 * Consistent section heading used across all portfolio sections.
 * Renders a badge pill, gradient title, and optional subtitle.
 */
export default function SectionHeading({
    badge,
    badgeIcon: BadgeIcon,
    title,
    highlight,
    subtitle,
    color = "cyan",
}: SectionHeadingProps) {
    const colors = colorMap[color];

    return (
        <div className="text-center mb-12 md:mb-16">
            <m.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-5 ${colors.badge}`}
            >
                {BadgeIcon && <BadgeIcon className="w-4 h-4" />}
                {badge}
            </m.div>

            <m.h2
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-4"
            >
                {highlight ? (
                    <>
                        <span className="text-white">{title} </span>
                        <span
                            className={`text-transparent bg-clip-text bg-gradient-to-r ${colors.gradient} animate-gradient-x`}
                            style={{ backgroundSize: "200% 200%" }}
                        >
                            {highlight}
                        </span>
                    </>
                ) : (
                    <span
                        className={`text-transparent bg-clip-text bg-gradient-to-r ${colors.gradient} animate-gradient-x`}
                        style={{ backgroundSize: "200% 200%" }}
                    >
                        {title}
                    </span>
                )}
            </m.h2>

            {subtitle && (
                <m.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg"
                >
                    {subtitle}
                </m.p>
            )}
        </div>
    );
}
