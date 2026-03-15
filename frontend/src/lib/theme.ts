'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export interface ThemeContextValue {
  /** The persisted preference ('dark' | 'light' | 'system'). */
  theme: ThemeMode;
  /** The *actual* theme applied to the page (never 'system'). */
  resolvedTheme: ResolvedTheme;
  /** Replace the current theme preference. */
  setTheme: (mode: ThemeMode) => void;
  /** Cycle dark -> light -> system -> dark ... */
  toggleTheme: () => void;
}

// ---------------------------------------------------------------------------
// CSS custom-property tokens
// ---------------------------------------------------------------------------

const CSS_VARS: Record<ResolvedTheme, Record<string, string>> = {
  dark: {
    '--color-bg': '15 15 20',
    '--color-bg-secondary': '24 24 32',
    '--color-bg-tertiary': '32 32 44',
    '--color-surface': '255 255 255',
    '--color-surface-opacity': '0.05',
    '--color-text-primary': '248 250 252',
    '--color-text-secondary': '148 163 184',
    '--color-text-muted': '100 116 139',
    '--color-border': '255 255 255',
    '--color-border-opacity': '0.1',
    '--color-accent': '139 92 246',
    '--color-accent-hover': '124 58 237',
    '--shadow-color': '0 0 0',
    '--shadow-opacity': '0.5',
  },
  light: {
    '--color-bg': '249 250 251',
    '--color-bg-secondary': '255 255 255',
    '--color-bg-tertiary': '241 245 249',
    '--color-surface': '0 0 0',
    '--color-surface-opacity': '0.04',
    '--color-text-primary': '15 23 42',
    '--color-text-secondary': '71 85 105',
    '--color-text-muted': '148 163 184',
    '--color-border': '0 0 0',
    '--color-border-opacity': '0.1',
    '--color-accent': '124 58 237',
    '--color-accent-hover': '109 40 217',
    '--shadow-color': '0 0 0',
    '--shadow-opacity': '0.1',
  },
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'quest-app-theme';
const THEME_CYCLE: ThemeMode[] = ['dark', 'light', 'system'];

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;

  // Toggle classes
  html.classList.remove('dark', 'light');
  html.classList.add(resolved);

  // Inject CSS custom properties
  const vars = CSS_VARS[resolved];
  for (const [prop, value] of Object.entries(vars)) {
    html.style.setProperty(prop, value);
  }
}

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'dark' || raw === 'light' || raw === 'system') return raw;
  } catch {
    // Access denied
  }
  return 'dark';
}

function persistTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Quota exceeded or access denied
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    const resolved = resolveTheme(stored);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Listen for OS-level color-scheme changes when mode is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = resolveTheme('system');
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [theme]);

  // Listen for cross-tab storage changes
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const newMode = (e.newValue as ThemeMode) || 'dark';
      setThemeState(newMode);
      const resolved = resolveTheme(newMode);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    persistTheme(mode);
    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = THEME_CYCLE.indexOf(prev);
      const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
      persistTheme(next);
      const resolved = resolveTheme(next);
      setResolvedTheme(resolved);
      applyTheme(resolved);
      return next;
    });
  }, []);

  const value: ThemeContextValue = { theme, resolvedTheme, setTheme, toggleTheme };

  return React.createElement(ThemeContext.Provider, { value }, children);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the current theme and controls.
 *
 * Must be used within a `<ThemeProvider>`.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
