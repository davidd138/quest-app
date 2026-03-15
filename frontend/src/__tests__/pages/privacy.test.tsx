import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrivacyPolicyPage from '@/app/(auth)/privacy/page';

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
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => React.createElement('a', { href, ...props }, children),
}));

describe('PrivacyPolicyPage', () => {
  it('renders page title', () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByText('Politica de Privacidad')).toBeInTheDocument();
  });

  it('contains AEPD reference', () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByText(/Agencia Espanola de Proteccion de Datos \(AEPD\)/),
    ).toBeInTheDocument();
    expect(screen.getByText('www.aepd.es')).toBeInTheDocument();
  });

  it('contains RGPD reference', () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByText(/Reglamento \(UE\) 2016\/679/),
    ).toBeInTheDocument();
  });

  it('contains LOPD-GDD reference', () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByText(/Ley Organica 3\/2018/),
    ).toBeInTheDocument();
  });

  it('contains contact email information', () => {
    render(<PrivacyPolicyPage />);
    // Emails appear as bold text within list items, use getAllByText for multiple occurrences
    const privacyEmails = screen.getAllByText('privacidad@questmaster.es');
    expect(privacyEmails.length).toBeGreaterThanOrEqual(1);
    const dpdEmails = screen.getAllByText('dpd@questmaster.es');
    expect(dpdEmails.length).toBeGreaterThanOrEqual(1);
  });

  it('contains responsible entity information', () => {
    render(<PrivacyPolicyPage />);
    // "QuestMaster S.L." appears in multiple places (header, footer, body)
    const entityNames = screen.getAllByText(/QuestMaster S\.L\./);
    expect(entityNames.length).toBeGreaterThanOrEqual(1);
    const addressMatches = screen.getAllByText(/Calle Ejemplo 123, 28001 Madrid/);
    expect(addressMatches.length).toBeGreaterThanOrEqual(1);
  });

  it('has a back link to login', () => {
    render(<PrivacyPolicyPage />);
    const backLink = screen.getByText('Volver');
    expect(backLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('lists user rights (ARCO+)', () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByText('Acceso')).toBeInTheDocument();
    expect(screen.getByText('Rectificacion')).toBeInTheDocument();
    expect(screen.getByText('Supresion')).toBeInTheDocument();
    expect(screen.getByText('Oposicion')).toBeInTheDocument();
    expect(screen.getByText('Portabilidad')).toBeInTheDocument();
    expect(screen.getByText('Limitacion')).toBeInTheDocument();
  });

  it('contains data retention table', () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByText('Tipo de dato')).toBeInTheDocument();
    expect(screen.getByText('Plazo de conservacion')).toBeInTheDocument();
    expect(screen.getByText('Datos de cuenta')).toBeInTheDocument();
  });

  it('contains cookie policy section', () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByText('10. Politica de cookies')).toBeInTheDocument();
    expect(screen.getByText('qm_cookie_consent')).toBeInTheDocument();
  });
});
