import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SaveButton from '@/components/quest/SaveButton';

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

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SaveButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders bookmark icon', () => {
    render(<SaveButton itemId="quest-1" />);
    const icon = screen.getByTestId('bookmark-icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders the save button', () => {
    render(<SaveButton itemId="quest-1" />);
    const button = screen.getByTestId('save-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Save');
  });

  it('toggles on click', () => {
    render(<SaveButton itemId="quest-1" />);
    const button = screen.getByTestId('save-button');

    // Click to save
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Remove from saved');

    // Click to unsave
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Save');
  });

  it('persists to localStorage', () => {
    render(<SaveButton itemId="quest-1" />);
    const button = screen.getByTestId('save-button');

    fireEvent.click(button);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'quest-app-saved-items',
      expect.stringContaining('quest:quest-1'),
    );
  });

  it('removes from localStorage when unsaved', () => {
    render(<SaveButton itemId="quest-1" />);
    const button = screen.getByTestId('save-button');

    // Save then unsave
    fireEvent.click(button);
    fireEvent.click(button);

    // Should have been called with the item removed
    const lastCall = localStorageMock.setItem.mock.calls.at(-1);
    expect(lastCall?.[1]).not.toContain('quest:quest-1');
  });

  it('displays count when provided', () => {
    render(<SaveButton itemId="quest-1" saveCount={42} />);
    const count = screen.getByTestId('save-count');
    expect(count).toBeInTheDocument();
    expect(count).toHaveTextContent('42');
  });

  it('does not display count when not provided', () => {
    render(<SaveButton itemId="quest-1" />);
    expect(screen.queryByTestId('save-count')).not.toBeInTheDocument();
  });

  it('fires onToggle callback', () => {
    const handleToggle = vi.fn();
    render(<SaveButton itemId="quest-1" onToggle={handleToggle} />);
    const button = screen.getByTestId('save-button');

    fireEvent.click(button);
    expect(handleToggle).toHaveBeenCalledWith(true);

    fireEvent.click(button);
    expect(handleToggle).toHaveBeenCalledWith(false);
  });

  it('reads initial state from localStorage', () => {
    // Pre-populate localStorage
    localStorageMock.setItem(
      'quest-app-saved-items',
      JSON.stringify({ 'quest:quest-1': true }),
    );

    render(<SaveButton itemId="quest-1" />);
    const button = screen.getByTestId('save-button');
    expect(button).toHaveAttribute('aria-label', 'Remove from saved');
  });

  it('applies different sizes', () => {
    const { rerender } = render(<SaveButton itemId="quest-1" size="sm" />);
    let button = screen.getByTestId('save-button');
    expect(button.className).toContain('w-8');

    rerender(<SaveButton itemId="quest-1" size="lg" />);
    button = screen.getByTestId('save-button');
    expect(button.className).toContain('w-12');
  });
});
