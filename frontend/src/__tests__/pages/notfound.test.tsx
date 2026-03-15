import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        if (prop === 'svg' || prop === 'div' || prop === 'h1' || prop === 'p') {
          const Component = React.forwardRef(
            (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
              const { children, className, style, animate, initial, transition, ...rest } = props;
              void animate;
              void initial;
              void transition;
              void rest;
              if (prop === 'svg') {
                return React.createElement('svg', { ref, className, style, 'data-testid': props['data-testid'], xmlns: props.xmlns, width: props.width, height: props.height, viewBox: props.viewBox, fill: props.fill, stroke: props.stroke, strokeWidth: props.strokeWidth, strokeLinecap: props.strokeLinecap, strokeLinejoin: props.strokeLinejoin }, children as React.ReactNode);
              }
              return React.createElement(prop, { ref, className, style, 'data-testid': props['data-testid'] }, children as React.ReactNode);
            },
          );
          Component.displayName = `motion.${prop}`;
          return Component;
        }
        const Component = React.forwardRef(
          (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
            const { children, className, style, ...rest } = props;
            void rest;
            return React.createElement('div', { ref, className, style }, children as React.ReactNode);
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
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('NotFound Page', () => {
  it('renders the heading', () => {
    render(<NotFound />);
    expect(screen.getByText('Lost in the quest?')).toBeInTheDocument();
  });

  it('renders the error description', () => {
    render(<NotFound />);
    expect(
      screen.getByText("The page you're looking for doesn't exist."),
    ).toBeInTheDocument();
  });

  it('renders Back to Dashboard link', () => {
    render(<NotFound />);
    const dashboardLink = screen.getByText('Back to Dashboard');
    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard');
  });

  it('renders Browse Quests link', () => {
    render(<NotFound />);
    const questsLink = screen.getByText('Browse Quests');
    expect(questsLink.closest('a')).toHaveAttribute('href', '/quests');
  });

  it('renders compass icon (SVG element)', () => {
    const { container } = render(<NotFound />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders search suggestion links', () => {
    render(<NotFound />);
    expect(screen.getByText('Quests')).toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('Discover')).toBeInTheDocument();
  });
});
