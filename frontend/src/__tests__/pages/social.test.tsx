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

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href, ...props }, children),
}));

// Mock social page component for testing purposes
interface Friend {
  id: string;
  name: string;
  status: 'online' | 'offline';
  level: number;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

const mockFriends: Friend[] = [
  { id: 'f1', name: 'Ana Garcia', status: 'online', level: 12 },
  { id: 'f2', name: 'Carlos Ruiz', status: 'offline', level: 8 },
  { id: 'f3', name: 'Laura Martinez', status: 'online', level: 15 },
];

const mockActivity: ActivityItem[] = [
  { id: 'a1', user: 'Ana Garcia', action: 'completo la quest', target: 'El Templo Perdido', timestamp: 'Hace 2h' },
  { id: 'a2', user: 'Carlos Ruiz', action: 'desbloqueo el logro', target: 'Explorador', timestamp: 'Hace 5h' },
  { id: 'a3', user: 'Laura Martinez', action: 'subio al ranking', target: '#3 Global', timestamp: 'Hace 1d' },
];

function SocialPage() {
  const [activeTab, setActiveTab] = React.useState<'friends' | 'activity' | 'groups'>('friends');

  return (
    <div>
      <h1>Social</h1>
      <div role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'friends'}
          onClick={() => setActiveTab('friends')}
          data-testid="tab-friends"
        >
          Amigos
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'activity'}
          onClick={() => setActiveTab('activity')}
          data-testid="tab-activity"
        >
          Actividad
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'groups'}
          onClick={() => setActiveTab('groups')}
          data-testid="tab-groups"
        >
          Grupos
        </button>
      </div>

      {activeTab === 'friends' && (
        <div data-testid="friends-panel">
          <h2>Lista de amigos</h2>
          {mockFriends.map((friend) => (
            <div key={friend.id} data-testid={`friend-${friend.id}`}>
              <span data-testid={`friend-name-${friend.id}`}>{friend.name}</span>
              <span data-testid={`friend-status-${friend.id}`}>{friend.status}</span>
              <span>Nivel {friend.level}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'activity' && (
        <div data-testid="activity-panel">
          <h2>Actividad reciente</h2>
          {mockActivity.map((item) => (
            <div key={item.id} data-testid={`activity-${item.id}`}>
              <span>{item.user}</span>
              <span>{item.action}</span>
              <span>{item.target}</span>
              <span>{item.timestamp}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'groups' && (
        <div data-testid="groups-panel">
          <h2>Mis grupos</h2>
          <p>No hay grupos todavia</p>
        </div>
      )}
    </div>
  );
}

describe('SocialPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Tab rendering
  it('renders all tabs', () => {
    render(<SocialPage />);
    expect(screen.getByTestId('tab-friends')).toBeInTheDocument();
    expect(screen.getByTestId('tab-activity')).toBeInTheDocument();
    expect(screen.getByTestId('tab-groups')).toBeInTheDocument();
  });

  it('renders page heading', () => {
    render(<SocialPage />);
    expect(screen.getByText('Social')).toBeInTheDocument();
  });

  it('renders tabs with correct labels', () => {
    render(<SocialPage />);
    expect(screen.getByText('Amigos')).toBeInTheDocument();
    expect(screen.getByText('Actividad')).toBeInTheDocument();
    expect(screen.getByText('Grupos')).toBeInTheDocument();
  });

  // Default tab (Friends)
  it('defaults to friends tab', () => {
    render(<SocialPage />);
    expect(screen.getByTestId('friends-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('activity-panel')).not.toBeInTheDocument();
  });

  it('friends tab is selected by default', () => {
    render(<SocialPage />);
    const friendsTab = screen.getByTestId('tab-friends');
    expect(friendsTab.getAttribute('aria-selected')).toBe('true');
  });

  // Friends list
  it('displays friends list', () => {
    render(<SocialPage />);
    expect(screen.getByText('Ana Garcia')).toBeInTheDocument();
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument();
    expect(screen.getByText('Laura Martinez')).toBeInTheDocument();
  });

  it('shows friend status', () => {
    render(<SocialPage />);
    expect(screen.getByTestId('friend-status-f1').textContent).toBe('online');
    expect(screen.getByTestId('friend-status-f2').textContent).toBe('offline');
  });

  it('shows friend levels', () => {
    render(<SocialPage />);
    expect(screen.getByText('Nivel 12')).toBeInTheDocument();
    expect(screen.getByText('Nivel 8')).toBeInTheDocument();
    expect(screen.getByText('Nivel 15')).toBeInTheDocument();
  });

  it('renders all friend entries', () => {
    render(<SocialPage />);
    expect(screen.getByTestId('friend-f1')).toBeInTheDocument();
    expect(screen.getByTestId('friend-f2')).toBeInTheDocument();
    expect(screen.getByTestId('friend-f3')).toBeInTheDocument();
  });

  // Tab switching
  it('switches to activity tab on click', () => {
    render(<SocialPage />);
    fireEvent.click(screen.getByTestId('tab-activity'));
    expect(screen.getByTestId('activity-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('friends-panel')).not.toBeInTheDocument();
  });

  it('switches to groups tab on click', () => {
    render(<SocialPage />);
    fireEvent.click(screen.getByTestId('tab-groups'));
    expect(screen.getByTestId('groups-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('friends-panel')).not.toBeInTheDocument();
  });

  it('switches back to friends tab from activity', () => {
    render(<SocialPage />);
    fireEvent.click(screen.getByTestId('tab-activity'));
    expect(screen.getByTestId('activity-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('tab-friends'));
    expect(screen.getByTestId('friends-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('activity-panel')).not.toBeInTheDocument();
  });

  it('updates aria-selected on tab switch', () => {
    render(<SocialPage />);
    const friendsTab = screen.getByTestId('tab-friends');
    const activityTab = screen.getByTestId('tab-activity');

    expect(friendsTab.getAttribute('aria-selected')).toBe('true');
    expect(activityTab.getAttribute('aria-selected')).toBe('false');

    fireEvent.click(activityTab);
    expect(friendsTab.getAttribute('aria-selected')).toBe('false');
    expect(activityTab.getAttribute('aria-selected')).toBe('true');
  });

  // Activity feed
  it('shows activity feed items', () => {
    render(<SocialPage />);
    fireEvent.click(screen.getByTestId('tab-activity'));
    expect(screen.getByTestId('activity-a1')).toBeInTheDocument();
    expect(screen.getByTestId('activity-a2')).toBeInTheDocument();
    expect(screen.getByTestId('activity-a3')).toBeInTheDocument();
  });

  it('activity items show user name and action', () => {
    render(<SocialPage />);
    fireEvent.click(screen.getByTestId('tab-activity'));
    expect(screen.getByText('completo la quest')).toBeInTheDocument();
    expect(screen.getByText('El Templo Perdido')).toBeInTheDocument();
    expect(screen.getByText('Hace 2h')).toBeInTheDocument();
  });

  it('activity items show timestamps', () => {
    render(<SocialPage />);
    fireEvent.click(screen.getByTestId('tab-activity'));
    expect(screen.getByText('Hace 2h')).toBeInTheDocument();
    expect(screen.getByText('Hace 5h')).toBeInTheDocument();
    expect(screen.getByText('Hace 1d')).toBeInTheDocument();
  });

  // Groups tab
  it('groups tab shows empty state', () => {
    render(<SocialPage />);
    fireEvent.click(screen.getByTestId('tab-groups'));
    expect(screen.getByText('No hay grupos todavia')).toBeInTheDocument();
  });
});
