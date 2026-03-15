import { describe, it, expect } from 'vitest';
import {
  fadeIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  staggerContainer,
  staggerItem,
  pageTransition,
  popIn,
  shake,
  pulse,
  bounceIn,
  withReducedMotion,
  transitions,
} from '@/lib/animations';
import type { Variants } from 'framer-motion';

// ---------------------------------------------------------------------------
// Helper: assert a Variants object has expected keys
// ---------------------------------------------------------------------------

function expectVariantKeys(variants: Variants, keys: string[]) {
  for (const key of keys) {
    expect(variants).toHaveProperty(key);
    expect(variants[key]).toBeDefined();
  }
}

// ---------------------------------------------------------------------------
// Core variants
// ---------------------------------------------------------------------------

describe('Core animation variants', () => {
  it('fadeIn has initial, animate, and exit keys', () => {
    expectVariantKeys(fadeIn, ['initial', 'animate', 'exit']);
  });

  it('slideUp has initial and animate keys', () => {
    expectVariantKeys(slideUp, ['initial', 'animate']);
  });

  it('slideDown has initial and animate keys', () => {
    expectVariantKeys(slideDown, ['initial', 'animate']);
  });

  it('slideLeft has initial and animate keys', () => {
    expectVariantKeys(slideLeft, ['initial', 'animate']);
  });

  it('slideRight has initial and animate keys', () => {
    expectVariantKeys(slideRight, ['initial', 'animate']);
  });

  it('scaleIn has initial and animate keys', () => {
    expectVariantKeys(scaleIn, ['initial', 'animate']);
  });

  it('pageTransition has initial, animate, and exit keys', () => {
    expectVariantKeys(pageTransition, ['initial', 'animate', 'exit']);
  });

  it('popIn has initial and animate keys', () => {
    expectVariantKeys(popIn, ['initial', 'animate']);
  });

  it('bounceIn has initial and animate keys', () => {
    expectVariantKeys(bounceIn, ['initial', 'animate']);
  });

  it('shake has animate key', () => {
    expectVariantKeys(shake, ['animate']);
  });

  it('pulse has animate key', () => {
    expectVariantKeys(pulse, ['animate']);
  });
});

// ---------------------------------------------------------------------------
// Stagger variants
// ---------------------------------------------------------------------------

describe('Stagger variants', () => {
  it('staggerContainer has initial and animate keys', () => {
    expectVariantKeys(staggerContainer, ['initial', 'animate']);
  });

  it('staggerContainer.animate has staggerChildren', () => {
    const animate = staggerContainer.animate as Record<string, unknown>;
    const transition = animate.transition as Record<string, unknown>;
    expect(transition).toHaveProperty('staggerChildren');
    expect(typeof transition.staggerChildren).toBe('number');
    expect(transition.staggerChildren).toBeGreaterThan(0);
  });

  it('staggerItem has initial and animate keys', () => {
    expectVariantKeys(staggerItem, ['initial', 'animate']);
  });
});

// ---------------------------------------------------------------------------
// withReducedMotion
// ---------------------------------------------------------------------------

describe('withReducedMotion', () => {
  it('returns instant transitions (duration: 0) for all variant keys', () => {
    const reduced = withReducedMotion(slideUp);

    const initial = reduced.initial as Record<string, unknown>;
    const animate = reduced.animate as Record<string, unknown>;

    expect((initial.transition as Record<string, unknown>).duration).toBe(0);
    expect((animate.transition as Record<string, unknown>).duration).toBe(0);
  });

  it('preserves final values from the original variants', () => {
    const reduced = withReducedMotion(fadeIn);

    const initial = reduced.initial as Record<string, unknown>;
    const animate = reduced.animate as Record<string, unknown>;

    expect(initial.opacity).toBe(0);
    expect(animate.opacity).toBe(1);
  });

  it('handles variants with existing transitions', () => {
    const reduced = withReducedMotion(popIn);

    const animate = reduced.animate as Record<string, unknown>;
    // Should replace the spring transition with duration: 0
    expect((animate.transition as Record<string, unknown>).duration).toBe(0);
    // Should not have spring config
    expect((animate.transition as Record<string, unknown>).type).toBeUndefined();
  });

  it('works with variants that have exit key', () => {
    const reduced = withReducedMotion(pageTransition);

    const exit = reduced.exit as Record<string, unknown>;
    expect((exit.transition as Record<string, unknown>).duration).toBe(0);
    expect(exit.opacity).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Transition presets
// ---------------------------------------------------------------------------

describe('Transition presets', () => {
  it('fast has a duration value', () => {
    expect(transitions.fast).toHaveProperty('duration');
    expect(typeof transitions.fast.duration).toBe('number');
    expect(transitions.fast.duration).toBeGreaterThan(0);
  });

  it('default has a duration value', () => {
    expect(transitions.default).toHaveProperty('duration');
    expect(typeof transitions.default.duration).toBe('number');
    expect(transitions.default.duration).toBeGreaterThan(0);
  });

  it('slow has a duration value', () => {
    expect(transitions.slow).toHaveProperty('duration');
    expect(typeof transitions.slow.duration).toBe('number');
    expect(transitions.slow.duration).toBeGreaterThan(0);
  });

  it('fast is faster than default, default is faster than slow', () => {
    expect(transitions.fast.duration).toBeLessThan(transitions.default.duration);
    expect(transitions.default.duration).toBeLessThan(transitions.slow.duration);
  });

  it('spring preset has type spring', () => {
    expect(transitions.spring).toHaveProperty('type', 'spring');
    expect(transitions.spring).toHaveProperty('stiffness');
    expect(transitions.spring).toHaveProperty('damping');
  });

  it('gentleSpring preset has type spring', () => {
    expect(transitions.gentleSpring).toHaveProperty('type', 'spring');
    expect(transitions.gentleSpring).toHaveProperty('stiffness');
    expect(transitions.gentleSpring).toHaveProperty('damping');
  });

  it('gentleSpring is softer than spring (lower stiffness)', () => {
    expect(transitions.gentleSpring.stiffness).toBeLessThan(
      transitions.spring.stiffness,
    );
  });
});
