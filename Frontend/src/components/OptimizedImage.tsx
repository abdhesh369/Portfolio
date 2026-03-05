import { m, HTMLMotionProps } from "framer-motion";
import { getOptimizedImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends HTMLMotionProps<"img"> {
    width?: number;
    height?: number;
    quality?: string | number;
    crop?: string;
    gravity?: string;
}

/**
 * Reusable image component with automatic Cloudinary optimization.
 * Supports framer-motion props for animations.
 * Falls back to standard img behavior for non-Cloudinary URLs.
 */
export function OptimizedImage({
    src,
    width,
    height,
    quality,
    crop,
    gravity,
    alt,
    className,
    ...props
}: OptimizedImageProps) {
    const optimizedSrc = src ? getOptimizedImageUrl(src, { width, height, quality, crop, gravity }) : src;

    return (
        <m.img
            src={optimizedSrc}
            alt={alt}
            loading="lazy"
            className={cn("bg-secondary/20 flex shrink-0", className)}
            {...props}
        />
    );
}
