import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '@/components/ui/EmptyState';
import { Search } from 'lucide-react';

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
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}));

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No quests found" />);
    expect(screen.getByText('No quests found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState
        title="No quests"
        description="Start exploring to find new adventures."
      />,
    );
    expect(screen.getByText('Start exploring to find new adventures.')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="Empty" />);
    const paragraphs = container.querySelectorAll('p');
    // No description paragraph (only possible compass label elements)
    const descP = Array.from(paragraphs).find(
      (p) => p.className.includes('text-slate-400') && p.className.includes('leading-relaxed'),
    );
    expect(descP).toBeUndefined();
  });

  it('renders compass illustration by default', () => {
    const { container } = render(<EmptyState title="Empty" />);
    // The compass has a "?" character
    expect(container.textContent).toContain('?');
  });

  it('renders custom icon instead of compass when provided', () => {
    const { container } = render(<EmptyState title="No results" icon={Search} />);
    // Search icon renders as SVG
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
    // No compass "?" text
    const compassQuestion = container.querySelector('.text-violet-400');
    // When icon is provided, the compass is not rendered
    expect(container.innerHTML).not.toContain('N</span>');
  });

  it('shows action button with href as a link', () => {
    render(
      <EmptyState
        title="No quests"
        actionLabel="Discover Quests"
        actionHref="/discover"
      />,
    );
    const link = screen.getByText('Discover Quests').closest('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/discover');
  });

  it('shows action button with onClick handler', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No quests"
        actionLabel="Create Quest"
        onAction={handleAction}
      />,
    );
    fireEvent.click(screen.getByText('Create Quest'));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when no actionLabel', () => {
    render(<EmptyState title="Empty" />);
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });

  it('applies custom className', () => {
    const { container } = render(<EmptyState title="Empty" className="extra-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('extra-class');
  });
});
