import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

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

import { OnboardingTour } from '@/components/quest/OnboardingTour';

const STORAGE_KEY = 'qm-onboarding-completed';

describe('OnboardingTour', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows when no completion in localStorage', () => {
    render(<OnboardingTour forceShow />);
    expect(screen.getByRole('dialog', { name: /onboarding tour/i })).toBeInTheDocument();
    expect(screen.getByText('Bienvenido a QuestMaster')).toBeInTheDocument();
  });

  it('is hidden when already completed', () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    render(<OnboardingTour />);

    // Even after timeout, should not show
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('steps navigation works — next and previous', () => {
    render(<OnboardingTour forceShow />);

    // First step
    expect(screen.getByText('Bienvenido a QuestMaster')).toBeInTheDocument();

    // Click next
    fireEvent.click(screen.getByText('Siguiente'));
    expect(screen.getByText('Navega por el menu')).toBeInTheDocument();

    // Click next again
    fireEvent.click(screen.getByText('Siguiente'));
    expect(screen.getByText('Explora las quests')).toBeInTheDocument();

    // Click previous
    fireEvent.click(screen.getByText('Anterior'));
    expect(screen.getByText('Navega por el menu')).toBeInTheDocument();
  });

  it('"Omitir" skips tour and saves completion', () => {
    render(<OnboardingTour forceShow />);

    // Click skip (Omitir)
    const skipButtons = screen.getAllByText('Omitir');
    fireEvent.click(skipButtons[0]);

    // Should be hidden
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Should save completion in localStorage
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('saves completion on finish (last step)', () => {
    render(<OnboardingTour forceShow />);

    // Navigate to last step
    fireEvent.click(screen.getByText('Siguiente')); // step 2
    fireEvent.click(screen.getByText('Siguiente')); // step 3
    fireEvent.click(screen.getByText('Siguiente')); // step 4
    expect(screen.getByText('Finalizar')).toBeInTheDocument();

    // Click Finalizar
    fireEvent.click(screen.getByText('Finalizar'));

    // Tour should be hidden
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Saved in localStorage
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });
});
