'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ---------------------------------------------------------------------------
// Easing
// ---------------------------------------------------------------------------

/** Deceleration curve (ease-out cubic). */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AnimatedNumberProps {
  /** Target value to animate towards. */
  value: number;
  /** Animation duration in milliseconds. @default 1200 */
  duration?: number;
  /** String prepended to the displayed number (e.g. "$"). */
  prefix?: string;
  /** String appended to the displayed number (e.g. "XP"). */
  suffix?: string;
  /** Number of decimal places to render. @default 0 */
  decimals?: number;
  /** Additional class names. */
  className?: string;
  /** Locale for number formatting. @default navigator language or 'en' */
  locale?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  locale,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  const resolvedLocale = locale ?? (typeof navigator !== 'undefined' ? navigator.language : 'en');

  const format = useCallback(
    (n: number) => {
      return new Intl.NumberFormat(resolvedLocale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(n);
    },
    [resolvedLocale, decimals],
  );

  useEffect(() => {
    // Reduced motion — show final value instantly
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    fromRef.current = displayValue;
    startRef.current = null;

    const animate = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp;
      }

      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      const current = fromRef.current + (value - fromRef.current) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
    // We intentionally only re-run when `value` or `duration` changes.
    // `displayValue` is read via ref to avoid retriggering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, prefersReducedMotion]);

  return (
    <span className={className} aria-label={`${prefix}${format(value)}${suffix}`}>
      {prefix}
      {format(displayValue)}
      {suffix}
    </span>
  );
};

export default AnimatedNumber;
