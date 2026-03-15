import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState from '@/components/ui/ErrorState';
import { ShieldAlert } from 'lucide-react';

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
              { ref, className, onClick, style, role: props['role'], 'data-testid': props['data-testid'] },
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

describe('ErrorState', () => {
  it('renders the default error message', () => {
    render(<ErrorState />);
    expect(screen.getByText('Ha ocurrido un error inesperado.')).toBeInTheDocument();
  });

  it('renders a custom error message', () => {
    render(<ErrorState message="Connection failed" />);
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<ErrorState />);
    expect(screen.getByText('Algo salio mal')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<ErrorState />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);
    const retryButton = screen.getByText('Reintentar');
    expect(retryButton).toBeInTheDocument();
  });

  it('does not show retry button when onRetry is not provided', () => {
    render(<ErrorState />);
    expect(screen.queryByText('Reintentar')).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);
    fireEvent.click(screen.getByText('Reintentar'));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders with custom icon', () => {
    const { container } = render(<ErrorState icon={ShieldAlert} />);
    // The custom icon renders as an SVG
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('shows support link', () => {
    render(<ErrorState />);
    const supportLink = screen.getByText('Contactar soporte');
    expect(supportLink).toBeInTheDocument();
    expect(supportLink.closest('a')).toHaveAttribute('href', 'mailto:soporte@questmaster.app');
  });

  it('supports custom support href', () => {
    render(<ErrorState supportHref="https://help.example.com" />);
    const supportLink = screen.getByText('Contactar soporte');
    expect(supportLink.closest('a')).toHaveAttribute('href', 'https://help.example.com');
  });

  it('applies custom className', () => {
    const { container } = render(<ErrorState className="my-custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('my-custom-class');
  });
});
