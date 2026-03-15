import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

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

// Mock GraphQL hooks
const mockExecuteQuery = vi.fn();
const mockExecuteMutation = vi.fn();

vi.mock('@/hooks/useGraphQL', () => ({
  useQuery: () => ({
    data: { averageRating: 4.2, totalRatings: 15, distribution: [1, 2, 3, 4, 5] },
    loading: false,
    error: null,
    execute: mockExecuteQuery,
  }),
  useMutation: () => ({
    loading: false,
    error: null,
    execute: mockExecuteMutation,
  }),
}));

vi.mock('@/lib/graphql/mutations', () => ({
  RATE_QUEST: 'mutation RateQuest {}',
}));

vi.mock('@/lib/graphql/queries', () => ({
  GET_QUEST_RATINGS: 'query GetQuestRatings {}',
}));

import { QuestRating } from '@/components/quest/QuestRating';

describe('QuestRating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 5 stars', () => {
    render(<QuestRating questId="q1" />);
    const starButtons = screen.getAllByRole('button', { name: /star/i });
    expect(starButtons).toHaveLength(5);
  });

  it('highlights stars on hover', () => {
    render(<QuestRating questId="q1" />);
    const starButtons = screen.getAllByRole('button', { name: /star/i });

    // Hover third star
    fireEvent.mouseEnter(starButtons[2]);

    // All first 3 stars should have active styling (amber fill)
    // After mouse leave, hover should clear
    fireEvent.mouseLeave(starButtons[2]);
  });

  it('sets rating on click', () => {
    render(<QuestRating questId="q1" />);
    const starButtons = screen.getAllByRole('button', { name: /star/i });

    fireEvent.click(starButtons[3]); // Click 4th star

    // Review section should appear after clicking
    expect(screen.getByPlaceholderText(/resena/i)).toBeInTheDocument();
  });

  it('shows average rating and count', () => {
    render(<QuestRating questId="q1" />);
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText(/15 valoracion/i)).toBeInTheDocument();
  });

  it('shows review textarea after clicking a star', () => {
    render(<QuestRating questId="q1" />);
    const starButtons = screen.getAllByRole('button', { name: /star/i });

    // Initially no textarea
    expect(screen.queryByPlaceholderText(/resena/i)).not.toBeInTheDocument();

    // Click a star
    fireEvent.click(starButtons[2]);

    // Textarea should appear
    expect(screen.getByPlaceholderText(/resena/i)).toBeInTheDocument();
  });

  it('submit button calls mutation', async () => {
    mockExecuteMutation.mockResolvedValue({});
    render(<QuestRating questId="q1" />);
    const starButtons = screen.getAllByRole('button', { name: /star/i });

    // Click 5th star
    fireEvent.click(starButtons[4]);

    // Type a review
    const textarea = screen.getByPlaceholderText(/resena/i);
    fireEvent.change(textarea, { target: { value: 'Great quest!' } });

    // Click submit
    const submitButton = screen.getByText('Enviar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockExecuteMutation).toHaveBeenCalledWith({
        questId: 'q1',
        rating: 5,
        review: 'Great quest!',
      });
    });
  });
});
