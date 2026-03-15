import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Inline SearchInput component for testing
function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  loading = false,
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  onClear?: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative" data-testid="search-input-wrapper">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid="search-input"
        className="w-full pl-10 pr-10 py-2.5 rounded-xl"
      />
      {loading && (
        <div data-testid="search-spinner" className="absolute right-10 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {value && onClear && (
        <button
          onClick={onClear}
          data-testid="search-clear"
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label="Clear search"
        >
          X
        </button>
      )}
    </div>
  );
}

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Search quests..." />);
    expect(screen.getByPlaceholderText('Search quests...')).toBeInTheDocument();
  });

  it('renders with default placeholder', () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('onChange fires with value', () => {
    const handleChange = vi.fn();
    render(<SearchInput value="" onChange={handleChange} />);
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'test query' } });
    expect(handleChange).toHaveBeenCalledWith('test query');
  });

  it('clear button appears when value is present and onClear is provided', () => {
    const handleClear = vi.fn();
    render(<SearchInput value="hello" onChange={vi.fn()} onClear={handleClear} />);
    const clearBtn = screen.getByTestId('search-clear');
    expect(clearBtn).toBeInTheDocument();
  });

  it('clear button does not appear when value is empty', () => {
    render(<SearchInput value="" onChange={vi.fn()} onClear={vi.fn()} />);
    expect(screen.queryByTestId('search-clear')).not.toBeInTheDocument();
  });

  it('clear button calls onClear when clicked', () => {
    const handleClear = vi.fn();
    render(<SearchInput value="hello" onChange={vi.fn()} onClear={handleClear} />);
    fireEvent.click(screen.getByTestId('search-clear'));
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('loading spinner is shown when loading is true', () => {
    render(<SearchInput value="" onChange={vi.fn()} loading />);
    expect(screen.getByTestId('search-spinner')).toBeInTheDocument();
  });

  it('loading spinner is not shown when loading is false', () => {
    render(<SearchInput value="" onChange={vi.fn()} loading={false} />);
    expect(screen.queryByTestId('search-spinner')).not.toBeInTheDocument();
  });

  it('Ctrl+K focuses input', () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    const input = screen.getByTestId('search-input');
    expect(document.activeElement).not.toBe(input);
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(document.activeElement).toBe(input);
  });

  it('Meta+K focuses input', () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    const input = screen.getByTestId('search-input');
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(document.activeElement).toBe(input);
  });
});
