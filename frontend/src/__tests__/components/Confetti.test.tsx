import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Confetti from '@/components/ui/Confetti';

// We need to control useReducedMotion per test
const mockUseReducedMotion = vi.fn();
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}));

// Mock requestAnimationFrame / cancelAnimationFrame
const mockRaf = vi.fn(() => 1);
const mockCaf = vi.fn();

// Mock canvas getContext
const mockGetContext = vi.fn(() => ({
  scale: vi.fn(),
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  fillRect: vi.fn(),
  fillStyle: '',
  globalAlpha: 1,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseReducedMotion.mockReturnValue(false);
  vi.stubGlobal('requestAnimationFrame', mockRaf);
  vi.stubGlobal('cancelAnimationFrame', mockCaf);
  vi.stubGlobal('devicePixelRatio', 1);
  // Patch HTMLCanvasElement.prototype.getContext for jsdom
  HTMLCanvasElement.prototype.getContext = mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Confetti', () => {
  it('creates a canvas element when active', () => {
    const { container } = render(<Confetti active={true} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders container with aria-hidden true', () => {
    const { container } = render(<Confetti active={true} />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true');
  });

  it('does not render canvas when active is false and reduced motion is preferred', () => {
    mockUseReducedMotion.mockReturnValue(true);
    const { container } = render(<Confetti active={false} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeNull();
  });

  it('returns null when reduced motion is preferred', () => {
    mockUseReducedMotion.mockReturnValue(true);
    const { container } = render(<Confetti active={true} />);
    // The component should return null entirely
    expect(container.firstElementChild).toBeNull();
  });

  it('applies fixed positioning and pointer-events-none', () => {
    const { container } = render(<Confetti active={true} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper?.className).toContain('fixed');
    expect(wrapper?.className).toContain('inset-0');
    expect(wrapper?.className).toContain('pointer-events-none');
  });

  it('applies custom className', () => {
    const { container } = render(<Confetti active={true} className="my-custom" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper?.className).toContain('my-custom');
  });

  it('calls requestAnimationFrame when active and motion not reduced', () => {
    render(<Confetti active={true} />);
    // The component should start animation via rAF
    expect(mockRaf).toHaveBeenCalled();
  });

  it('does not call requestAnimationFrame when reduced motion is preferred', () => {
    mockUseReducedMotion.mockReturnValue(true);
    render(<Confetti active={true} />);
    expect(mockRaf).not.toHaveBeenCalled();
  });
});
