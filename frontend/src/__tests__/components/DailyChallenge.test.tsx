import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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

// Mock the type import
vi.mock('@/app/(app)/daily/page', () => ({
  // Types are compile-time only, no runtime mock needed
}));

import DailyChallenge from '@/components/quest/DailyChallenge';

// ---------- Test Data ----------

const baseChallenge = {
  id: 'dc-1',
  type: 'voice_sprint' as const,
  title: 'Speed Talker',
  description: 'Complete a voice conversation in under 3 minutes',
  timeLimit: 3,
  rewardXP: 150,
  status: 'available' as const,
};

describe('DailyChallenge', () => {
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders challenge title and description', () => {
    render(
      <DailyChallenge challenge={baseChallenge} onStatusChange={mockOnStatusChange} />,
    );

    expect(screen.getByText('Speed Talker')).toBeInTheDocument();
    expect(
      screen.getByText('Complete a voice conversation in under 3 minutes'),
    ).toBeInTheDocument();
  });

  it('shows reward amount', () => {
    render(
      <DailyChallenge challenge={baseChallenge} onStatusChange={mockOnStatusChange} />,
    );

    expect(screen.getByText('150 XP')).toBeInTheDocument();
  });

  it('shows start button when available', () => {
    render(
      <DailyChallenge challenge={baseChallenge} onStatusChange={mockOnStatusChange} />,
    );

    const startButton = screen.getByText('Start Challenge');
    expect(startButton).toBeInTheDocument();

    fireEvent.click(startButton);
    expect(mockOnStatusChange).toHaveBeenCalledWith('dc-1', 'in_progress');
  });

  it('shows checkmark and completed state when completed', () => {
    const completedChallenge = {
      ...baseChallenge,
      status: 'completed' as const,
    };

    render(
      <DailyChallenge
        challenge={completedChallenge}
        onStatusChange={mockOnStatusChange}
      />,
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('+150 XP earned')).toBeInTheDocument();
    // Start button should not be present
    expect(screen.queryByText('Start Challenge')).not.toBeInTheDocument();
  });

  it('shows in-progress state with timer indicator', () => {
    const inProgressChallenge = {
      ...baseChallenge,
      status: 'in_progress' as const,
    };

    render(
      <DailyChallenge
        challenge={inProgressChallenge}
        onStatusChange={mockOnStatusChange}
      />,
    );

    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Mark Complete')).toBeInTheDocument();
    // Start button should not be present
    expect(screen.queryByText('Start Challenge')).not.toBeInTheDocument();
  });
});
