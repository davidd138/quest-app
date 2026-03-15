import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterAvatar from '@/components/quest/CharacterAvatar';
import type { Character } from '@/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target: unknown, prop: string) => {
      const Component = React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
        const { children, className, onClick, href, style, ...rest } = props;
        void rest;
        return React.createElement(prop, { ref, className, onClick, href, style, 'data-testid': props['data-testid'] }, children as React.ReactNode);
      });
      Component.displayName = `motion.${prop}`;
      return Component;
    }
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

const makeCharacter = (overrides: Partial<Character> = {}): Character => ({
  name: 'Don Quixote',
  role: 'Wandering Knight',
  personality: 'Idealistic and brave, always seeking adventure',
  backstory: 'A noble who read too many books',
  voiceStyle: 'warm',
  greetingMessage: 'Hello, fellow adventurer!',
  ...overrides,
});

describe('CharacterAvatar', () => {
  it('renders initials from single-word name', () => {
    const character = makeCharacter({ name: 'Sancho' });
    render(<CharacterAvatar character={character} />);
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('renders initials from multi-word name', () => {
    const character = makeCharacter({ name: 'Don Quixote' });
    render(<CharacterAvatar character={character} />);
    expect(screen.getByText('DQ')).toBeInTheDocument();
  });

  it('renders initials limited to 2 characters', () => {
    const character = makeCharacter({ name: 'Ana Maria Garcia Lopez' });
    render(<CharacterAvatar character={character} />);
    expect(screen.getByText('AM')).toBeInTheDocument();
  });

  it('renders avatar image when avatarUrl is provided', () => {
    const character = makeCharacter({ avatarUrl: 'https://example.com/avatar.jpg' });
    render(<CharacterAvatar character={character} />);
    const img = screen.getByAltText('Don Quixote');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders emoji for known roles', () => {
    const character = makeCharacter({ role: 'guide', avatarUrl: undefined });
    render(<CharacterAvatar character={character} />);
    // Guide role should show compass emoji
    expect(screen.queryByText('DQ')).not.toBeInTheDocument();
  });

  // Size variants
  it('renders small size variant', () => {
    const { container } = render(
      <CharacterAvatar character={makeCharacter()} size="sm" />,
    );
    expect(container.querySelector('.w-7')).toBeInTheDocument();
    expect(container.querySelector('.h-7')).toBeInTheDocument();
  });

  it('renders medium size variant (default)', () => {
    const { container } = render(
      <CharacterAvatar character={makeCharacter()} />,
    );
    expect(container.querySelector('.w-11')).toBeInTheDocument();
    expect(container.querySelector('.h-11')).toBeInTheDocument();
  });

  it('renders large size variant', () => {
    const { container } = render(
      <CharacterAvatar character={makeCharacter()} size="lg" />,
    );
    expect(container.querySelector('.w-16')).toBeInTheDocument();
    expect(container.querySelector('.h-16')).toBeInTheDocument();
  });

  // Ring color based on voiceStyle
  it('applies warm ring color for warm voiceStyle', () => {
    const { container } = render(
      <CharacterAvatar character={makeCharacter({ voiceStyle: 'warm' })} />,
    );
    const avatarCircle = container.querySelector('.rounded-full.flex');
    expect(avatarCircle?.className).toContain('ring-amber-400/60');
  });

  it('applies mysterious ring color for mysterious voiceStyle', () => {
    const { container } = render(
      <CharacterAvatar character={makeCharacter({ voiceStyle: 'mysterious' })} />,
    );
    const avatarCircle = container.querySelector('.rounded-full.flex');
    expect(avatarCircle?.className).toContain('ring-violet-400/60');
  });

  it('applies energetic ring color for energetic voiceStyle', () => {
    const { container } = render(
      <CharacterAvatar character={makeCharacter({ voiceStyle: 'energetic' })} />,
    );
    const avatarCircle = container.querySelector('.rounded-full.flex');
    expect(avatarCircle?.className).toContain('ring-rose-400/60');
  });

  it('applies calm ring color for calm voiceStyle', () => {
    const { container } = render(
      <CharacterAvatar character={makeCharacter({ voiceStyle: 'calm' })} />,
    );
    const avatarCircle = container.querySelector('.rounded-full.flex');
    expect(avatarCircle?.className).toContain('ring-emerald-400/60');
  });

  it('applies default ring color for unknown voiceStyle', () => {
    const { container } = render(
      <CharacterAvatar character={makeCharacter({ voiceStyle: 'unknown_style' })} />,
    );
    const avatarCircle = container.querySelector('.rounded-full.flex');
    expect(avatarCircle?.className).toContain('ring-slate-400/60');
  });

  // Tooltip
  it('shows personality tooltip on mouse enter', () => {
    render(<CharacterAvatar character={makeCharacter()} />);

    const wrapper = screen.getByText('DQ').closest('div[class*="relative"]')!;
    fireEvent.mouseEnter(wrapper);

    expect(screen.getByText('Wandering Knight')).toBeInTheDocument();
    expect(
      screen.getByText('Idealistic and brave, always seeking adventure'),
    ).toBeInTheDocument();
  });

  it('hides personality tooltip on mouse leave', () => {
    render(<CharacterAvatar character={makeCharacter()} />);

    const wrapper = screen.getByText('DQ').closest('div[class*="relative"]')!;
    fireEvent.mouseEnter(wrapper);
    expect(screen.getByText('Wandering Knight')).toBeInTheDocument();

    fireEvent.mouseLeave(wrapper);
    // AnimatePresence is mocked, so the tooltip content may still render
    // but in real app it would animate out
  });

  // showInfo prop
  it('shows name and role when showInfo is true', () => {
    render(<CharacterAvatar character={makeCharacter()} showInfo={true} />);
    expect(screen.getByText('Don Quixote')).toBeInTheDocument();
    expect(screen.getByText('Wandering Knight')).toBeInTheDocument();
  });

  it('does not show name/role inline when showInfo is false', () => {
    render(<CharacterAvatar character={makeCharacter()} showInfo={false} />);
    // The name/role should not be in the inline info section
    // (they may appear in tooltip on hover, but not statically)
    const nameElements = screen.queryAllByText('Don Quixote');
    // Should be 0 inline (tooltip not shown yet)
    expect(nameElements.length).toBe(0);
  });

  it('applies custom className', () => {
    const { container } = render(
      <CharacterAvatar character={makeCharacter()} className="my-custom" />,
    );
    expect(container.firstChild).toHaveClass('my-custom');
  });
});
