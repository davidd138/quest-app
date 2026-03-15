import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommunityPage from '@/app/(app)/community/page';
import type { Quest, QuestConnection } from '@/types';

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
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href, ...props }, children),
}));

const mockExecute = vi.fn();
const mockUseQuery = vi.fn();

vi.mock('@/hooks/useGraphQL', () => ({
  useQuery: () => mockUseQuery(),
}));

vi.mock('@/lib/graphql/queries', () => ({
  LIST_QUESTS: 'query ListQuests { listQuests { items { id title } } }',
}));

vi.mock('@/lib/constants', () => ({
  DIFFICULTY_COLORS: {
    easy: 'emerald',
    medium: 'amber',
    hard: 'rose',
    legendary: 'violet',
  },
}));

const mockQuests: Quest[] = [
  {
    id: 'q1',
    title: 'The Lost Temple',
    description: 'Explore ancient ruins',
    category: 'adventure',
    difficulty: 'hard',
    estimatedDuration: 90,
    stages: [
      { id: 's1', order: 1, title: 'Stage 1', description: '', location: { latitude: 0, longitude: 0, name: 'A' }, character: { name: 'C', role: 'R', personality: 'P', backstory: 'B', voiceStyle: 'V', greetingMessage: 'G' }, challenge: { type: 'riddle', description: 'D', successCriteria: 'S', failureHints: [] }, points: 100, hints: [] },
    ],
    totalPoints: 850,
    location: { latitude: 40.41, longitude: -3.70, name: 'Madrid' },
    radius: 5000,
    tags: ['adventure'],
    isPublished: true,
    createdBy: 'user1',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-01',
  },
  {
    id: 'q2',
    title: 'Culinary Secrets',
    description: 'Discover hidden flavors',
    category: 'culinary',
    difficulty: 'easy',
    estimatedDuration: 45,
    stages: [
      { id: 's2', order: 1, title: 'Stage 1', description: '', location: { latitude: 0, longitude: 0, name: 'B' }, character: { name: 'C', role: 'R', personality: 'P', backstory: 'B', voiceStyle: 'V', greetingMessage: 'G' }, challenge: { type: 'conversation', description: 'D', successCriteria: 'S', failureHints: [] }, points: 100, hints: [] },
    ],
    totalPoints: 400,
    location: { latitude: 40.41, longitude: -3.71, name: 'La Latina' },
    radius: 3000,
    tags: ['food'],
    isPublished: true,
    createdAt: '2026-02-15',
    updatedAt: '2026-02-15',
  },
];

describe('CommunityPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title "Comunidad"', () => {
    mockUseQuery.mockReturnValue({
      data: { items: mockQuests } as QuestConnection,
      loading: false,
      execute: mockExecute,
    });
    render(<CommunityPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Comunidad');
  });

  it('shows quest cards when data is loaded', () => {
    mockUseQuery.mockReturnValue({
      data: { items: mockQuests } as QuestConnection,
      loading: false,
      execute: mockExecute,
    });
    render(<CommunityPage />);
    expect(screen.getAllByText('The Lost Temple').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Culinary Secrets').length).toBeGreaterThanOrEqual(1);
  });

  it('renders sort tabs', () => {
    mockUseQuery.mockReturnValue({
      data: { items: mockQuests } as QuestConnection,
      loading: false,
      execute: mockExecute,
    });
    render(<CommunityPage />);
    expect(screen.getByText('Recientes')).toBeInTheDocument();
    expect(screen.getByText('Populares')).toBeInTheDocument();
    expect(screen.getByText('Mejor valoradas')).toBeInTheDocument();
    expect(screen.getByText('Cerca de ti')).toBeInTheDocument();
  });

  it('changes active sort tab on click', () => {
    mockUseQuery.mockReturnValue({
      data: { items: mockQuests } as QuestConnection,
      loading: false,
      execute: mockExecute,
    });
    render(<CommunityPage />);
    const popularTab = screen.getByText('Populares');
    fireEvent.click(popularTab);
    // The popular tab should now have the active class
    expect(popularTab.closest('button')?.className).toContain('bg-violet-500/20');
  });

  it('shows loading skeletons when loading', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      execute: mockExecute,
    });
    const { container } = render(<CommunityPage />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('shows empty state when no quests available', () => {
    mockUseQuery.mockReturnValue({
      data: { items: [] } as unknown as QuestConnection,
      loading: false,
      execute: mockExecute,
    });
    render(<CommunityPage />);
    expect(screen.getByText('No hay quests todavia')).toBeInTheDocument();
  });

  it('calls execute on mount', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      execute: mockExecute,
    });
    render(<CommunityPage />);
    expect(mockExecute).toHaveBeenCalledWith({ limit: 50 });
  });

  it('renders "Crear Quest" button', () => {
    mockUseQuery.mockReturnValue({
      data: { items: mockQuests } as QuestConnection,
      loading: false,
      execute: mockExecute,
    });
    render(<CommunityPage />);
    expect(screen.getAllByText('Crear Quest').length).toBeGreaterThanOrEqual(1);
  });

  it('renders featured quests section with heading', () => {
    mockUseQuery.mockReturnValue({
      data: { items: mockQuests } as QuestConnection,
      loading: false,
      execute: mockExecute,
    });
    render(<CommunityPage />);
    expect(screen.getByText('Quests destacadas')).toBeInTheDocument();
  });
});
