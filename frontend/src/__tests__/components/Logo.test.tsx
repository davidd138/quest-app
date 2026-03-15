import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from '@/components/layout/Logo';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        const Component = React.forwardRef(
          (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
            const { children, className, onClick, style, ...rest } = props;
            void rest;
            return React.createElement(
              prop,
              { ref, className, onClick, style, 'data-testid': props['data-testid'] },
              children as React.ReactNode,
            );
          },
        );
        Component.displayName = `motion.${prop}`;
        return Component;
      },
    },
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => React.createElement('a', { href, ...props }, children),
}));

describe('Logo', () => {
  it('renders SVG compass icon', () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 120 120');
  });

  it('renders "QuestMaster" text at default (md) size', () => {
    render(<Logo />);
    expect(screen.getByText('Quest')).toBeInTheDocument();
    expect(screen.getByText('Master')).toBeInTheDocument();
  });

  it('hides text at sm size', () => {
    render(<Logo size="sm" />);
    expect(screen.queryByText('Quest')).not.toBeInTheDocument();
    expect(screen.queryByText('Master')).not.toBeInTheDocument();
  });

  it('shows text at md size', () => {
    render(<Logo size="md" />);
    expect(screen.getByText('Quest')).toBeInTheDocument();
    expect(screen.getByText('Master')).toBeInTheDocument();
  });

  it('shows text at lg size', () => {
    render(<Logo size="lg" />);
    expect(screen.getByText('Quest')).toBeInTheDocument();
    expect(screen.getByText('Master')).toBeInTheDocument();
  });

  it('applies correct icon size class for sm', () => {
    const { container } = render(<Logo size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('w-8');
    expect(svg?.getAttribute('class')).toContain('h-8');
  });

  it('applies correct icon size class for lg', () => {
    const { container } = render(<Logo size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('w-16');
    expect(svg?.getAttribute('class')).toContain('h-16');
  });

  it('wraps content in a Link when linkTo is provided', () => {
    const { container } = render(<Logo linkTo="/dashboard" />);
    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('does not wrap content in a Link when linkTo is not provided', () => {
    const { container } = render(<Logo />);
    const link = container.querySelector('a');
    expect(link).not.toBeInTheDocument();
  });

  it('applies dark text class when dark prop is true', () => {
    render(<Logo dark />);
    const questText = screen.getByText('Quest');
    const parentSpan = questText.closest('span');
    expect(parentSpan?.className).toContain('text-navy-900');
  });
});
