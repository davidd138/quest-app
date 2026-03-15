import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Stepper from '@/components/ui/Stepper';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        const Component = React.forwardRef(
          (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
            const {
              children,
              className,
              onClick,
              style,
              disabled,
              type,
              ...rest
            } = props;
            void rest;
            return React.createElement(
              prop,
              {
                ref,
                className,
                onClick,
                style,
                disabled,
                type,
                'data-testid': props['data-testid'],
                role: props['role'],
                'aria-current': props['aria-current'],
                'aria-label': props['aria-label'],
              },
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

// Mock lucide-react Check icon
vi.mock('lucide-react', () => ({
  Check: (props: Record<string, unknown>) =>
    React.createElement('svg', { 'data-testid': 'check-icon', ...props }),
}));

const steps = [
  { id: 'step-1', label: 'Inicio' },
  { id: 'step-2', label: 'Detalles' },
  { id: 'step-3', label: 'Ubicación' },
  { id: 'step-4', label: 'Resumen' },
];

describe('Stepper', () => {
  it('renders the correct number of steps', () => {
    render(<Stepper steps={steps} currentStep={0} />);
    // Each step has a label
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Detalles')).toBeInTheDocument();
    expect(screen.getByText('Ubicación')).toBeInTheDocument();
    expect(screen.getByText('Resumen')).toBeInTheDocument();
  });

  it('highlights the current step', () => {
    render(<Stepper steps={steps} currentStep={1} />);
    // The current step button should have aria-current="step"
    const currentButton = screen.getByLabelText('Detalles (current)');
    expect(currentButton).toHaveAttribute('aria-current', 'step');
  });

  it('shows check icon for completed steps', () => {
    render(<Stepper steps={steps} currentStep={2} />);
    // Steps 0 and 1 are completed (index < currentStep)
    const checkIcons = screen.getAllByTestId('check-icon');
    expect(checkIcons).toHaveLength(2);
  });

  it('labels completed steps correctly in aria-label', () => {
    render(<Stepper steps={steps} currentStep={2} />);
    expect(screen.getByLabelText('Inicio (completed)')).toBeInTheDocument();
    expect(screen.getByLabelText('Detalles (completed)')).toBeInTheDocument();
  });

  it('displays step numbers for upcoming steps', () => {
    render(<Stepper steps={steps} currentStep={1} />);
    // Steps 2 and 3 (indices 2,3) should show numbers 3 and 4
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('fires click callback when allowNavigation is true', () => {
    const handleClick = vi.fn();
    render(
      <Stepper
        steps={steps}
        currentStep={2}
        onStepClick={handleClick}
        allowNavigation={true}
      />,
    );

    // Click a completed step
    fireEvent.click(screen.getByLabelText('Inicio (completed)'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(0);
  });

  it('does not fire click callback when allowNavigation is false', () => {
    const handleClick = vi.fn();
    render(
      <Stepper
        steps={steps}
        currentStep={2}
        onStepClick={handleClick}
        allowNavigation={false}
      />,
    );

    fireEvent.click(screen.getByLabelText('Inicio (completed)'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not fire click for upcoming steps even with allowNavigation', () => {
    const handleClick = vi.fn();
    render(
      <Stepper
        steps={steps}
        currentStep={1}
        onStepClick={handleClick}
        allowNavigation={true}
      />,
    );

    // Step at index 2 is upcoming — should not be clickable
    fireEvent.click(screen.getByLabelText('Ubicación'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders navigation landmark', () => {
    render(<Stepper steps={steps} currentStep={0} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
