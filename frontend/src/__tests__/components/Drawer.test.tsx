import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Drawer from '@/components/ui/Drawer';

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
              variants,
              drag,
              dragControls,
              dragConstraints,
              dragElastic,
              onDragEnd,
              onPointerDown,
              ...rest
            } = props;
            void rest;
            void variants;
            void drag;
            void dragControls;
            void dragConstraints;
            void dragElastic;
            void onDragEnd;
            return React.createElement(
              prop,
              {
                ref,
                className,
                onClick,
                style,
                onPointerDown,
                'data-testid': props['data-testid'],
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
  useDragControls: () => ({
    start: vi.fn(),
  }),
}));

describe('Drawer', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders content when open', () => {
    render(
      <Drawer isOpen onClose={onClose}>
        <p>Drawer content</p>
      </Drawer>,
    );
    expect(screen.getByText('Drawer content')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <Drawer isOpen={false} onClose={onClose}>
        <p>Drawer content</p>
      </Drawer>,
    );
    expect(screen.queryByText('Drawer content')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Drawer isOpen onClose={onClose} title="Settings">
        <p>Content</p>
      </Drawer>,
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <Drawer isOpen onClose={onClose}>
        <p>Content</p>
      </Drawer>,
    );
    const backdrop = screen.getByTestId('drawer-backdrop');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <Drawer isOpen onClose={onClose}>
        <p>Content</p>
      </Drawer>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders drag handle', () => {
    render(
      <Drawer isOpen onClose={onClose}>
        <p>Content</p>
      </Drawer>,
    );
    const handle = screen.getByTestId('drawer-handle');
    expect(handle).toBeInTheDocument();
  });

  it('sets body overflow to hidden when open', () => {
    render(
      <Drawer isOpen onClose={onClose}>
        <p>Content</p>
      </Drawer>,
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('resets body overflow when closed', () => {
    const { rerender } = render(
      <Drawer isOpen onClose={onClose}>
        <p>Content</p>
      </Drawer>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Drawer isOpen={false} onClose={onClose}>
        <p>Content</p>
      </Drawer>,
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('has dialog role and aria-modal', () => {
    render(
      <Drawer isOpen onClose={onClose}>
        <p>Content</p>
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
