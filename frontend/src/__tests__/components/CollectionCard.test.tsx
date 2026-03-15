import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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

import CollectionCard from '@/components/quest/CollectionCard';

// ---------- Test Data ----------

const makeCollection = (overrides = {}) => ({
  id: 'col-1',
  title: 'Madrid Adventures',
  description: 'Explore the best quests in Madrid',
  gradient: 'from-violet-600/40 to-indigo-600/40',
  quests: [
    { id: 'q1', title: 'Quest 1', thumbnailGradient: 'from-violet-500 to-indigo-500', points: 200, duration: 30, completed: true },
    { id: 'q2', title: 'Quest 2', thumbnailGradient: 'from-rose-500 to-pink-500', points: 300, duration: 45, completed: true },
    { id: 'q3', title: 'Quest 3', thumbnailGradient: 'from-amber-500 to-orange-500', points: 250, duration: 35, completed: false },
    { id: 'q4', title: 'Quest 4', thumbnailGradient: 'from-emerald-500 to-teal-500', points: 350, duration: 50, completed: false },
  ],
  totalPoints: 1100,
  estimatedTime: 160,
  completedCount: 2,
  category: 'adventure',
  ...overrides,
});

describe('CollectionCard', () => {
  it('renders collection title', () => {
    render(<CollectionCard collection={makeCollection()} />);
    expect(screen.getByText('Madrid Adventures')).toBeInTheDocument();
  });

  it('shows quest count', () => {
    render(<CollectionCard collection={makeCollection()} />);
    expect(screen.getByText('4 quests')).toBeInTheDocument();
  });

  it('shows progress bar when in progress', () => {
    const collection = makeCollection({ completedCount: 2 });
    render(<CollectionCard collection={collection} />);

    // Should show progress text
    expect(screen.getByText(/2 de 4 completadas/i)).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays total points', () => {
    render(<CollectionCard collection={makeCollection()} />);
    expect(screen.getByText('1100 pts')).toBeInTheDocument();
  });

  it('shows completion badge when all quests completed', () => {
    const completedCollection = makeCollection({
      completedCount: 4,
      quests: [
        { id: 'q1', title: 'Quest 1', thumbnailGradient: 'from-violet-500 to-indigo-500', points: 200, duration: 30, completed: true },
        { id: 'q2', title: 'Quest 2', thumbnailGradient: 'from-rose-500 to-pink-500', points: 300, duration: 45, completed: true },
        { id: 'q3', title: 'Quest 3', thumbnailGradient: 'from-amber-500 to-orange-500', points: 250, duration: 35, completed: true },
        { id: 'q4', title: 'Quest 4', thumbnailGradient: 'from-emerald-500 to-teal-500', points: 350, duration: 50, completed: true },
      ],
    });

    render(<CollectionCard collection={completedCollection} />);
    expect(screen.getByText('Coleccion completada')).toBeInTheDocument();
  });

  it('shows start button when no quests completed', () => {
    const freshCollection = makeCollection({
      completedCount: 0,
      quests: [
        { id: 'q1', title: 'Quest 1', thumbnailGradient: 'from-violet-500 to-indigo-500', points: 200, duration: 30, completed: false },
        { id: 'q2', title: 'Quest 2', thumbnailGradient: 'from-rose-500 to-pink-500', points: 300, duration: 45, completed: false },
      ],
    });

    render(<CollectionCard collection={freshCollection} />);
    expect(screen.getByText('Comenzar coleccion')).toBeInTheDocument();
  });

  it('shows continue button when partially completed', () => {
    render(<CollectionCard collection={makeCollection()} />);
    expect(screen.getByText('Continuar')).toBeInTheDocument();
  });
});
