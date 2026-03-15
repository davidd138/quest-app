import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

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

import HintSystem from '@/components/quest/HintSystem';

const sampleHints = [
  { id: 'h1', text: 'Look around the corner', level: 'vague' as const },
  { id: 'h2', text: 'The key is behind the painting', level: 'moderate' as const },
  { id: 'h3', text: 'Use the golden key on the red door', level: 'direct' as const },
];

describe('HintSystem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders hint count correctly', () => {
    render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={1}
        scorePenaltyPerHint={10}
      />,
    );

    expect(screen.getByText('2 of 3 hints remaining')).toBeInTheDocument();
  });

  it('renders zero remaining when all hints used', () => {
    render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={3}
        scorePenaltyPerHint={10}
      />,
    );

    expect(screen.getByText('0 of 3 hints remaining')).toBeInTheDocument();
  });

  it('use hint button works and shows confirmation', () => {
    render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={0}
        scorePenaltyPerHint={10}
      />,
    );

    const useHintButton = screen.getByText('Use Hint (-10 pts)');
    expect(useHintButton).toBeInTheDocument();

    fireEvent.click(useHintButton);

    // Confirmation dialog should appear
    expect(screen.getByText('Use this hint?')).toBeInTheDocument();
  });

  it('confirmation dialog shows penalty info', () => {
    render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={0}
        scorePenaltyPerHint={15}
      />,
    );

    fireEvent.click(screen.getByText('Use Hint (-15 pts)'));

    expect(screen.getByText('-15 points')).toBeInTheDocument();
  });

  it('calls onUseHint when confirmed', () => {
    const onUseHint = vi.fn();
    render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={0}
        scorePenaltyPerHint={10}
        cooldownSeconds={0}
        onUseHint={onUseHint}
      />,
    );

    fireEvent.click(screen.getByText('Use Hint (-10 pts)'));
    fireEvent.click(screen.getByText('Use Hint', { exact: true }));

    expect(onUseHint).toHaveBeenCalledWith(0);
  });

  it('cancel confirmation hides dialog', () => {
    render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={0}
        scorePenaltyPerHint={10}
      />,
    );

    fireEvent.click(screen.getByText('Use Hint (-10 pts)'));
    expect(screen.getByText('Use this hint?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Use this hint?')).not.toBeInTheDocument();
  });

  it('shows revealed hint text after use', () => {
    render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={1}
        scorePenaltyPerHint={10}
      />,
    );

    // The revealed hint section should show
    expect(screen.getByText('Revealed hints (1)')).toBeInTheDocument();
  });

  it('disables button when no hints remaining', () => {
    render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={3}
        scorePenaltyPerHint={10}
      />,
    );

    const button = screen.getByText('No Hints Remaining');
    expect(button.closest('button')).toBeDisabled();
  });

  it('shows score penalty total when hints are used', () => {
    render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={2}
        scorePenaltyPerHint={10}
      />,
    );

    expect(screen.getByText('-20 pts penalty')).toBeInTheDocument();
  });

  it('does not show penalty when no hints used', () => {
    render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={0}
        scorePenaltyPerHint={10}
      />,
    );

    expect(screen.queryByText(/pts penalty/)).not.toBeInTheDocument();
  });

  it('shows penalty info footer', () => {
    render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={0}
        scorePenaltyPerHint={10}
      />,
    );

    expect(
      screen.getByText(/Each hint costs 10 points/),
    ).toBeInTheDocument();
  });

  it('shows cooldown after hint use', () => {
    const onUseHint = vi.fn();
    render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={0}
        scorePenaltyPerHint={10}
        cooldownSeconds={5}
        onUseHint={onUseHint}
      />,
    );

    // Use hint flow
    fireEvent.click(screen.getByText('Use Hint (-10 pts)'));
    fireEvent.click(screen.getByText('Use Hint', { exact: true }));

    // Cooldown should be active
    expect(screen.getByText('5s cooldown')).toBeInTheDocument();
  });

  it('cooldown counts down', () => {
    const onUseHint = vi.fn();
    render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={0}
        scorePenaltyPerHint={10}
        cooldownSeconds={5}
        onUseHint={onUseHint}
      />,
    );

    fireEvent.click(screen.getByText('Use Hint (-10 pts)'));
    fireEvent.click(screen.getByText('Use Hint', { exact: true }));

    expect(screen.getByText('5s cooldown')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('4s cooldown')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <HintSystem
        hints={sampleHints}
        hintsUsed={0}
        scorePenaltyPerHint={10}
        className="my-custom-class"
      />,
    );

    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});
