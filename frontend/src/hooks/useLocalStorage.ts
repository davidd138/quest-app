'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Type-safe, SSR-safe localStorage hook with JSON serialization.
 *
 * On the server (or when localStorage is unavailable) the hook returns
 * `initialValue` and the setter is a no-op, avoiding hydration mismatches.
 *
 * @example
 * const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Read from localStorage only on the client, after mount.
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // Sync with localStorage on mount (client-only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        setStoredValue(JSON.parse(raw) as T);
      }
    } catch {
      // Corrupt data or access denied — fall back to initial.
    }
    setHydrated(true);
  }, [key]);

  // Listen for cross-tab changes via the `storage` event.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setStoredValue(
          e.newValue !== null ? (JSON.parse(e.newValue) as T) : initialValue,
        );
      } catch {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Quota exceeded or access denied
        }
        return next;
      });
    },
    [key],
  );

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  // Return initialValue before hydration to avoid mismatch.
  const value = hydrated ? storedValue : initialValue;

  return [value, setValue, removeValue];
}
