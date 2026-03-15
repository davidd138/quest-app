import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { I18nProvider } from '@/lib/i18n';

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

// Mock useReducedMotion
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
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
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

function renderWithProviders() {
  return render(
    React.createElement(I18nProvider, null, React.createElement(LanguageSwitcher)),
  );
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('renders ES and EN options', () => {
    renderWithProviders();
    expect(screen.getByText('ES')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('renders as a button with accessible label', () => {
    renderWithProviders();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label');
  });

  it('click switches language from ES to EN', () => {
    renderWithProviders();

    // Default is ES — the ES label should be highlighted (text-white)
    const esLabel = screen.getByText('ES');
    expect(esLabel.className).toContain('text-white');

    // Click to toggle
    fireEvent.click(screen.getByRole('button'));

    // After toggle, EN should be highlighted
    const enLabel = screen.getByText('EN');
    expect(enLabel.className).toContain('text-white');
  });

  it('click switches language from EN back to ES', () => {
    renderWithProviders();

    // Toggle to EN
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('EN').className).toContain('text-white');

    // Toggle back to ES
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('ES').className).toContain('text-white');
  });

  it('active language label is highlighted with text-white', () => {
    renderWithProviders();

    // Default ES is active
    const esLabel = screen.getByText('ES');
    const enLabel = screen.getByText('EN');

    expect(esLabel.className).toContain('text-white');
    expect(enLabel.className).toContain('text-slate-500');
  });
});
