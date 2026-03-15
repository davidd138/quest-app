import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Tooltip from '@/components/ui/Tooltip';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        const Component = React.forwardRef(
          (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
            const { children, className, onClick, style, id, role, ...rest } = props;
            void rest;
            return React.createElement(
              prop,
              { ref, className, onClick, style, id, role, 'data-testid': props['data-testid'] },
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

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('does not show tooltip by default', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on hover after delay', () => {
    render(
      <Tooltip content="Helpful info" delay={200}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const wrapper = screen.getByText('Hover me').closest('span')?.parentElement;
    expect(wrapper).toBeInTheDocument();

    // Hover
    fireEvent.mouseEnter(wrapper!);

    // Not visible yet (before delay)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Advance past delay
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Helpful info')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Disappearing" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const wrapper = screen.getByText('Hover me').closest('span')?.parentElement;

    // Show tooltip
    fireEvent.mouseEnter(wrapper!);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Leave
    fireEvent.mouseLeave(wrapper!);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Focus content" delay={100}>
        <button>Focus me</button>
      </Tooltip>,
    );

    const wrapper = screen.getByText('Focus me').closest('span')?.parentElement;
    fireEvent.focus(wrapper!);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Blur test" delay={0}>
        <button>Focus me</button>
      </Tooltip>,
    );

    const wrapper = screen.getByText('Focus me').closest('span')?.parentElement;

    fireEvent.focus(wrapper!);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(wrapper!);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('displays tooltip content correctly', () => {
    render(
      <Tooltip content="Custom tooltip message" delay={0}>
        <span>Trigger</span>
      </Tooltip>,
    );

    const wrapper = screen.getByText('Trigger').closest('span')?.parentElement;
    fireEvent.mouseEnter(wrapper!);

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByText('Custom tooltip message')).toBeInTheDocument();
  });

  it('position top applies correct classes', () => {
    render(
      <Tooltip content="Top tooltip" position="top" delay={0}>
        <span>Trigger</span>
      </Tooltip>,
    );

    const wrapper = screen.getByText('Trigger').closest('span')?.parentElement;
    fireEvent.mouseEnter(wrapper!);
    act(() => {
      vi.advanceTimersByTime(50);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('bottom-full');
  });

  it('position bottom applies correct classes', () => {
    render(
      <Tooltip content="Bottom tooltip" position="bottom" delay={0}>
        <span>Trigger</span>
      </Tooltip>,
    );

    const wrapper = screen.getByText('Trigger').closest('span')?.parentElement;
    fireEvent.mouseEnter(wrapper!);
    act(() => {
      vi.advanceTimersByTime(50);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('top-full');
  });

  it('position left applies correct classes', () => {
    render(
      <Tooltip content="Left tooltip" position="left" delay={0}>
        <span>Trigger</span>
      </Tooltip>,
    );

    const wrapper = screen.getByText('Trigger').closest('span')?.parentElement;
    fireEvent.mouseEnter(wrapper!);
    act(() => {
      vi.advanceTimersByTime(50);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('right-full');
  });

  it('position right applies correct classes', () => {
    render(
      <Tooltip content="Right tooltip" position="right" delay={0}>
        <span>Trigger</span>
      </Tooltip>,
    );

    const wrapper = screen.getByText('Trigger').closest('span')?.parentElement;
    fireEvent.mouseEnter(wrapper!);
    act(() => {
      vi.advanceTimersByTime(50);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('left-full');
  });

  it('uses default 300ms delay', () => {
    render(
      <Tooltip content="Default delay">
        <span>Trigger</span>
      </Tooltip>,
    );

    const wrapper = screen.getByText('Trigger').closest('span')?.parentElement;
    fireEvent.mouseEnter(wrapper!);

    // At 200ms, tooltip should not be visible
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // At 350ms, tooltip should be visible
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('cancels show timer if mouse leaves before delay', () => {
    render(
      <Tooltip content="Cancelled" delay={300}>
        <span>Trigger</span>
      </Tooltip>,
    );

    const wrapper = screen.getByText('Trigger').closest('span')?.parentElement;
    fireEvent.mouseEnter(wrapper!);

    // Leave before delay elapses
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.mouseLeave(wrapper!);

    // Advance past original delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
