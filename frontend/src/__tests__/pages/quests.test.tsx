import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuestsPage from '@/app/(app)/quests/page';
import type { Quest, QuestConnection } from '@/types';

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

const makeQuest = (overrides: Partial<Quest> = {}): Quest => ({
  id: 'q1',
  title: 'Madrid Mystery',
  description: 'Explore the mysteries of Madrid',
  category: 'mystery',
  difficulty: 'medium',
  estimatedDuration: 60,
  stages: [
    {
      id: 's1',
      order: 1,
      title: 'Stage 1',
      description: 'Start',
      location: { latitude: 40.4, longitude: -3.7, name: 'Madrid' },
      character: { name: 'Guide', role: 'NPC', personality: 'Friendly', backstory: 'Local', voiceStyle: 'warm', greetingMessage: 'Hi' },
      challenge: { type: 'conversation', description: 'Talk', successCriteria: 'Done', failureHints: [] },
      points: 100,
      hints: [],
    },
  ],
  totalPoints: 100,
  location: { latitude: 40.4, longitude: -3.7, name: 'Madrid' },
  radius: 5000,
  tags: ['mystery'],
  isPublished: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

const mockQuests: Quest[] = [
  makeQuest({ id: 'q1', title: 'Madrid Mystery', category: 'mystery', difficulty: 'medium' }),
  makeQuest({ id: 'q2', title: 'Barcelona Adventure', category: 'adventure', difficulty: 'easy', description: 'Fun in Barcelona', tags: ['fun'] }),
  makeQuest({ id: 'q3', title: 'Seville Culture Walk', category: 'cultural', difficulty: 'hard', description: 'Cultural tour of Seville', tags: ['culture'] }),
];

const mockExecute = vi.fn();
let mockData: QuestConnection | null = { items: mockQuests };
let mockLoading = false;

vi.mock('@/hooks/useGraphQL', () => ({
  useQuery: () => ({
    data: mockData,
    loading: mockLoading,
    error: null,
    execute: mockExecute,
  }),
}));

vi.mock('@/lib/graphql/queries', () => ({
  LIST_QUESTS: 'query ListQuests { listQuests { items { id } } }',
}));

vi.mock('@/lib/constants', () => ({
  QUEST_CATEGORIES: ['adventure', 'mystery', 'cultural', 'educational', 'culinary', 'nature', 'urban', 'team_building'],
  QUEST_DIFFICULTIES: ['easy', 'medium', 'hard', 'legendary'],
  DIFFICULTY_COLORS: { easy: 'emerald', medium: 'amber', hard: 'rose', legendary: 'violet' },
}));

describe('QuestsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockData = { items: mockQuests };
    mockLoading = false;
  });

  it('renders the page header', () => {
    render(<QuestsPage />);
    expect(screen.getByText('Quest Catalog')).toBeInTheDocument();
    expect(screen.getByText('Discover and embark on new adventures')).toBeInTheDocument();
  });

  it('renders quest list', () => {
    render(<QuestsPage />);
    expect(screen.getByText('Madrid Mystery')).toBeInTheDocument();
    expect(screen.getByText('Barcelona Adventure')).toBeInTheDocument();
    expect(screen.getByText('Seville Culture Walk')).toBeInTheDocument();
  });

  it('calls execute on mount to fetch quests', () => {
    render(<QuestsPage />);
    expect(mockExecute).toHaveBeenCalled();
  });

  it('filters quests by search text', async () => {
    render(<QuestsPage />);
    const searchInput = screen.getByPlaceholderText('Search quests...');

    fireEvent.change(searchInput, { target: { value: 'Barcelona' } });

    expect(screen.getByText('Barcelona Adventure')).toBeInTheDocument();
    expect(screen.queryByText('Madrid Mystery')).not.toBeInTheDocument();
    expect(screen.queryByText('Seville Culture Walk')).not.toBeInTheDocument();
  });

  it('filters by search in description', () => {
    render(<QuestsPage />);
    const searchInput = screen.getByPlaceholderText('Search quests...');

    fireEvent.change(searchInput, { target: { value: 'Cultural tour' } });

    expect(screen.getByText('Seville Culture Walk')).toBeInTheDocument();
    expect(screen.queryByText('Madrid Mystery')).not.toBeInTheDocument();
  });

  it('shows empty state when no results match search', () => {
    render(<QuestsPage />);
    const searchInput = screen.getByPlaceholderText('Search quests...');

    fireEvent.change(searchInput, { target: { value: 'zzz nonexistent zzz' } });

    expect(screen.getByText('No quests found')).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your filters/)).toBeInTheDocument();
  });

  it('shows Clear Filters button in empty state when filters are active', () => {
    render(<QuestsPage />);
    const searchInput = screen.getByPlaceholderText('Search quests...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('clears filters when Clear Filters is clicked', () => {
    render(<QuestsPage />);
    const searchInput = screen.getByPlaceholderText('Search quests...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    fireEvent.click(screen.getByText('Clear Filters'));

    // All quests should now be visible again
    expect(screen.getByText('Madrid Mystery')).toBeInTheDocument();
    expect(screen.getByText('Barcelona Adventure')).toBeInTheDocument();
    expect(screen.getByText('Seville Culture Walk')).toBeInTheDocument();
  });

  it('renders category dropdown with options', () => {
    render(<QuestsPage />);
    expect(screen.getByText('All Categories')).toBeInTheDocument();
  });

  it('renders difficulty dropdown with options', () => {
    render(<QuestsPage />);
    expect(screen.getByText('All Difficulties')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    mockLoading = true;
    const { container } = render(<QuestsPage />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when data has no items', () => {
    mockData = { items: [] };
    render(<QuestsPage />);
    expect(screen.getByText('No quests found')).toBeInTheDocument();
  });
});
