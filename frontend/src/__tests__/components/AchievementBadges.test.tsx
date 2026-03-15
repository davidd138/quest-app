import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AchievementBadge, {
  ALL_BADGE_TYPES,
  BADGE_META,
} from '@/components/quest/AchievementBadges';
import type { AchievementBadgeType, BadgeSize } from '@/components/quest/AchievementBadges';

// Mock framer-motion (not used by this component, but just in case)
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

describe('AchievementBadge', () => {
  // ---- SVG rendering ----

  it('renders an SVG element for each badge type', () => {
    for (const type of ALL_BADGE_TYPES) {
      const { container, unmount } = render(
        <AchievementBadge type={type} earned />,
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      unmount();
    }
  });

  it('SVG has role="img" and aria-label with badge name', () => {
    const { container } = render(
      <AchievementBadge type="first_quest" earned />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg?.getAttribute('aria-label')).toContain('First Quest');
  });

  // ---- Earned vs unearned ----

  it('earned badge does NOT have grayscale class', () => {
    const { container } = render(
      <AchievementBadge type="perfect_score" earned />,
    );
    const svg = container.querySelector('svg');
    expect(svg?.className.baseVal ?? svg?.getAttribute('class') ?? '').not.toContain('grayscale');
  });

  it('unearned badge has grayscale class', () => {
    const { container } = render(
      <AchievementBadge type="perfect_score" earned={false} />,
    );
    const svg = container.querySelector('svg');
    const cls = svg?.className.baseVal ?? svg?.getAttribute('class') ?? '';
    expect(cls).toContain('grayscale');
  });

  it('unearned badge has reduced opacity class', () => {
    const { container } = render(
      <AchievementBadge type="speed_runner" earned={false} />,
    );
    const svg = container.querySelector('svg');
    const cls = svg?.className.baseVal ?? svg?.getAttribute('class') ?? '';
    expect(cls).toContain('opacity-40');
  });

  // ---- Size variants ----

  it.each<[BadgeSize, number]>([
    ['sm', 48],
    ['md', 80],
    ['lg', 120],
  ])('size="%s" renders SVG with width=%d', (size, expectedPx) => {
    const { container } = render(
      <AchievementBadge type="night_owl" size={size} earned />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', String(expectedPx));
    expect(svg).toHaveAttribute('height', String(expectedPx));
  });

  it('defaults to md size when size prop is omitted', () => {
    const { container } = render(
      <AchievementBadge type="world_traveler" earned />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('height', '80');
  });

  // ---- Tooltip ----

  it('shows tooltip with badge name on hover', () => {
    const { container } = render(
      <AchievementBadge type="riddle_master" earned />,
    );

    const wrapper = container.firstChild as HTMLElement;

    // Tooltip should not be visible initially
    expect(screen.queryByText('Riddle Master')).not.toBeInTheDocument();

    // Hover
    fireEvent.mouseEnter(wrapper);
    expect(screen.getByText('Riddle Master')).toBeInTheDocument();

    // Mouse leave hides it
    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByText('Riddle Master')).not.toBeInTheDocument();
  });

  it('tooltip shows "Not yet earned" for unearned badges', () => {
    const { container } = render(
      <AchievementBadge type="streak_champion" earned={false} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(wrapper);

    expect(screen.getByText('Not yet earned')).toBeInTheDocument();
  });

  it('tooltip shows badge description', () => {
    const { container } = render(
      <AchievementBadge type="community_creator" earned />,
    );

    const wrapper = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(wrapper);

    expect(
      screen.getByText(BADGE_META.community_creator.description),
    ).toBeInTheDocument();
  });

  // ---- Edge cases ----

  it('applies custom className', () => {
    const { container } = render(
      <AchievementBadge type="first_quest" earned className="my-custom" />,
    );
    expect(container.firstChild).toHaveClass('my-custom');
  });

  it('all badge types have metadata entries', () => {
    for (const type of ALL_BADGE_TYPES) {
      expect(BADGE_META[type]).toBeDefined();
      expect(BADGE_META[type].name).toBeTruthy();
      expect(BADGE_META[type].description).toBeTruthy();
    }
  });
});
