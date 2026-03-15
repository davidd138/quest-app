import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies violet color variant classes by default', () => {
    render(<Badge>Test</Badge>);
    const badge = screen.getByText('Test').closest('span');
    expect(badge?.className).toContain('bg-violet-500/15');
    expect(badge?.className).toContain('text-violet-300');
    expect(badge?.className).toContain('border-violet-500/30');
  });

  it('applies emerald color variant classes', () => {
    render(<Badge color="emerald">Success</Badge>);
    const badge = screen.getByText('Success').closest('span');
    expect(badge?.className).toContain('bg-emerald-500/15');
    expect(badge?.className).toContain('text-emerald-300');
    expect(badge?.className).toContain('border-emerald-500/30');
  });

  it('applies amber color variant classes', () => {
    render(<Badge color="amber">Warning</Badge>);
    const badge = screen.getByText('Warning').closest('span');
    expect(badge?.className).toContain('bg-amber-500/15');
    expect(badge?.className).toContain('text-amber-300');
  });

  it('applies rose color variant classes', () => {
    render(<Badge color="rose">Error</Badge>);
    const badge = screen.getByText('Error').closest('span');
    expect(badge?.className).toContain('bg-rose-500/15');
    expect(badge?.className).toContain('text-rose-300');
  });

  it('shows dot indicator when dot prop is true', () => {
    const { container } = render(<Badge dot>Status</Badge>);
    const dot = container.querySelector('.rounded-full.w-1\\.5');
    expect(dot).toBeInTheDocument();
  });

  it('does not show dot indicator by default', () => {
    const { container } = render(<Badge>Status</Badge>);
    const dot = container.querySelector('.rounded-full.w-1\\.5');
    expect(dot).not.toBeInTheDocument();
  });

  it('dot uses correct color matching badge color', () => {
    const { container } = render(
      <Badge color="emerald" dot>
        Online
      </Badge>,
    );
    const dot = container.querySelector('.rounded-full.w-1\\.5');
    expect(dot?.className).toContain('bg-emerald-400');
  });

  it('applies sm size classes', () => {
    render(<Badge size="sm">Small</Badge>);
    const badge = screen.getByText('Small').closest('span');
    expect(badge?.className).toContain('px-2');
    expect(badge?.className).toContain('py-0.5');
    expect(badge?.className).toContain('text-[10px]');
  });

  it('applies md size classes by default', () => {
    render(<Badge>Medium</Badge>);
    const badge = screen.getByText('Medium').closest('span');
    expect(badge?.className).toContain('px-2.5');
    expect(badge?.className).toContain('py-1');
    expect(badge?.className).toContain('text-xs');
  });

  it('applies custom className', () => {
    render(<Badge className="my-custom">Custom</Badge>);
    const badge = screen.getByText('Custom').closest('span');
    expect(badge?.className).toContain('my-custom');
  });
});
