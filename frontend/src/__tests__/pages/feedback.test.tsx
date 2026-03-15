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
            const { children, className, onClick, style, type, ...rest } = props;
            void rest;
            return React.createElement(
              prop,
              { ref, className, onClick, style, type, 'data-testid': props['data-testid'] },
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

import FeedbackPage from '@/app/(app)/feedback/page';

describe('FeedbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page header', () => {
    render(<FeedbackPage />);
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Ayudanos a mejorar QuestMaster con tus sugerencias')).toBeInTheDocument();
  });

  it('renders the feedback form tab by default', () => {
    render(<FeedbackPage />);
    expect(screen.getByText('Nuevo feedback')).toBeInTheDocument();
    expect(screen.getByText('Tipo de feedback')).toBeInTheDocument();
  });

  it('renders type selector with all options', () => {
    render(<FeedbackPage />);
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('Funcionalidad')).toBeInTheDocument();
    expect(screen.getByText('Mejora')).toBeInTheDocument();
    expect(screen.getByText('Otro')).toBeInTheDocument();
  });

  it('type selector buttons are clickable', () => {
    render(<FeedbackPage />);

    const funcButton = screen.getByText('Funcionalidad');
    fireEvent.click(funcButton);

    // The button should now be in its selected state (verify it does not throw)
    expect(funcButton).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<FeedbackPage />);
    expect(screen.getByText('Enviar feedback')).toBeInTheDocument();
  });

  it('renders mood selector with all options', () => {
    render(<FeedbackPage />);
    expect(screen.getByText('Frustrado')).toBeInTheDocument();
    expect(screen.getByText('Neutral')).toBeInTheDocument();
    expect(screen.getByText('Contento')).toBeInTheDocument();
  });

  it('mood buttons are clickable', () => {
    render(<FeedbackPage />);

    const happyButton = screen.getByText('Contento');
    fireEvent.click(happyButton);
    expect(happyButton).toBeInTheDocument();
  });

  it('renders title and description inputs', () => {
    render(<FeedbackPage />);
    expect(screen.getByPlaceholderText('Resume tu feedback en una frase')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe tu feedback con el mayor detalle posible...')).toBeInTheDocument();
  });

  it('renders priority selector', () => {
    render(<FeedbackPage />);
    expect(screen.getByText('Baja')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('Critica')).toBeInTheDocument();
  });

  it('renders tab navigation', () => {
    render(<FeedbackPage />);
    expect(screen.getByText('Nuevo feedback')).toBeInTheDocument();
    expect(screen.getByText('Mis envios')).toBeInTheDocument();
    expect(screen.getByText('Votar funcionalidades')).toBeInTheDocument();
  });

  it('switches to history tab', () => {
    render(<FeedbackPage />);

    fireEvent.click(screen.getByText('Mis envios'));

    // Should show existing feedback items
    expect(screen.getByText('Error al cargar mapa en Safari')).toBeInTheDocument();
    expect(screen.getByText('Modo offline para quests')).toBeInTheDocument();
  });

  it('switches to voting tab', () => {
    render(<FeedbackPage />);

    fireEvent.click(screen.getByText('Votar funcionalidades'));

    // Should show feature requests
    expect(screen.getByText('Modo multijugador cooperativo')).toBeInTheDocument();
    expect(screen.getByText('Quests personalizadas por la comunidad')).toBeInTheDocument();
  });

  it('renders screenshot upload area', () => {
    render(<FeedbackPage />);
    expect(screen.getByText('Arrastra una imagen o haz clic para subir')).toBeInTheDocument();
  });
});
