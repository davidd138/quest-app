import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RewardsPage from '@/app/(app)/rewards/page';

// ---------- Mocks ----------

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target: unknown, prop: string) => {
      const Component = React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
        const { children, className, onClick, style, ...rest } = props;
        void rest;
        return React.createElement(prop, { ref, className, onClick, style, 'data-testid': props['data-testid'] }, children as React.ReactNode);
      });
      Component.displayName = `motion.${prop}`;
      return Component;
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock PointsBalance component
vi.mock('@/components/quest/PointsBalance', () => ({
  default: ({ points }: { points: number; recentEarnings?: unknown[] }) => (
    <div data-testid="points-balance">{points} pts</div>
  ),
}));

// Mock RewardCard component
vi.mock('@/components/quest/RewardCard', () => ({
  default: ({ reward, userPoints, onUnlock }: {
    reward: { id: string; name: string; cost: number; owned: boolean; rarity: string };
    userPoints: number;
    onUnlock: (id: string) => void;
  }) => (
    <div data-testid={`reward-card-${reward.id}`}>
      <span>{reward.name}</span>
      <span data-testid={`reward-cost-${reward.id}`}>{reward.cost}</span>
      <span data-testid={`reward-rarity-${reward.id}`}>{reward.rarity}</span>
      {!reward.owned && userPoints >= reward.cost && (
        <button data-testid={`unlock-btn-${reward.id}`} onClick={() => onUnlock(reward.id)}>
          Unlock
        </button>
      )}
      {reward.owned && <span data-testid={`owned-${reward.id}`}>Owned</span>}
    </div>
  ),
}));

// ---------- Tests ----------

describe('RewardsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Points balance
  it('renders the points balance component', () => {
    render(<RewardsPage />);
    const pointsBalance = screen.getByTestId('points-balance');
    expect(pointsBalance).toBeInTheDocument();
    expect(pointsBalance.textContent).toContain('4850');
  });

  it('renders the page header', () => {
    render(<RewardsPage />);
    expect(screen.getByText('Tienda de Recompensas')).toBeInTheDocument();
  });

  // Tabs
  it('renders all three tabs', () => {
    render(<RewardsPage />);
    expect(screen.getByText('Tienda')).toBeInTheDocument();
    expect(screen.getByText('Mis Recompensas')).toBeInTheDocument();
    expect(screen.getByText('Historial')).toBeInTheDocument();
  });

  it('starts with Shop tab active', () => {
    render(<RewardsPage />);
    const shopTab = screen.getByText('Tienda');
    expect(shopTab.closest('button')?.className).toContain('bg-violet-600');
  });

  it('switches to Owned tab when clicked', () => {
    render(<RewardsPage />);
    fireEvent.click(screen.getByText('Mis Recompensas'));
    const ownedTab = screen.getByText('Mis Recompensas');
    expect(ownedTab.closest('button')?.className).toContain('bg-violet-600');
  });

  it('switches to History tab and shows transaction history', () => {
    render(<RewardsPage />);
    fireEvent.click(screen.getByText('Historial'));
    expect(screen.getByText('Historial de transacciones')).toBeInTheDocument();
  });

  // Reward cards in Shop tab
  it('renders reward cards in the shop (non-owned items)', () => {
    render(<RewardsPage />);
    // Dragon Rider is not owned, should appear in shop
    expect(screen.getByText('Dragon Rider')).toBeInTheDocument();
  });

  it('does not show owned items in shop tab', () => {
    render(<RewardsPage />);
    // Shadow Explorer is owned, should not appear in shop
    const shadowCards = screen.queryAllByText('Shadow Explorer');
    // It might appear in card but the shop filter should exclude it
    // Check that it's not in a reward card in shop mode
    expect(screen.queryByTestId('reward-card-r2')).not.toBeInTheDocument();
  });

  // Category filters
  it('renders all category filter buttons', () => {
    render(<RewardsPage />);
    expect(screen.getByText('Todas')).toBeInTheDocument();
    expect(screen.getByText('Avatares')).toBeInTheDocument();
    expect(screen.getByText('Temas')).toBeInTheDocument();
    expect(screen.getByText('Titulos')).toBeInTheDocument();
    expect(screen.getByText('Insignias')).toBeInTheDocument();
    expect(screen.getByText('Pistas')).toBeInTheDocument();
  });

  it('filters rewards by category when clicking Avatares', () => {
    render(<RewardsPage />);
    fireEvent.click(screen.getByText('Avatares'));
    // Only avatar items should be visible (non-owned in shop)
    // Dragon Rider (avatar, not owned) should be visible
    expect(screen.getByText('Dragon Rider')).toBeInTheDocument();
    // Neon Cyberpunk (theme, not owned) should not be visible
    expect(screen.queryByText('Neon Cyberpunk')).not.toBeInTheDocument();
  });

  it('shows all categories when clicking Todas after filtering', () => {
    render(<RewardsPage />);
    fireEvent.click(screen.getByText('Avatares'));
    fireEvent.click(screen.getByText('Todas'));
    // Theme items should be visible again
    expect(screen.getByText('Neon Cyberpunk')).toBeInTheDocument();
  });

  it('category filter has active styles when selected', () => {
    render(<RewardsPage />);
    fireEvent.click(screen.getByText('Temas'));
    expect(screen.getByText('Temas').closest('button')?.className).toContain('bg-violet-600');
  });

  // Unlock button interaction
  it('renders Unlock button for affordable non-owned rewards', () => {
    render(<RewardsPage />);
    // Dragon Rider costs 2500, user has 4850 -> should have unlock button
    const unlockBtn = screen.getByTestId('unlock-btn-r1');
    expect(unlockBtn).toBeInTheDocument();
  });

  it('marks reward as owned after clicking Unlock', () => {
    render(<RewardsPage />);
    const unlockBtn = screen.getByTestId('unlock-btn-r1');
    fireEvent.click(unlockBtn);
    // After unlocking, the item should disappear from shop (since it's now owned)
    expect(screen.queryByTestId('reward-card-r1')).not.toBeInTheDocument();
  });

  // Owned tab
  it('shows only owned items in the Owned tab', () => {
    render(<RewardsPage />);
    fireEvent.click(screen.getByText('Mis Recompensas'));
    // Shadow Explorer (r2) is owned, should appear
    expect(screen.getByTestId('reward-card-r2')).toBeInTheDocument();
    // Dragon Rider (r1) is not owned, should not appear
    expect(screen.queryByTestId('reward-card-r1')).not.toBeInTheDocument();
  });

  // History tab
  it('shows transaction amounts in history tab', () => {
    render(<RewardsPage />);
    fireEvent.click(screen.getByText('Historial'));
    // Check that transaction descriptions appear
    expect(screen.getByText('Quest: Madrid Tapas Hunt')).toBeInTheDocument();
    expect(screen.getByText('Avatar: Shadow Explorer')).toBeInTheDocument();
  });

  it('shows earn and spend indicators in history', () => {
    render(<RewardsPage />);
    fireEvent.click(screen.getByText('Historial'));
    // Check for + and - amounts
    expect(screen.getByText('+500')).toBeInTheDocument();
    expect(screen.getByText('-1200')).toBeInTheDocument();
  });

  // Empty state
  it('shows empty state message when no rewards match filter in owned tab', () => {
    render(<RewardsPage />);
    fireEvent.click(screen.getByText('Mis Recompensas'));
    // Filter by hints category - no owned hint rewards
    fireEvent.click(screen.getByText('Pistas'));
    expect(screen.getByText(/Aun no tienes recompensas/)).toBeInTheDocument();
  });

  // Seasonal banner
  it('renders seasonal rewards banner in shop tab', () => {
    render(<RewardsPage />);
    expect(screen.getByText('Recompensas de temporada')).toBeInTheDocument();
    expect(screen.getByText('Tiempo limitado')).toBeInTheDocument();
  });

  it('hides seasonal banner in other tabs', () => {
    render(<RewardsPage />);
    fireEvent.click(screen.getByText('Historial'));
    expect(screen.queryByText('Recompensas de temporada')).not.toBeInTheDocument();
  });
});
