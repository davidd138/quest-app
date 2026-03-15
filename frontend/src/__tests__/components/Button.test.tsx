import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button';
import { Plus, ArrowRight } from 'lucide-react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        const Component = React.forwardRef(
          (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
            const { children, className, onClick, style, disabled, type, ...rest } = props;
            void rest;
            return React.createElement(
              prop,
              { ref, className, onClick, style, disabled, type, 'data-testid': props['data-testid'] },
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

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles onClick', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading spinner and disables button when loading', () => {
    const { container } = render(<Button loading>Submit</Button>);
    // Loader2 renders an svg with the animate-spin class
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    // Button should be disabled
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
    fireEvent.click(button!);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies disabled styling classes', () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('opacity-50');
    expect(button?.className).toContain('cursor-not-allowed');
  });

  it('renders left icon', () => {
    const { container } = render(<Button leftIcon={Plus}>Add</Button>);
    // Plus icon renders as an SVG
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders right icon', () => {
    const { container } = render(<Button rightIcon={ArrowRight}>Next</Button>);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render right icon when loading', () => {
    const { container } = render(
      <Button loading rightIcon={ArrowRight}>
        Next
      </Button>,
    );
    // Should only have the spinner SVG, not the ArrowRight
    const svgs = container.querySelectorAll('svg');
    // The spinner (Loader2) should be present
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    // Just one SVG for the spinner
    expect(svgs.length).toBe(1);
  });

  it('applies primary variant classes by default', () => {
    const { container } = render(<Button>Primary</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('from-violet-600');
    expect(button?.className).toContain('to-violet-500');
  });

  it('applies danger variant classes', () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('from-rose-600');
    expect(button?.className).toContain('to-rose-500');
  });

  it('applies fullWidth class when fullWidth is true', () => {
    const { container } = render(<Button fullWidth>Full</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('w-full');
  });
});
