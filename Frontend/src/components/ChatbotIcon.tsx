import { SVGProps } from "react";

interface ChatbotIconProps extends SVGProps<SVGSVGElement> {
    innerColor?: string;
}

export function ChatbotIcon({ className, innerColor, ...props }: ChatbotIconProps) {
    return (
        <svg
            className={className}
            {...props}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="48" y="15" width="4" height="10" fill="currentColor" />
            <circle cx="50" cy="15" r="6" fill="currentColor" />

            <rect x="18" y="45" width="8" height="25" rx="4" fill="currentColor" />
            <rect x="74" y="45" width="8" height="25" rx="4" fill="currentColor" />

            <path d="M30 30H70C75.5228 30 80 34.4772 80 40V70C80 75.5228 75.5228 80 70 80H45L35 88V80H30C24.4772 80 20 75.5228 20 70V40C20 34.4772 24.4772 30 30 30Z" fill="currentColor" />

            {/* Inner parts (eyes and mouth) - use provided color or fall back to page background */}
            <rect x="40" y="48" width="4" height="10" rx="2" fill={innerColor || "hsl(var(--background))"} />
            <rect x="56" y="48" width="4" height="10" rx="2" fill={innerColor || "hsl(var(--background))"} />

            <path d="M42 65C42 65 45 70 50 70C55 70 58 65 58 65" stroke={innerColor || "hsl(var(--background))"} strokeWidth="4" strokeLinecap="round" />
        </svg>
    );
}
