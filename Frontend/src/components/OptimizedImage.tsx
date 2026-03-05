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

    let srcSet: string | undefined = undefined;
    if (src && src.includes("cloudinary.com") && width) {
        const src1x = optimizedSrc;
        const src2x = getOptimizedImageUrl(src, {
            width: width * 2,
            height: height ? height * 2 : undefined,
            quality,
            crop,
            gravity
        });
        srcSet = `${src1x} 1x, ${src2x} 2x`;
    }

    return (
        <m.img
            src={optimizedSrc}
            srcSet={srcSet}
            alt={alt}
            loading="lazy"
            className={cn("bg-secondary/20 flex shrink-0", className)}
            {...props}
        />
    );
}
