import type { Variants, Transition } from 'framer-motion';

// ---------------------------------------------------------------------------
// Core animation variants
// ---------------------------------------------------------------------------

/** Simple fade in / out. */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Slide up with fade. */
export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/** Slide down with fade. */
export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

/** Slide in from left with fade. */
export const slideLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

/** Slide in from right with fade. */
export const slideRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
};

/** Scale in from slightly smaller with fade. */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
};

// ---------------------------------------------------------------------------
// Stagger variants (parent + child)
// ---------------------------------------------------------------------------

/** Stagger container — wrap children using `staggerItem`. */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

/** Child item for stagger animations. */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

// ---------------------------------------------------------------------------
// Page transitions
// ---------------------------------------------------------------------------

/** Horizontal page transition (ideal for route changes). */
export const pageTransition: Variants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

// ---------------------------------------------------------------------------
// Playful / decorative
// ---------------------------------------------------------------------------

/** Spring-based pop into view. */
export const popIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

/** Horizontal shake — use `animate="animate"` to trigger. */
export const shake: Variants = {
  animate: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.5 },
  },
};

/** Infinite gentle pulse (scale). */
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 2 },
  },
};

/** Bounce-in with overshoot and settle. */
export const bounceIn: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: [0, 1.2, 0.9, 1],
    transition: { duration: 0.6 },
  },
};

// ---------------------------------------------------------------------------
// Reduced-motion helper
// ---------------------------------------------------------------------------

/**
 * Wraps any `Variants` object so that every variant resolves to its final
 * values with `transition: { duration: 0 }`, effectively disabling animation
 * while keeping layout correct.
 *
 * @example
 * const variants = prefersReducedMotion ? withReducedMotion(slideUp) : slideUp;
 */
export function withReducedMotion<T extends Variants>(variants: T): T {
  const reduced = {} as Record<string, unknown>;

  for (const [key, variant] of Object.entries(variants)) {
    if (typeof variant === 'object' && variant !== null) {
      // Strip spring/transition config and replace with instant
      const { transition: _t, ...rest } = variant as Record<string, unknown>;
      reduced[key] = { ...rest, transition: { duration: 0 } as Transition };
    } else {
      reduced[key] = variant;
    }
  }

  return reduced as T;
}

// ---------------------------------------------------------------------------
// Transition presets
// ---------------------------------------------------------------------------

export const transitions = {
  /** Snappy ease-out for UI elements. */
  fast: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } satisfies Transition,
  /** Default ease for most animations. */
  default: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } satisfies Transition,
  /** Slower ease for page transitions. */
  slow: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } satisfies Transition,
  /** Bouncy spring for playful elements. */
  spring: { type: 'spring', stiffness: 400, damping: 25 } satisfies Transition,
  /** Gentle spring for larger elements. */
  gentleSpring: { type: 'spring', stiffness: 200, damping: 20 } satisfies Transition,
} as const;
