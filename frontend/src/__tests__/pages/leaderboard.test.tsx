import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import LeaderboardPage from '@/app/(app)/leaderboard/page';
import type { LeaderboardEntry } from '@/types';

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

const mockExecute = vi.fn();
const mockUseQuery = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/useGraphQL', () => ({
  useQuery: () => mockUseQuery(),
}));

vi.mock('@/lib/graphql/queries', () => ({
  GET_LEADERBOARD: 'query GetLeaderboard { getLeaderboard { rank userId userName } }',
}));

const mockEntries: LeaderboardEntry[] = [
  { rank: 1, userId: 'u1', userName: 'Alice Smith', totalPoints: 5000, questsCompleted: 10, averageScore: 95 },
  { rank: 2, userId: 'u2', userName: 'Bob Jones', totalPoints: 4200, questsCompleted: 8, averageScore: 88 },
  { rank: 3, userId: 'u3', userName: 'Charlie Brown', totalPoints: 3800, questsCompleted: 7, averageScore: 82 },
  { rank: 4, userId: 'u4', userName: 'Diana Prince', totalPoints: 3500, questsCompleted: 6, averageScore: 79 },
  { rank: 5, userId: 'current-user', userName: 'Current User', totalPoints: 2000, questsCompleted: 4, averageScore: 72 },
];

describe('LeaderboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { userId: 'current-user' } });
  });

  it('renders leaderboard heading', () => {
    mockUseQuery.mockReturnValue({ data: mockEntries, loading: false, execute: mockExecute });
    render(<LeaderboardPage />);
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('See how you rank among fellow adventurers')).toBeInTheDocument();
  });

  it('renders podium for top 3 players', () => {
    mockUseQuery.mockReturnValue({ data: mockEntries, loading: false, execute: mockExecute });
    render(<LeaderboardPage />);
    // Names appear in both the podium and the ranking table
    expect(screen.getAllByText('Alice Smith').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Bob Jones').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Charlie Brown').length).toBeGreaterThanOrEqual(2);
  });

  it('shows ranking table with all entries', () => {
    mockUseQuery.mockReturnValue({ data: mockEntries, loading: false, execute: mockExecute });
    render(<LeaderboardPage />);
    // Table headers
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
    // All players should appear in the table
    expect(screen.getByText('Diana Prince')).toBeInTheDocument();
  });

  it("highlights current user's rank with (you) indicator", () => {
    mockUseQuery.mockReturnValue({ data: mockEntries, loading: false, execute: mockExecute });
    render(<LeaderboardPage />);
    expect(screen.getByText('(you)')).toBeInTheDocument();
  });

  it("applies special styling to current user's row", () => {
    mockUseQuery.mockReturnValue({ data: mockEntries, loading: false, execute: mockExecute });
    const { container } = render(<LeaderboardPage />);
    const highlightedRow = container.querySelector('.bg-violet-500\\/5');
    expect(highlightedRow).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    mockUseQuery.mockReturnValue({ data: null, loading: true, execute: mockExecute });
    const { container } = render(<LeaderboardPage />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('calls execute with limit on mount', () => {
    mockUseQuery.mockReturnValue({ data: null, loading: true, execute: mockExecute });
    render(<LeaderboardPage />);
    expect(mockExecute).toHaveBeenCalledWith({ limit: 50 });
  });

  it('shows empty state when no entries', () => {
    mockUseQuery.mockReturnValue({ data: [], loading: false, execute: mockExecute });
    render(<LeaderboardPage />);
    expect(screen.getByText('No rankings yet. Be the first!')).toBeInTheDocument();
  });

  it('displays player points in the table', () => {
    mockUseQuery.mockReturnValue({ data: mockEntries, loading: false, execute: mockExecute });
    render(<LeaderboardPage />);
    // Points are formatted with toLocaleString - use the formatted value
    const formattedPoints = (5000).toLocaleString();
    expect(screen.getAllByText(formattedPoints).length).toBeGreaterThanOrEqual(1);
  });

  it('shows initials for players without avatar', () => {
    mockUseQuery.mockReturnValue({ data: mockEntries, loading: false, execute: mockExecute });
    render(<LeaderboardPage />);
    // Alice Smith -> AS (appears in podium and table)
    expect(screen.getAllByText('AS').length).toBeGreaterThanOrEqual(1);
  });
});
