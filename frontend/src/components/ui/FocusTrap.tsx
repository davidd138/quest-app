'use client';

import React, { useRef, useEffect, useCallback } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
].join(', ');

interface FocusTrapProps {
  /** Whether the trap is active */
  active: boolean;
  /** Element to return focus to when the trap is deactivated. If not provided, uses the element that was focused before activation. */
  returnFocusTo?: HTMLElement | null;
  /** Called when the user presses Escape */
  onEscape?: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Traps keyboard focus within its children while active.
 * Returns focus to the previously focused element on deactivation.
 * ARIA-compliant focus management for modals and dialogs.
 */
export default function FocusTrap({
  active,
  returnFocusTo,
  onEscape,
  children,
  className,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element when the trap activates
  useEffect(() => {
    if (active) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the first focusable element inside the container
      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;
        const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          // If no focusable elements, focus the container itself
          container.setAttribute('tabindex', '-1');
          container.focus();
        }
      });
    } else {
      // Return focus on deactivation
      const target = returnFocusTo || previousFocusRef.current;
      if (target && typeof target.focus === 'function') {
        target.focus();
      }
    }
  }, [active, returnFocusTo]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!active) return;

      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if focus is on the first element, wrap to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if focus is on the last element, wrap to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [active, onEscape],
  );

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={className}
    >
      {children}
    </div>
  );
}
