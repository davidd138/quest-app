import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

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
  AnimatePresence: ({ children, mode }: { children: React.ReactNode; mode?: string }) =>
    React.createElement(React.Fragment, null, children),
}));

import CountdownTimer from '@/components/quest/CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders days, hours, minutes, seconds', () => {
    // Target: 3 days, 5 hours, 30 minutes, 15 seconds from now
    const target = new Date('2026-03-18T17:30:15Z');
    render(<CountdownTimer targetDate={target} />);

    expect(screen.getByText('03')).toBeInTheDocument(); // days
    expect(screen.getByText('05')).toBeInTheDocument(); // hours
    expect(screen.getByText('30')).toBeInTheDocument(); // minutes
    expect(screen.getByText('15')).toBeInTheDocument(); // seconds

    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Minutes')).toBeInTheDocument();
    expect(screen.getByText('Seconds')).toBeInTheDocument();
  });

  it('updates every second', () => {
    const target = new Date('2026-03-15T12:00:10Z'); // 10 seconds away
    render(<CountdownTimer targetDate={target} />);

    expect(screen.getByText('10')).toBeInTheDocument();

    // Advance 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('09')).toBeInTheDocument();

    // Advance 3 more seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText('06')).toBeInTheDocument();
  });

  it('shows completion state when event is over', () => {
    const onComplete = vi.fn();
    // Target already in the past
    const target = new Date('2026-03-15T11:00:00Z');
    render(<CountdownTimer targetDate={target} onComplete={onComplete} />);

    expect(screen.getByText('Event Started!')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete when countdown reaches zero', () => {
    const onComplete = vi.fn();
    const target = new Date('2026-03-15T12:00:03Z'); // 3 seconds from now
    render(<CountdownTimer targetDate={target} onComplete={onComplete} />);

    expect(onComplete).not.toHaveBeenCalled();

    // Advance past the target
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Event Started!')).toBeInTheDocument();
  });

  it('shows correct urgency color based on time remaining', () => {
    // More than 72 hours: green/emerald
    const farTarget = new Date('2026-03-20T12:00:00Z'); // 5 days
    const { container, unmount } = render(<CountdownTimer targetDate={farTarget} />);
    expect(screen.getByText('Plenty of time')).toBeInTheDocument();
    unmount();

    // Less than 6 hours: red/hurry
    vi.setSystemTime(new Date('2026-03-15T12:00:00Z'));
    const nearTarget = new Date('2026-03-15T15:00:00Z'); // 3 hours
    render(<CountdownTimer targetDate={nearTarget} />);
    expect(screen.getByText('Hurry up!')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    const target = new Date('2026-03-20T12:00:00Z');
    render(<CountdownTimer targetDate={target} label="Quest deadline" />);
    expect(screen.getByText('Quest deadline')).toBeInTheDocument();
  });
});
