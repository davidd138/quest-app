'use client';

import { useState, useEffect } from 'react';

/**
 * Hook that detects user preference for reduced motion via the
 * `prefers-reduced-motion` media query (WCAG 2.1 AA, criterion 2.3.3).
 *
 * Returns `true` when the user prefers reduced motion, `false` otherwise.
 * Listens for changes in real time so the UI adapts if the user toggles
 * the OS-level setting while the app is open.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mql.addEventListener('change', handler);
    // Sync in case the value changed between SSR and hydration
    setPrefersReducedMotion(mql.matches);

    return () => {
      mql.removeEventListener('change', handler);
    };
  }, []);

  return prefersReducedMotion;
}
