import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

// ---------------------------------------------------------------------------
// We need to import after mocking localStorage, so use dynamic imports
// inside describe blocks. The theme module reads localStorage on import of
// the provider, so we control it via the mock.
// ---------------------------------------------------------------------------

// Mock matchMedia
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: query === '(prefers-color-scheme: dark)',
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

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
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    _store: () => store,
  };
})();

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
});

// Import after mocks are set
import { ThemeProvider, useTheme } from '@/lib/theme';
import type { ThemeMode } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Helper: render useTheme inside ThemeProvider
// ---------------------------------------------------------------------------

function renderThemeHook() {
  return renderHook(() => useTheme(), {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Theme system', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Reset DOM classes
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.removeAttribute('style');
  });

  it('defaults to dark theme when no stored preference', () => {
    const { result } = renderThemeHook();
    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('setTheme changes the current theme to light', () => {
    const { result } = renderThemeHook();

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('setTheme changes the current theme to system', () => {
    const { result } = renderThemeHook();

    act(() => {
      result.current.setTheme('system');
    });

    expect(result.current.theme).toBe('system');
    // With our mock, prefers-color-scheme: dark matches, so resolved = dark
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('persists theme choice to localStorage', () => {
    const { result } = renderThemeHook();

    act(() => {
      result.current.setTheme('light');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'quest-app-theme',
      'light',
    );
  });

  it('reads stored theme from localStorage on mount', () => {
    // Pre-set localStorage before rendering
    localStorageMock.setItem('quest-app-theme', 'light');
    localStorageMock.setItem.mockClear();

    const { result } = renderThemeHook();

    // After effect runs, it should read 'light' from storage
    // The initial state is 'dark' but useEffect will update it
    // We need to wait for the effect
    expect(localStorageMock.getItem).toHaveBeenCalledWith('quest-app-theme');
  });

  it('system theme reads media query for prefers-color-scheme', () => {
    const { result } = renderThemeHook();

    act(() => {
      result.current.setTheme('system');
    });

    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  it('toggleTheme cycles through dark -> light -> system -> dark', () => {
    const { result } = renderThemeHook();

    // Start at dark
    expect(result.current.theme).toBe('dark');

    // Toggle to light
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');

    // Toggle to system
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('system');

    // Toggle back to dark
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');
  });

  it('applies CSS class to document element', () => {
    const { result } = renderThemeHook();

    act(() => {
      result.current.setTheme('light');
    });

    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Suppress error output for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});
