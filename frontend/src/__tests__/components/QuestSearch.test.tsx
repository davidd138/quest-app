import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestSearch from '@/components/quest/QuestSearch';
import type { Quest } from '@/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        const Component = React.forwardRef(
          (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
            const { children, className, onClick, style, role, ...rest } = props;
            void rest;
            return React.createElement(
              prop,
              {
                ref,
                className,
                onClick,
                style,
                role,
                'data-testid': props['data-testid'],
              },
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

// Mock useDebounce to return value immediately for tests
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

// Mock useLocalStorage
const mockSetHistory = vi.fn();
vi.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: (_key: string, defaultValue: unknown) => {
    const ref = React.useRef(defaultValue);
    return [ref.current, mockSetHistory];
  },
}));

// Mock sub-components used by QuestSearch
vi.mock('@/components/ui/Badge', () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', { 'data-testid': 'badge' }, children),
}));

vi.mock('@/components/quest/DifficultyBadge', () => ({
  default: ({ difficulty }: { difficulty: string }) =>
    React.createElement('span', { 'data-testid': 'difficulty' }, difficulty),
}));

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const makeQuest = (id: string, title: string, category = 'adventure'): Quest => ({
  id,
  title,
  description: `Description for ${title}`,
  category: category as Quest['category'],
  difficulty: 'medium',
  estimatedDuration: 60,
  stages: [
    {
      id: 's1',
      order: 1,
      title: 'Stage 1',
      description: 'First stage',
      location: { latitude: 40.4, longitude: -3.7, name: 'Madrid' },
      character: {
        name: 'Guide',
        role: 'NPC',
        personality: 'Friendly',
        backstory: 'A guide',
        voiceStyle: 'warm',
        greetingMessage: 'Hello!',
      },
      challenge: {
        type: 'conversation',
        description: 'Talk',
        successCriteria: 'Done',
        failureHints: ['Try again'],
      },
      points: 100,
      hints: ['Look around'],
    },
  ],
  totalPoints: 100,
  location: { latitude: 40.4, longitude: -3.7, name: 'Madrid' },
  radius: 5000,
  tags: ['adventure', 'walking'],
  isPublished: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

const quests: Quest[] = [
  makeQuest('q1', 'Madrid Mystery Tour', 'mystery'),
  makeQuest('q2', 'Barcelona Adventure', 'adventure'),
  makeQuest('q3', 'Seville Cultural Walk', 'cultural'),
  makeQuest('q4', 'Valencia Food Quest', 'culinary'),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = vi.fn();

describe('QuestSearch', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the search input', () => {
    render(<QuestSearch quests={quests} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-label', 'Search quests');
  });

  it('renders placeholder text', () => {
    render(<QuestSearch quests={quests} onSelect={onSelect} placeholder="Find a quest..." />);
    expect(screen.getByPlaceholderText('Find a quest...')).toBeInTheDocument();
  });

  it('renders default placeholder when not specified', () => {
    render(<QuestSearch quests={quests} onSelect={onSelect} />);
    expect(screen.getByPlaceholderText('Search quests...')).toBeInTheDocument();
  });

  it('typing in the input updates the value', () => {
    render(<QuestSearch quests={quests} onSelect={onSelect} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Madrid' } });
    expect(input.value).toBe('Madrid');
  });

  it('typing a query shows matching results in the dropdown', async () => {
    render(<QuestSearch quests={quests} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');

    await act(async () => {
      input.focus();
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Madrid' } });
    });

    // The dropdown with role="listbox" should appear with result options
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
      // Result count label should show "1 result"
      expect(screen.getByText(/1 result/)).toBeInTheDocument();
    });
  });

  it('typing a non-matching query shows no results message', async () => {
    render(<QuestSearch quests={quests} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');

    await act(async () => {
      input.focus();
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'zzzznonexistent' } });
    });

    await waitFor(() => {
      expect(screen.getByText(/No quests found/)).toBeInTheDocument();
    });
  });

  it('ArrowDown navigates to the first result', async () => {
    render(<QuestSearch quests={quests} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');

    await act(async () => {
      input.focus();
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Barcelona' } });
    });

    // Wait for the dropdown to appear
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });

    // The first result option should now be aria-selected
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('Enter on a selected result calls onSelect', async () => {
    render(<QuestSearch quests={quests} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');

    await act(async () => {
      input.focus();
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Barcelona' } });
    });

    // Wait for the dropdown
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // Navigate down
    await act(async () => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });

    // Then select
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'q2', title: 'Barcelona Adventure' }),
    );
  });

  it('clear button resets the search input', async () => {
    render(<QuestSearch quests={quests} onSelect={onSelect} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Madrid' } });
    expect(input.value).toBe('Madrid');

    // The clear button should appear
    const clearBtn = screen.getByLabelText('Clear search');
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(input.value).toBe('');
  });

  it('Ctrl+K focuses the search input', () => {
    render(<QuestSearch quests={quests} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');

    // Input should not be focused initially
    expect(document.activeElement).not.toBe(input);

    // Simulate Ctrl+K
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(document.activeElement).toBe(input);
  });

  it('Meta+K (Cmd on Mac) focuses the search input', () => {
    render(<QuestSearch quests={quests} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');

    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(document.activeElement).toBe(input);
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <QuestSearch quests={quests} onSelect={onSelect} className="my-search" />,
    );
    expect(container.firstChild).toHaveClass('my-search');
  });

  it('input has combobox role with aria-expanded', () => {
    render(<QuestSearch quests={quests} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });
});
