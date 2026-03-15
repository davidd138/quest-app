import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/(app)/dashboard/page';
import type { User, Analytics, Quest } from '@/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { whileHover, whileTap, transition, variants, initial, animate, exit, layout, ...rest } = props as Record<string, unknown>;
      return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockUser: User = {
  userId: 'user-1',
  email: 'jane@example.com',
  name: 'Jane Smith',
  role: 'user',
  status: 'active',
  totalPoints: 1500,
  questsCompleted: 5,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockAnalytics: Analytics = {
  totalQuests: 10,
  questsCompleted: 5,
  totalPoints: 1500,
  averageScore: 85,
  totalPlayTime: 7200,
  favoriteCategory: 'adventure',
  completionRate: 50,
  recentActivity: [
    { date: '2025-03-01', questTitle: 'Madrid Tour', action: 'Completed stage', points: 100 },
  ],
  categoryBreakdown: [],
};

const mockQuest: Quest = {
  id: 'q1',
  title: 'Barcelona Adventure',
  description: 'Explore Barcelona',
  category: 'adventure',
  difficulty: 'medium',
  estimatedDuration: 90,
  stages: [
    {
      id: 's1',
      order: 1,
      title: 'Stage 1',
      description: 'Start',
      location: { latitude: 41.3, longitude: 2.1, name: 'Barcelona' },
      character: { name: 'Guide', role: 'NPC', personality: 'Friendly', backstory: 'Local', voiceStyle: 'warm', greetingMessage: 'Hi' },
      challenge: { type: 'conversation', description: 'Talk', successCriteria: 'Done', failureHints: [] },
      points: 100,
      hints: [],
    },
  ],
  totalPoints: 100,
  location: { latitude: 41.3, longitude: 2.1, name: 'Barcelona' },
  radius: 5000,
  tags: [],
  isPublished: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

// Mock useAuth and useQuery
const mockFetchAnalytics = vi.fn();
const mockFetchAchievements = vi.fn();
const mockFetchQuests = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useGraphQL', () => ({
  useQuery: (query: string) => {
    if (query.includes('GetAnalytics')) {
      return { data: mockAnalytics, loading: false, error: null, execute: mockFetchAnalytics };
    }
    if (query.includes('GetAchievements')) {
      return { data: null, loading: false, error: null, execute: mockFetchAchievements };
    }
    // LIST_QUESTS
    return { data: { items: [mockQuest] }, loading: false, error: null, execute: mockFetchQuests };
  },
}));

vi.mock('@/lib/graphql/queries', () => ({
  GET_ANALYTICS: 'query GetAnalytics { getAnalytics { totalPoints } }',
  GET_ACHIEVEMENTS: 'query GetAchievements { getAchievements { id } }',
  LIST_QUESTS: 'query ListQuests { listQuests { items { id } } }',
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows welcome message with user first name', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText(/Welcome back,/)).toBeInTheDocument();
  });

  it('renders stat card labels', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Total Points')).toBeInTheDocument();
    expect(screen.getByText('Quests Completed')).toBeInTheDocument();
    expect(screen.getByText('Play Time')).toBeInTheDocument();
    expect(screen.getByText('Avg Score')).toBeInTheDocument();
  });

  it('renders Active Quests section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Active Quests')).toBeInTheDocument();
  });

  it('renders Recommended Quests section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Recommended Quests')).toBeInTheDocument();
  });

  it('renders Recent Activity section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('renders quest titles from fetched data', () => {
    render(<DashboardPage />);
    expect(screen.getAllByText('Barcelona Adventure').length).toBeGreaterThan(0);
  });

  it('calls fetch functions on mount', () => {
    render(<DashboardPage />);
    expect(mockFetchAnalytics).toHaveBeenCalled();
    expect(mockFetchAchievements).toHaveBeenCalled();
    expect(mockFetchQuests).toHaveBeenCalled();
  });

  it('shows "View all" links', () => {
    render(<DashboardPage />);
    const viewAllLinks = screen.getAllByText('View all');
    expect(viewAllLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('renders achievements section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Latest Achievements')).toBeInTheDocument();
  });

  it('shows subtitle text', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Ready for your next adventure?')).toBeInTheDocument();
  });
});
