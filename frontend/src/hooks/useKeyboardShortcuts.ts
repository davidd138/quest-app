'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcutsOptions {
  onToggleShortcutsHelp: () => void;
}

/**
 * Global keyboard shortcuts handler.
 *
 * Supports:
 * - Ctrl/Cmd+K or `/`: Focus search input
 * - Escape: Close modals (handled natively by Modal component)
 * - `?`: Show keyboard shortcuts help
 * - `g d`: Go to dashboard
 * - `g q`: Go to quests
 * - `g l`: Go to leaderboard
 */
export function useKeyboardShortcuts({ onToggleShortcutsHelp }: KeyboardShortcutsOptions) {
  const router = useRouter();
  const pendingKey = useRef<string | null>(null);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isInputFocused = useCallback((): boolean => {
    const active = document.activeElement;
    if (!active) return false;
    const tag = active.tagName.toLowerCase();
    return (
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select' ||
      (active as HTMLElement).isContentEditable
    );
  }, []);

  const focusSearch = useCallback(() => {
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[type="text"][placeholder]',
    );
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  const clearPending = useCallback(() => {
    pendingKey.current = null;
    if (pendingTimeout.current) {
      clearTimeout(pendingTimeout.current);
      pendingTimeout.current = null;
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl/Cmd+K: Focus search (always active, even in inputs)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        focusSearch();
        return;
      }

      // Don't process other shortcuts when typing in an input
      if (isInputFocused()) return;

      // Handle "g" prefix sequences
      if (pendingKey.current === 'g') {
        clearPending();
        switch (e.key) {
          case 'd':
            e.preventDefault();
            router.push('/dashboard');
            return;
          case 'q':
            e.preventDefault();
            router.push('/quests');
            return;
          case 'l':
            e.preventDefault();
            router.push('/leaderboard');
            return;
        }
        return;
      }

      switch (e.key) {
        case '?':
          e.preventDefault();
          onToggleShortcutsHelp();
          break;
        case '/':
          e.preventDefault();
          focusSearch();
          break;
        case 'g':
          e.preventDefault();
          pendingKey.current = 'g';
          pendingTimeout.current = setTimeout(clearPending, 1000);
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearPending();
    };
  }, [router, onToggleShortcutsHelp, isInputFocused, focusSearch, clearPending]);
}
