import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '@/components/ui/Modal';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        const Component = React.forwardRef(
          (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
            const { children, className, onClick, style, variants, ...rest } = props;
            void rest;
            void variants;
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

describe('Modal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders content when open', () => {
    render(
      <Modal isOpen onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>,
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <Modal isOpen={false} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>,
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <Modal isOpen onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the backdrop', () => {
    render(
      <Modal isOpen onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    // The backdrop has the bg-black/60 class
    const backdrop = document.querySelector('.bg-black\\/60');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the modal', () => {
    render(
      <Modal isOpen onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    fireEvent.click(screen.getByText('Content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows close button that calls onClose', () => {
    render(
      <Modal isOpen onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    // The close button contains an X icon - find button in the header
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find((btn) =>
      btn.className.includes('rounded-lg'),
    );
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders footer when provided', () => {
    render(
      <Modal isOpen onClose={onClose} footer={<button>Save</button>}>
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('does not render footer when not provided', () => {
    render(
      <Modal isOpen onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('sets body overflow to hidden when open', () => {
    render(
      <Modal isOpen onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('resets body overflow when closed', () => {
    const { rerender } = render(
      <Modal isOpen onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('');
  });
});
