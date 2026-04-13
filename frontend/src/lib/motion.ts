// Shared Framer Motion animation variants — cinematic Vezor-style feel
import type { Variants } from 'framer-motion';

export const EASE        = [0.25, 0.46, 0.45, 0.94] as const;
export const SPRING      = [0.34, 1.56, 0.64, 1]    as const;
export const CINEMA_EASE = [0.22, 1,    0.36, 1]    as const;

export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const viewport = { once: true, margin: '-80px' } as const;
export const viewportReveal = { once: true, margin: '-100px' } as const;

// Returns no-op variants when reduced motion is preferred
function v(variants: Variants): Variants {
  return prefersReducedMotion ? { hidden: {}, visible: {} } : variants;
}

// Use this everywhere instead of bare variant objects
export function getVariant<T extends object>(variant: T): T | Variants {
  return prefersReducedMotion ? { hidden: {}, visible: {} } as Variants : variant;
}

// ── Cinematic "wipe up" reveal — use on all scroll-triggered sections ──────
export const revealVariant: Variants = v({
  hidden:  { opacity: 0, y: 48, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.65, ease: CINEMA_EASE },
  },
});

// ── Standard variants ───────────────────────────────────────────────────────
export const fadeUp: Variants = v({
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
});

export const fadeIn: Variants = v({
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
});

// stagger = delay between each child; cap at 0.06 for grids > 8 items
export const staggerContainer = (stagger = 0.1, delay = 0.05): Variants =>
  (prefersReducedMotion ? { hidden: {}, visible: {} } : {
    hidden:  {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }) as Variants;

export const slideLeft: Variants = v({
  hidden:  { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
});

export const slideRight: Variants = v({
  hidden:  { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
});

export const scaleIn: Variants = v({
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: SPRING } },
});

export const lineReveal: Variants = v({
  hidden:  { scaleX: 0, originX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: EASE, delay: 0.3 } },
});
