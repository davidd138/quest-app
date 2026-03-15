import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

// Mock useReducedMotion to always prefer reduced motion so the final value
// is rendered immediately without waiting for rAF animation frames.
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}));

describe('AnimatedNumber', () => {
  it('renders the target number', () => {
    render(<AnimatedNumber value={1234} />);
    // With reduced motion, it should show the final value immediately.
    // The formatted value depends on locale; use aria-label which always has it.
    const el = screen.getByLabelText(/1,?234/);
    expect(el).toBeInTheDocument();
  });

  it('formats number with locale formatting', () => {
    render(<AnimatedNumber value={1000000} locale="en-US" />);
    const el = screen.getByLabelText('1,000,000');
    expect(el).toBeInTheDocument();
  });

  it('displays prefix', () => {
    render(<AnimatedNumber value={500} prefix="$" />);
    const el = screen.getByLabelText(/\$.*500/);
    expect(el).toBeInTheDocument();
    expect(el.textContent).toContain('$');
  });

  it('displays suffix', () => {
    render(<AnimatedNumber value={100} suffix=" XP" />);
    const el = screen.getByLabelText(/100.*XP/);
    expect(el).toBeInTheDocument();
    expect(el.textContent).toContain('XP');
  });

  it('displays prefix and suffix together', () => {
    render(<AnimatedNumber value={42} prefix="~" suffix=" pts" />);
    const el = screen.getByLabelText(/~42.*pts/);
    expect(el).toBeInTheDocument();
    expect(el.textContent).toContain('~');
    expect(el.textContent).toContain('pts');
  });

  it('renders custom decimal places', () => {
    render(<AnimatedNumber value={3.14159} decimals={2} locale="en-US" />);
    const el = screen.getByLabelText('3.14');
    expect(el).toBeInTheDocument();
  });

  it('renders zero decimals by default', () => {
    render(<AnimatedNumber value={99.7} locale="en-US" />);
    const el = screen.getByLabelText('100');
    expect(el).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<AnimatedNumber value={5} className="text-lg font-bold" />);
    const el = screen.getByLabelText('5');
    expect(el.className).toContain('text-lg');
    expect(el.className).toContain('font-bold');
  });
});
