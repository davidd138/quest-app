import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DatePicker from '@/components/ui/DatePicker';

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
              {
                ref,
                className,
                onClick,
                style,
                'data-testid': props['data-testid'],
              },
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

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronLeft: (props: Record<string, unknown>) =>
    React.createElement('svg', { 'data-testid': 'chevron-left', ...props }),
  ChevronRight: (props: Record<string, unknown>) =>
    React.createElement('svg', { 'data-testid': 'chevron-right', ...props }),
  Calendar: (props: Record<string, unknown>) =>
    React.createElement('svg', { 'data-testid': 'calendar-icon', ...props }),
}));

describe('DatePicker', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the trigger button with placeholder', () => {
    render(<DatePicker onChange={onChange} />);
    expect(screen.getByText('Seleccionar fecha')).toBeInTheDocument();
  });

  it('renders calendar grid when opened', () => {
    render(<DatePicker onChange={onChange} />);
    // Click the trigger to open
    fireEvent.click(screen.getByText('Seleccionar fecha'));

    // Should show the calendar with day headers (Spanish)
    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
    expect(screen.getByText('Mié')).toBeInTheDocument();
    expect(screen.getByText('Jue')).toBeInTheDocument();
    expect(screen.getByText('Vie')).toBeInTheDocument();
    expect(screen.getByText('Sáb')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
  });

  it('month navigation works — forward', () => {
    // Start with January 2026
    const jan = new Date(2026, 0, 15);
    render(<DatePicker value={jan} onChange={onChange} />);
    fireEvent.click(screen.getByText('15 ene 2026'));

    expect(screen.getByText('Enero 2026')).toBeInTheDocument();

    // Navigate to next month
    fireEvent.click(screen.getByTestId('chevron-right'));
    expect(screen.getByText('Febrero 2026')).toBeInTheDocument();
  });

  it('month navigation works — backward', () => {
    const march = new Date(2026, 2, 10);
    render(<DatePicker value={march} onChange={onChange} />);
    fireEvent.click(screen.getByText('10 mar 2026'));

    expect(screen.getByText('Marzo 2026')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('chevron-left'));
    expect(screen.getByText('Febrero 2026')).toBeInTheDocument();
  });

  it('day selection calls onChange with correct date', () => {
    const jan = new Date(2026, 0, 1);
    render(<DatePicker value={jan} onChange={onChange} />);
    fireEvent.click(screen.getByText('1 ene 2026'));

    // Click day 20
    fireEvent.click(screen.getByText('20'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const selectedDate: Date = onChange.mock.calls[0][0];
    expect(selectedDate.getDate()).toBe(20);
    expect(selectedDate.getMonth()).toBe(0); // January
    expect(selectedDate.getFullYear()).toBe(2026);
  });

  it('today is highlighted with special styling', () => {
    render(<DatePicker onChange={onChange} />);
    fireEvent.click(screen.getByText('Seleccionar fecha'));

    const today = new Date();
    const todayDay = today.getDate().toString();
    // Find the button with today's date
    const dayButtons = screen.getAllByText(todayDay);
    // At least one should have the ring-violet styling (today indicator)
    const todayButton = dayButtons.find((btn) =>
      btn.className.includes('ring-1'),
    );
    expect(todayButton).toBeDefined();
  });

  it('shows Spanish day labels', () => {
    render(<DatePicker onChange={onChange} />);
    fireEvent.click(screen.getByText('Seleccionar fecha'));

    // Verify Spanish day abbreviations
    const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    dayLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('shows Spanish month names', () => {
    const july = new Date(2026, 6, 15);
    render(<DatePicker value={july} onChange={onChange} />);
    fireEvent.click(screen.getByText('15 jul 2026'));

    expect(screen.getByText('Julio 2026')).toBeInTheDocument();
  });

  it('has a "Hoy" (Today) shortcut button', () => {
    render(<DatePicker onChange={onChange} />);
    fireEvent.click(screen.getByText('Seleccionar fecha'));
    expect(screen.getByText('Hoy')).toBeInTheDocument();
  });

  it('closes calendar after selecting a day (non-range mode)', () => {
    const jan = new Date(2026, 0, 1);
    render(<DatePicker value={jan} onChange={onChange} />);
    fireEvent.click(screen.getByText('1 ene 2026'));

    // Calendar should be open
    expect(screen.getByText('Lun')).toBeInTheDocument();

    // Select a day
    fireEvent.click(screen.getByText('15'));

    // Calendar should close — day headers should not be visible
    expect(screen.queryByText('Lun')).not.toBeInTheDocument();
  });

  it('renders calendar icon', () => {
    render(<DatePicker onChange={onChange} />);
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });
});
