import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

function fireKeyDown(key: string, options: Partial<KeyboardEvent> = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  document.dispatchEvent(event);
  return event;
}

describe('useKeyboardShortcuts', () => {
  const mockToggleHelp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Ctrl+K callback fires (focuses search)', () => {
    const mockInput = document.createElement('input');
    mockInput.type = 'text';
    mockInput.placeholder = 'Search...';
    mockInput.focus = vi.fn();
    mockInput.select = vi.fn();
    document.body.appendChild(mockInput);

    renderHook(() => useKeyboardShortcuts({ onToggleShortcutsHelp: mockToggleHelp }));

    act(() => {
      fireKeyDown('k', { ctrlKey: true });
    });

    expect(mockInput.focus).toHaveBeenCalled();

    document.body.removeChild(mockInput);
  });

  it('Cmd+K callback fires on Mac', () => {
    const mockInput = document.createElement('input');
    mockInput.type = 'text';
    mockInput.placeholder = 'Search...';
    mockInput.focus = vi.fn();
    mockInput.select = vi.fn();
    document.body.appendChild(mockInput);

    renderHook(() => useKeyboardShortcuts({ onToggleShortcutsHelp: mockToggleHelp }));

    act(() => {
      fireKeyDown('k', { metaKey: true });
    });

    expect(mockInput.focus).toHaveBeenCalled();

    document.body.removeChild(mockInput);
  });

  it('? toggles shortcuts help', () => {
    renderHook(() => useKeyboardShortcuts({ onToggleShortcutsHelp: mockToggleHelp }));

    act(() => {
      fireKeyDown('?');
    });

    expect(mockToggleHelp).toHaveBeenCalledTimes(1);
  });

  it('/ focuses search', () => {
    const mockInput = document.createElement('input');
    mockInput.type = 'text';
    mockInput.placeholder = 'Search...';
    mockInput.focus = vi.fn();
    mockInput.select = vi.fn();
    document.body.appendChild(mockInput);

    renderHook(() => useKeyboardShortcuts({ onToggleShortcutsHelp: mockToggleHelp }));

    act(() => {
      fireKeyDown('/');
    });

    expect(mockInput.focus).toHaveBeenCalled();

    document.body.removeChild(mockInput);
  });

  it('g+d navigates to dashboard', () => {
    renderHook(() => useKeyboardShortcuts({ onToggleShortcutsHelp: mockToggleHelp }));

    act(() => {
      fireKeyDown('g');
    });

    act(() => {
      fireKeyDown('d');
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('g+q navigates to quests', () => {
    renderHook(() => useKeyboardShortcuts({ onToggleShortcutsHelp: mockToggleHelp }));

    act(() => {
      fireKeyDown('g');
    });

    act(() => {
      fireKeyDown('q');
    });

    expect(mockPush).toHaveBeenCalledWith('/quests');
  });

  it('g+l navigates to leaderboard', () => {
    renderHook(() => useKeyboardShortcuts({ onToggleShortcutsHelp: mockToggleHelp }));

    act(() => {
      fireKeyDown('g');
    });

    act(() => {
      fireKeyDown('l');
    });

    expect(mockPush).toHaveBeenCalledWith('/leaderboard');
  });

  it('skips shortcuts when input is focused', () => {
    renderHook(() => useKeyboardShortcuts({ onToggleShortcutsHelp: mockToggleHelp }));

    // Create and focus an input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    act(() => {
      fireKeyDown('?');
    });

    // Should NOT trigger because input is focused
    expect(mockToggleHelp).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('skips shortcuts when textarea is focused', () => {
    renderHook(() => useKeyboardShortcuts({ onToggleShortcutsHelp: mockToggleHelp }));

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    act(() => {
      fireKeyDown('?');
    });

    expect(mockToggleHelp).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it('Ctrl+K still works when input is focused', () => {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search...';
    searchInput.focus = vi.fn();
    searchInput.select = vi.fn();
    document.body.appendChild(searchInput);

    const otherInput = document.createElement('input');
    document.body.appendChild(otherInput);
    otherInput.focus();

    renderHook(() => useKeyboardShortcuts({ onToggleShortcutsHelp: mockToggleHelp }));

    act(() => {
      fireKeyDown('k', { ctrlKey: true });
    });

    expect(searchInput.focus).toHaveBeenCalled();

    document.body.removeChild(searchInput);
    document.body.removeChild(otherInput);
  });

  it('g sequence times out after 1 second', () => {
    renderHook(() => useKeyboardShortcuts({ onToggleShortcutsHelp: mockToggleHelp }));

    act(() => {
      fireKeyDown('g');
    });

    // Advance past the timeout
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    act(() => {
      fireKeyDown('d');
    });

    // Should NOT navigate because g timed out
    expect(mockPush).not.toHaveBeenCalled();
  });
});
