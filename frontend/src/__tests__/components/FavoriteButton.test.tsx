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

import FavoriteButton from '@/components/quest/FavoriteButton';

const STORAGE_KEY = 'quest-favorites';

describe('FavoriteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders heart icon', () => {
    render(<FavoriteButton questId="q-1" />);

    const button = screen.getByRole('button', { name: /favorites/i });
    expect(button).toBeInTheDocument();
    // Heart icon from lucide-react renders as SVG
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('toggles favorited state on click', () => {
    render(<FavoriteButton questId="q-1" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('saves to localStorage on toggle', () => {
    render(<FavoriteButton questId="q-42" />);

    const button = screen.getByRole('button');

    // Favorite
    fireEvent.click(button);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored).toContain('q-42');

    // Unfavorite
    fireEvent.click(button);
    const stored2 = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored2).not.toContain('q-42');
  });

  it('shows count when showCount is true', () => {
    render(<FavoriteButton questId="q-1" showCount count={15} />);

    // Initially not favorited, should show the count value
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('increments displayed count when favorited', () => {
    render(<FavoriteButton questId="q-1" showCount count={15} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // After favoriting, count should show count + 1
    expect(screen.getByText('16')).toBeInTheDocument();
  });

  it('calls onToggle callback with new state', () => {
    const onToggle = vi.fn();
    render(<FavoriteButton questId="q-1" onToggle={onToggle} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledWith(true);

    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('reads initial state from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['q-99']));

    render(<FavoriteButton questId="q-99" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('uses initialFavorited prop over localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

    render(<FavoriteButton questId="q-1" initialFavorited />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('has correct aria-label based on state', () => {
    render(<FavoriteButton questId="q-1" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Add to favorites');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Remove from favorites');
  });
});
