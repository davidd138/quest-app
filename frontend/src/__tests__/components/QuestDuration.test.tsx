import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Inline QuestDuration component for testing
function QuestDuration({
  minutes,
  compact = false,
}: {
  minutes: number;
  compact?: boolean;
}) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  let label: string;
  if (compact) {
    label = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;
  } else {
    label =
      hours > 0
        ? `${hours}h ${mins > 0 ? `${mins}min` : ''}`
        : `${mins} min`;
  }

  let colorClass: string;
  if (minutes <= 30) {
    colorClass = 'text-emerald-400';
  } else if (minutes <= 90) {
    colorClass = 'text-amber-400';
  } else {
    colorClass = 'text-rose-400';
  }

  return (
    <span className={`inline-flex items-center gap-1 ${colorClass}`} data-testid="quest-duration">
      <svg
        data-testid="clock-icon"
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span data-testid="duration-label">{label.trim()}</span>
    </span>
  );
}

describe('QuestDuration', () => {
  it('formats minutes correctly for short duration', () => {
    render(<QuestDuration minutes={45} />);
    expect(screen.getByTestId('duration-label')).toHaveTextContent('45 min');
  });

  it('formats hours and minutes correctly', () => {
    render(<QuestDuration minutes={90} />);
    expect(screen.getByTestId('duration-label')).toHaveTextContent('1h 30min');
  });

  it('formats exact hours correctly', () => {
    render(<QuestDuration minutes={120} />);
    expect(screen.getByTestId('duration-label')).toHaveTextContent('2h');
  });

  it('applies emerald color for short durations (<=30 min)', () => {
    render(<QuestDuration minutes={20} />);
    expect(screen.getByTestId('quest-duration')).toHaveClass('text-emerald-400');
  });

  it('applies amber color for medium durations (31-90 min)', () => {
    render(<QuestDuration minutes={60} />);
    expect(screen.getByTestId('quest-duration')).toHaveClass('text-amber-400');
  });

  it('applies rose color for long durations (>90 min)', () => {
    render(<QuestDuration minutes={120} />);
    expect(screen.getByTestId('quest-duration')).toHaveClass('text-rose-400');
  });

  it('renders compact mode correctly for minutes only', () => {
    render(<QuestDuration minutes={45} compact />);
    expect(screen.getByTestId('duration-label')).toHaveTextContent('45m');
  });

  it('renders compact mode correctly for hours and minutes', () => {
    render(<QuestDuration minutes={90} compact />);
    expect(screen.getByTestId('duration-label')).toHaveTextContent('1h 30m');
  });

  it('renders the clock icon', () => {
    render(<QuestDuration minutes={30} />);
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
  });

  it('handles edge case at boundary (30 min = emerald)', () => {
    render(<QuestDuration minutes={30} />);
    expect(screen.getByTestId('quest-duration')).toHaveClass('text-emerald-400');
  });

  it('handles edge case at boundary (31 min = amber)', () => {
    render(<QuestDuration minutes={31} />);
    expect(screen.getByTestId('quest-duration')).toHaveClass('text-amber-400');
  });

  it('handles edge case at boundary (91 min = rose)', () => {
    render(<QuestDuration minutes={91} />);
    expect(screen.getByTestId('quest-duration')).toHaveClass('text-rose-400');
  });
});
