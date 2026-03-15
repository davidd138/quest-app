import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Switch from '@/components/ui/Switch';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        const Component = React.forwardRef(
          (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
            const { children, className, onClick, style, variants, animate, ...rest } = props;
            void rest;
            void variants;
            void animate;
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

describe('Switch', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct role and aria-checked when off', () => {
    render(<Switch checked={false} onChange={onChange} />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveAttribute('aria-checked', 'false');
  });

  it('renders with aria-checked true when on', () => {
    render(<Switch checked={true} onChange={onChange} />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange with toggled value when clicked', () => {
    render(<Switch checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when currently checked', () => {
    render(<Switch checked={true} onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('does not call onChange when disabled', () => {
    render(<Switch checked={false} onChange={onChange} disabled />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeDisabled();
    fireEvent.click(switchEl);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders label text', () => {
    render(<Switch checked={false} onChange={onChange} label="Dark mode" />);
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('has aria-label when label is provided', () => {
    render(<Switch checked={false} onChange={onChange} label="Notifications" />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-label', 'Notifications');
  });

  it('applies violet color class when checked', () => {
    render(<Switch checked={true} onChange={onChange} />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl.className).toContain('bg-violet-600');
  });

  it('applies gray color class when unchecked', () => {
    render(<Switch checked={false} onChange={onChange} />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl.className).toContain('bg-slate-600');
  });

  it('applies opacity when disabled', () => {
    render(<Switch checked={false} onChange={onChange} disabled />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl.className).toContain('opacity-50');
  });
});
