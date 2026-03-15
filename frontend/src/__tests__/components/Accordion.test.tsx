import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Accordion from '@/components/ui/Accordion';

// Mock framer-motion to render plain elements
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
              prop === 'span' ? 'span' : 'div',
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

const items = [
  { key: 'a', title: 'Section A', content: 'Content A' },
  { key: 'b', title: 'Section B', content: 'Content B' },
  { key: 'c', title: 'Section C', content: 'Content C' },
];

describe('Accordion', () => {
  it('renders all item titles', () => {
    render(<Accordion items={items} />);
    expect(screen.getByText('Section A')).toBeInTheDocument();
    expect(screen.getByText('Section B')).toBeInTheDocument();
    expect(screen.getByText('Section C')).toBeInTheDocument();
  });

  it('does not show content by default', () => {
    render(<Accordion items={items} />);
    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
    expect(screen.queryByText('Content B')).not.toBeInTheDocument();
  });

  it('expands content when the header is clicked', () => {
    render(<Accordion items={items} />);
    fireEvent.click(screen.getByText('Section A'));
    expect(screen.getByText('Content A')).toBeInTheDocument();
  });

  it('collapses content when the header is clicked again', () => {
    render(<Accordion items={items} />);
    fireEvent.click(screen.getByText('Section A'));
    expect(screen.getByText('Content A')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Section A'));
    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
  });

  it('in single mode, opening one item closes the other', () => {
    render(<Accordion items={items} />);
    fireEvent.click(screen.getByText('Section A'));
    expect(screen.getByText('Content A')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Section B'));
    expect(screen.getByText('Content B')).toBeInTheDocument();
    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
  });

  it('in multi mode, multiple items can be open simultaneously', () => {
    render(<Accordion items={items} multiple />);
    fireEvent.click(screen.getByText('Section A'));
    fireEvent.click(screen.getByText('Section B'));
    expect(screen.getByText('Content A')).toBeInTheDocument();
    expect(screen.getByText('Content B')).toBeInTheDocument();
  });

  it('toggles with keyboard Enter key', () => {
    render(<Accordion items={items} />);
    const button = screen.getByText('Section A').closest('button')!;
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(screen.getByText('Content A')).toBeInTheDocument();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
  });

  it('toggles with keyboard Space key', () => {
    render(<Accordion items={items} />);
    const button = screen.getByText('Section B').closest('button')!;
    fireEvent.keyDown(button, { key: ' ' });
    expect(screen.getByText('Content B')).toBeInTheDocument();
  });

  it('sets aria-expanded correctly', () => {
    render(<Accordion items={items} />);
    const button = screen.getByText('Section A').closest('button')!;
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('respects defaultOpen prop', () => {
    render(<Accordion items={items} defaultOpen={['b']} />);
    expect(screen.getByText('Content B')).toBeInTheDocument();
    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
  });
});
