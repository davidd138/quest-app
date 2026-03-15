import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GradientText from '@/components/ui/GradientText';

describe('GradientText', () => {
  it('renders children text', () => {
    render(<GradientText>Hello World</GradientText>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('applies gradient className with bg-gradient-to-r and bg-clip-text', () => {
    render(<GradientText>Styled</GradientText>);
    const el = screen.getByText('Styled');
    expect(el.className).toContain('bg-gradient-to-r');
    expect(el.className).toContain('bg-clip-text');
    expect(el.className).toContain('text-transparent');
  });

  it('applies default violet-to-emerald preset gradient classes', () => {
    render(<GradientText>Default</GradientText>);
    const el = screen.getByText('Default');
    expect(el.className).toContain('from-violet-400');
    expect(el.className).toContain('to-emerald-400');
  });

  it('applies animation style when animated prop is true', () => {
    render(<GradientText animated>Animated</GradientText>);
    const el = screen.getByText('Animated');
    expect(el.style.animation).toContain('gradient-shift');
    expect(el.style.backgroundSize).toBe('200% 200%');
  });

  it('does not apply animation style when animated is false', () => {
    render(<GradientText>Static</GradientText>);
    const el = screen.getByText('Static');
    expect(el.style.animation).toBe('');
  });

  it('applies sunrise preset gradient classes', () => {
    render(<GradientText colors="sunrise">Sunrise</GradientText>);
    const el = screen.getByText('Sunrise');
    expect(el.className).toContain('from-amber-400');
    expect(el.className).toContain('to-rose-500');
  });

  it('applies ocean preset gradient classes', () => {
    render(<GradientText colors="ocean">Ocean</GradientText>);
    const el = screen.getByText('Ocean');
    expect(el.className).toContain('from-cyan-400');
    expect(el.className).toContain('to-indigo-500');
  });

  it('applies fire preset gradient classes', () => {
    render(<GradientText colors="fire">Fire</GradientText>);
    const el = screen.getByText('Fire');
    expect(el.className).toContain('from-yellow-400');
    expect(el.className).toContain('to-red-600');
  });

  it('accepts custom gradient classes string', () => {
    render(<GradientText colors="from-pink-400 to-blue-400">Custom</GradientText>);
    const el = screen.getByText('Custom');
    expect(el.className).toContain('from-pink-400');
    expect(el.className).toContain('to-blue-400');
  });

  it('applies additional className', () => {
    render(<GradientText className="text-4xl font-bold">Big</GradientText>);
    const el = screen.getByText('Big');
    expect(el.className).toContain('text-4xl');
    expect(el.className).toContain('font-bold');
  });
});
