import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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

import ChangelogPage from '@/app/(app)/changelog/page';

describe('ChangelogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page header', () => {
    render(<ChangelogPage />);
    expect(screen.getByText('Novedades')).toBeInTheDocument();
  });

  it('renders version numbers', () => {
    render(<ChangelogPage />);
    expect(screen.getByText('v1.3.0')).toBeInTheDocument();
    expect(screen.getByText('v1.2.0')).toBeInTheDocument();
    expect(screen.getByText('v1.1.0')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('shows category filter buttons', () => {
    render(<ChangelogPage />);
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Nueva funcionalidad')).toBeInTheDocument();
    expect(screen.getByText('Mejora')).toBeInTheDocument();
    expect(screen.getByText('Correccion')).toBeInTheDocument();
  });

  it('search filters entries by text', () => {
    render(<ChangelogPage />);

    const searchInput = screen.getByPlaceholderText('Buscar cambios...');
    fireEvent.change(searchInput, { target: { value: 'moderacion' } });

    // v1.3.0 has moderation-related entries
    expect(screen.getByText('v1.3.0')).toBeInTheDocument();
    // Other versions should be filtered out (no matching changes)
    expect(screen.queryByText('v1.0.0')).not.toBeInTheDocument();
  });

  it('shows "Ultimo" badge on the latest version', () => {
    render(<ChangelogPage />);
    expect(screen.getByText('Ultimo')).toBeInTheDocument();
  });

  it('shows entry titles', () => {
    render(<ChangelogPage />);
    expect(screen.getByText('Content Moderation & Community Safety')).toBeInTheDocument();
    expect(screen.getByText('Seasonal Events & Weather Integration')).toBeInTheDocument();
    expect(screen.getByText('GDPR Compliance & Data Rights')).toBeInTheDocument();
    expect(screen.getByText('Initial Launch - QuestMaster')).toBeInTheDocument();
  });

  it('filters by category when filter button clicked', () => {
    render(<ChangelogPage />);

    // Click "Correccion" (bugfix) filter
    const bugfixButton = screen.getByText('Correccion');
    fireEvent.click(bugfixButton);

    // Should still see versions that have bugfix entries
    expect(screen.getByText('v1.3.0')).toBeInTheDocument();
    // v1.0.0 has no bugfix entries
    expect(screen.queryByText('v1.0.0')).not.toBeInTheDocument();
  });

  it('shows empty state when search has no results', () => {
    render(<ChangelogPage />);

    const searchInput = screen.getByPlaceholderText('Buscar cambios...');
    fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });

    expect(screen.getByText('No se encontraron cambios con los filtros actuales')).toBeInTheDocument();
  });

  it('shows dates for each entry', () => {
    render(<ChangelogPage />);
    expect(screen.getByText('15 Mar 2026')).toBeInTheDocument();
    expect(screen.getByText('25 Ene 2026')).toBeInTheDocument();
  });
});
