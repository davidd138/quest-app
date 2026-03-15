import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CookieConsent } from '@/components/layout/CookieConsent';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        const Component = React.forwardRef(
          (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
            const { children, className, onClick, style, ...rest } = props;
            void rest;
            return React.createElement(
              prop,
              { ref, className, onClick, style, 'data-testid': props['data-testid'] },
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

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => React.createElement('a', { href, ...props }, children),
}));

const STORAGE_KEY = 'qm_cookie_consent';

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows banner when no consent in localStorage', () => {
    render(<CookieConsent />);
    // Banner appears after 1 second delay
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByText('Utilizamos cookies')).toBeInTheDocument();
    expect(screen.getByText('Aceptar todas')).toBeInTheDocument();
  });

  it('hides banner when consent already exists in localStorage', () => {
    const prefs = {
      necessary: true,
      analytics: false,
      functional: false,
      consentedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.queryByText('Utilizamos cookies')).not.toBeInTheDocument();
  });

  it('"Aceptar todas" saves all cookies to localStorage', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    fireEvent.click(screen.getByText('Aceptar todas'));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.necessary).toBe(true);
    expect(stored.analytics).toBe(true);
    expect(stored.functional).toBe(true);
    expect(stored.consentedAt).toBeDefined();
  });

  it('"Solo necesarias" saves only necessary cookies', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    // There are two "Solo necesarias" buttons (banner + config modal actions),
    // click the first one which is in the banner
    const buttons = screen.getAllByText('Solo necesarias');
    fireEvent.click(buttons[0]);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.necessary).toBe(true);
    expect(stored.analytics).toBe(false);
    expect(stored.functional).toBe(false);
  });

  it('"Configurar" opens settings modal', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    fireEvent.click(screen.getByText('Configurar'));

    expect(screen.getByText('Configurar cookies')).toBeInTheDocument();
    expect(screen.getByText('Cookies necesarias')).toBeInTheDocument();
    expect(screen.getByText('Cookies analiticas')).toBeInTheDocument();
    expect(screen.getByText('Cookies funcionales')).toBeInTheDocument();
  });

  it('settings modal has toggles for analytics and functional', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    fireEvent.click(screen.getByText('Configurar'));

    // Analytics and functional toggles are button elements
    const toggleButtons = screen.getAllByRole('button').filter((btn) => {
      return btn.className.includes('rounded-full') && btn.className.includes('w-12');
    });
    // There should be 2 toggles (analytics and functional)
    expect(toggleButtons.length).toBe(2);
  });

  it('saves custom configuration to localStorage', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    fireEvent.click(screen.getByText('Configurar'));

    // Toggle analytics on (first toggle button with w-12 class)
    const toggleButtons = screen.getAllByRole('button').filter((btn) => {
      return btn.className.includes('rounded-full') && btn.className.includes('w-12');
    });
    fireEvent.click(toggleButtons[0]); // analytics toggle

    fireEvent.click(screen.getByText('Guardar preferencias'));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.necessary).toBe(true);
    expect(stored.analytics).toBe(true);
    expect(stored.functional).toBe(false);
  });

  it('privacy policy link is present in the banner', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    const link = screen.getByText('Mas informacion');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/privacy');
  });

  it('privacy policy link is present in the settings modal', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    fireEvent.click(screen.getByText('Configurar'));

    const link = screen.getByText('Consultar Politica de Privacidad completa');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/privacy');
  });

  it('banner hides after accepting all cookies', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByText('Utilizamos cookies')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Aceptar todas'));
    expect(screen.queryByText('Utilizamos cookies')).not.toBeInTheDocument();
  });
});
