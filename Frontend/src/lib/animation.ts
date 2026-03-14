/**
 * Global Animation Token System
 *
 * Centralised Framer Motion animation tokens used across all components.
 * Keeps durations, easings, springs, and preset variants in one place so
 * the design language stays consistent and `prefers-reduced-motion` can be
 * honoured with a single boolean toggle.
 *
 * Usage:
 *   import { fadeUp, hoverScale, duration, withReducedMotion } from "@/lib/animation";
 *   const { reducedMotion } = useTheme();
 *   <motion.div {...withReducedMotion(fadeUp, reducedMotion)} />
 */

import type { Transition, Variant, Variants } from "framer-motion";

// ─── Durations (seconds) ────────────────────────────────────────────────────
export const DURATION = {
  instant: 0.15,
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  slower: 1.0,
} as const;

// ─── Easings ────────────────────────────────────────────────────────────────
export const EASE = {
  easeOut: "easeOut" as const,
  easeInOut: "easeInOut" as const,
  linear: "linear" as const,
  /** Smooth deceleration cubic-bezier used for stagger children */
  smooth: [0.22, 1, 0.36, 1] as [number, number, number, number],
  /** Premium "snappy" easing for modern UI feel */
  premium: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** Dramatic reveal easing */
  reveal: [0.23, 1, 0.32, 1] as [number, number, number, number],
} as const;

// ─── Spring Presets ─────────────────────────────────────────────────────────
export const SPRING = {
  bouncy: { type: "spring" as const, damping: 12 },
  snappy: { type: "spring" as const, damping: 20, stiffness: 300 },
  stiff: { type: "spring" as const, stiffness: 200 },
  gentle: { type: "spring" as const, damping: 15 },
} as const;

// ─── Stagger Intervals ─────────────────────────────────────────────────────
export const STAGGER = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
} as const;

// ─── Helper: ReducedMotion ──────────────────────────────────────────────────

/** Strip motion from a preset when the user prefers reduced motion. */
export function withReducedMotion<
  T extends { initial?: unknown; animate?: unknown; transition?: Transition },
>(preset: T, reduced: boolean): T {
  if (!reduced) return preset;
  return {
    ...preset,
    initial: undefined,
    animate: undefined,
    transition: { duration: 0 },
  } as T;
}


// ─── Entrance Presets ───────────────────────────────────────────────────────

/** Fade up — the dominant entrance animation (y: 20 → 0). ~25+ usages. */
export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.normal } as Transition,
};

/** Fade up with larger travel distance (y: 30 → 0). */
export const fadeUpLarge = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.normal } as Transition,
};

/** Fade down (heading entrances — y: -20 → 0). */
export const fadeDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.normal } as Transition,
};

/** Slide in from the left (x: -20 → 0). */
export const fadeLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: DURATION.normal } as Transition,
};

/** Slide in from the right (x: 20 → 0). */
export const fadeRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: DURATION.normal } as Transition,
};

/** Pure opacity fade. */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: DURATION.normal } as Transition,
};

/** Scale in from 0.8 — cards, images. */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: DURATION.normal } as Transition,
};

/** Subtle scale in from 0.9 — hero images, profile cards. */
export const scaleInSubtle = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: DURATION.slow, delay: 0.2 } as Transition,
};

/** Page-level route transition (small scale + y offset). */
export const pageTransition = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
  transition: {
    duration: DURATION.fast,
    ease: EASE.premium,
  },
};

// ─── Expand / Collapse ──────────────────────────────────────────────────────

export const expand = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: { duration: DURATION.fast } as Transition,
};

// ─── Hover Presets ──────────────────────────────────────────────────────────

/** Standard button hover/tap — scale 1.05 / 0.95. */
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

/** Card hover — subtle scale + lift. */
export const hoverCardLift = {
  whileHover: { scale: 1.02, y: -5 },
};

/** Card hover — lift only, no scale. */
export const hoverLift = {
  whileHover: { y: -8 },
};

/** Subtle lift for smaller elements. */
export const hoverLiftSmall = {
  whileHover: { y: -4, transition: { duration: DURATION.instant } },
};

// ─── Infinite / Background ──────────────────────────────────────────────────

/** Soft opacity pulse. */
export const pulse = {
  animate: { opacity: [0.5, 1, 0.5] },
  transition: { duration: 2, repeat: Infinity } as Transition,
};

/** Gentle vertical bob (y: ±5). */
export const bobble = {
  animate: { y: [0, -5, 0] },
  transition: { duration: 2, repeat: Infinity } as Transition,
};

/** Base float transition — pair with custom animate values. */
export const floatTransition = {
  duration: 6,
  repeat: Infinity,
  ease: EASE.easeInOut,
} as Transition;

/** Scale-X reveal (horizontal rule / divider). */
export const scaleXReveal = {
  initial: { scaleX: 0 },
  animate: { scaleX: 1 },
  transition: { delay: 0.2 } as Transition,
};

// ─── Stagger Variants ───────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: {
      staggerChildren: STAGGER.normal,
      delayChildren: i * STAGGER.normal,
    },
  }),
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.normal,
      ease: EASE.premium,
    },
  },
};


export const staggerChildScale: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

// ─── Interactive Utilities ──────────────────────────────────────────────────

/** Magnetic effect variants for interactive elements */
export const magneticTransition = {
  type: "spring",
  stiffness: 150,
  damping: 15,
  mass: 0.1,
};

export const textReveal: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: EASE.reveal,
    },
  },
};
