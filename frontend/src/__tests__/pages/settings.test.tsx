import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SettingsPage from '@/app/(app)/settings/page';

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

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      userId: 'u-1',
      email: 'maria@example.com',
      name: 'Maria Garcia',
      role: 'player',
      status: 'active',
      totalPoints: 2500,
      questsCompleted: 8,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
    },
    loading: false,
    error: null,
  }),
}));

vi.mock('@/components/ui/Card', () => ({
  default: ({ children, className }: { children: React.ReactNode; variant?: string; padding?: string; className?: string }) => (
    <div className={className} data-testid="card">{children}</div>
  ),
}));

// ---------- Tests ----------

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Section rendering
  it('renders the settings page header', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Ajustes')).toBeInTheDocument();
    expect(screen.getByText('Personaliza tu experiencia en QuestMaster')).toBeInTheDocument();
  });

  it('renders the Notifications section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Notificaciones')).toBeInTheDocument();
  });

  it('renders the Language section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Idioma')).toBeInTheDocument();
  });

  it('renders the Theme section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Tema')).toBeInTheDocument();
  });

  it('renders the Privacy section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Privacidad')).toBeInTheDocument();
  });

  it('renders the Voice settings section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Configuracion de voz')).toBeInTheDocument();
  });

  it('renders the Account section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Cuenta')).toBeInTheDocument();
  });

  // Toggle tests
  it('renders all notification toggles as switches', () => {
    render(<SettingsPage />);
    const toggles = screen.getAllByRole('switch');
    // Should have: 3 notification toggles + 2 privacy toggles + 1 voice toggle = 6
    expect(toggles.length).toBe(6);
  });

  it('renders email notification toggle with correct initial state', () => {
    render(<SettingsPage />);
    const toggles = screen.getAllByRole('switch');
    const emailToggle = toggles[0];
    expect(emailToggle).toBeInTheDocument();
    expect(emailToggle.getAttribute('aria-checked')).toBe('true');
  });

  it('toggles email notification switch on click', () => {
    render(<SettingsPage />);
    const toggles = screen.getAllByRole('switch');
    fireEvent.click(toggles[0]);
    // Re-query after state update
    const updatedToggles = screen.getAllByRole('switch');
    expect(updatedToggles[0].getAttribute('aria-checked')).toBe('false');
  });

  it('toggles push notification switch on click', () => {
    render(<SettingsPage />);
    const toggles = screen.getAllByRole('switch');
    fireEvent.click(toggles[1]);
    const updatedToggles = screen.getAllByRole('switch');
    expect(updatedToggles[1].getAttribute('aria-checked')).toBe('false');
  });

  it('renders in-app notification toggle', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Notificaciones en la app')).toBeInTheDocument();
  });

  it('renders privacy toggles', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Perfil publico')).toBeInTheDocument();
    expect(screen.getByText('Mostrar en el ranking')).toBeInTheDocument();
  });

  // Language selection
  it('renders all language options', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Espanol')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Francais')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
    expect(screen.getByText('Portugues')).toBeInTheDocument();
  });

  it('updates language selection when clicking an option', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByText('English'));
    // After clicking, re-query to get updated DOM
    const updatedEnglish = screen.getByText('English').closest('button');
    expect(updatedEnglish?.className).toContain('violet');
  });

  // Theme selection
  it('renders all theme options', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Oscuro')).toBeInTheDocument();
    expect(screen.getByText('Claro')).toBeInTheDocument();
    expect(screen.getByText('Sistema')).toBeInTheDocument();
  });

  it('updates theme selection when clicking an option', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByText('Claro'));
    // After clicking, re-query to get updated DOM
    const updatedLight = screen.getByText('Claro').closest('button');
    expect(updatedLight?.className).toContain('violet');
  });

  it('defaults to dark theme (Oscuro selected)', () => {
    render(<SettingsPage />);
    const darkButton = screen.getByText('Oscuro');
    expect(darkButton.closest('button')?.className).toContain('violet');
  });

  // Account section
  it('displays user name and email', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
    expect(screen.getByText('maria@example.com')).toBeInTheDocument();
  });

  it('renders Change Password button', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Cambiar contrasena')).toBeInTheDocument();
  });

  it('renders Export Data button', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Exportar mis datos')).toBeInTheDocument();
  });

  it('renders Delete Account button', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Eliminar mi cuenta')).toBeInTheDocument();
  });

  it('navigates to data export page when clicking Export Data', () => {
    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    });

    render(<SettingsPage />);
    fireEvent.click(screen.getByText('Exportar mis datos'));
    expect(window.location.href).toBe('/profile/data');

    // Restore
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  // Voice settings
  it('renders microphone selector', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Microfono')).toBeInTheDocument();
    const select = screen.getByDisplayValue('Microfono predeterminado');
    expect(select).toBeInTheDocument();
  });

  it('renders auto-connect toggle', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Auto-conectar microfono')).toBeInTheDocument();
  });
});
