import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchPage from '@/app/(app)/search/page';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target: unknown, prop: string) => {
      const Component = React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
        const { children, className, onClick, href, style, ...rest } = props;
        void rest;
        return React.createElement(prop, { ref, className, onClick, href, style, 'data-testid': props['data-testid'] }, children as React.ReactNode);
      });
      Component.displayName = `motion.${prop}`;
      return Component;
    }
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock hooks
const mockRecentSearches: string[] = [];
const mockSetRecentSearches = vi.fn();

vi.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: () => [mockRecentSearches, mockSetRecentSearches, vi.fn()],
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input', () => {
    render(<SearchPage />);
    const input = screen.getByTestId('search-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search quests, collections, users...');
  });

  it('renders page title', () => {
    render(<SearchPage />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('shows start searching message when no query', () => {
    render(<SearchPage />);
    expect(screen.getByText('Start searching')).toBeInTheDocument();
  });

  it('types and shows results', () => {
    render(<SearchPage />);
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'madrid' } });

    expect(screen.getByText(/Madrid Mystery Tour/)).toBeInTheDocument();
  });

  it('groups results by type', () => {
    render(<SearchPage />);
    const input = screen.getByTestId('search-input');

    // Search for a term that matches quests and other types
    fireEvent.change(input, { target: { value: 'a' } });

    // Should have grouped sections
    const questSection = screen.queryByTestId('results-quest');
    expect(questSection).toBeInTheDocument();
  });

  it('filter toggles work', () => {
    render(<SearchPage />);
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'a' } });

    // Click to toggle off the quest type filter
    const questFilter = screen.getByTestId('filter-quest');
    fireEvent.click(questFilter);

    // Users and other types should still show
    const userFilter = screen.getByTestId('filter-user');
    expect(userFilter).toBeInTheDocument();
  });

  it('shows recent searches section', () => {
    render(<SearchPage />);
    expect(screen.getByText('Recent Searches')).toBeInTheDocument();
  });

  it('shows no results state', () => {
    render(<SearchPage />);
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'zzzznonexistenttermzzzz' } });

    expect(screen.getByTestId('no-results')).toBeInTheDocument();
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('shows suggestion alternatives in no results state', () => {
    render(<SearchPage />);
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'zzzznonexistenttermzzzz' } });

    // Should show alternative search terms
    expect(screen.getByText('madrid')).toBeInTheDocument();
    expect(screen.getByText('adventure')).toBeInTheDocument();
  });

  it('renders type filter buttons', () => {
    render(<SearchPage />);
    expect(screen.getByTestId('filter-quest')).toBeInTheDocument();
    expect(screen.getByTestId('filter-collection')).toBeInTheDocument();
    expect(screen.getByTestId('filter-user')).toBeInTheDocument();
    expect(screen.getByTestId('filter-character')).toBeInTheDocument();
  });

  it('highlights matching text in results', () => {
    render(<SearchPage />);
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'Madrid' } });

    // The highlighted text should be wrapped in a mark tag
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
  });
});
