import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Basic CSS sanitizer to strip dangerous constructs like url(), @import, etc.
 */
export function sanitizeCss(css: string): string {
  if (!css) return "";

  return css
    // Strip url() - prevent external resource loading
    .replace(/url\s*\([^)]*\)/gi, "/* sanitized url */")
    // Strip @import - prevent external CSS inclusion
    .replace(/@import\s+[^;]+;/gi, "/* sanitized import */")
    // Strip expression() - prevent IE-style JS execution
    .replace(/expression\s*\([^)]*\)/gi, "/* sanitized expression */")
    // Strip -moz-binding - prevent Firefox-style XBL execution
    .replace(/-moz-binding\s*:[^;]+;/gi, "/* sanitized binding */")
    // Strip behavior - prevent IE-style behaviors
    .replace(/behavior\s*:[^;]+;/gi, "/* sanitized behavior */")
    // Strip javascript: in values
    .replace(/javascript\s*:[^;]+/gi, "/* sanitized javascript */");
}
