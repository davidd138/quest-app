import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '@/components/ui/Input';
import { Search, Mail } from 'lucide-react';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    const label = screen.getByText('Email');
    expect(label.tagName).toBe('LABEL');
  });

  it('associates label with input via htmlFor', () => {
    render(<Input label="Email" />);
    const label = screen.getByText('Email');
    const input = document.getElementById(label.getAttribute('for')!);
    expect(input).toBeInTheDocument();
    expect(input?.tagName).toBe('INPUT');
  });

  it('renders without label when not provided', () => {
    const { container } = render(<Input placeholder="Type here" />);
    const labels = container.querySelectorAll('label');
    expect(labels.length).toBe(0);
  });

  describe('error message', () => {
    it('shows error message', () => {
      render(<Input label="Email" error="Invalid email" />);
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    it('applies error border styling', () => {
      const { container } = render(<Input error="Error" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('border-rose-500');
    });

    it('hides helper text when error is shown', () => {
      render(<Input helperText="Enter your email" error="Invalid email" />);
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
      expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
    });

    it('shows helper text when no error', () => {
      render(<Input helperText="Enter your email" />);
      expect(screen.getByText('Enter your email')).toBeInTheDocument();
    });
  });

  describe('left icon', () => {
    it('renders left icon SVG', () => {
      const { container } = render(<Input leftIcon={Mail} />);
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(1);
    });

    it('adds left padding when icon present', () => {
      const { container } = render(<Input leftIcon={Mail} />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('pl-10');
    });

    it('uses default left padding when no icon', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('pl-4');
    });
  });

  describe('focus ring style', () => {
    it('has focus ring classes', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('focus:ring-2');
      expect(input?.className).toContain('focus:ring-violet-500/50');
    });

    it('error state overrides focus ring', () => {
      const { container } = render(<Input error="Error" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('focus:ring-rose-500/50');
    });
  });

  describe('search variant', () => {
    it('applies rounded-full for search variant', () => {
      const { container } = render(<Input variant="search" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('rounded-full');
    });

    it('does not apply rounded-full for default variant', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input?.className).not.toContain('rounded-full');
    });
  });

  describe('forwardRef', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('ref allows focus', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });
  });

  describe('input props passthrough', () => {
    it('passes placeholder', () => {
      render(<Input placeholder="Search..." />);
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('passes disabled prop', () => {
      const { container } = render(<Input disabled />);
      const input = container.querySelector('input');
      expect(input).toBeDisabled();
    });

    it('passes type prop', () => {
      const { container } = render(<Input type="password" />);
      const input = container.querySelector('input');
      expect(input?.type).toBe('password');
    });

    it('handles onChange', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'hello' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  it('uses custom id when provided', () => {
    const { container } = render(<Input label="Email" id="my-custom-id" />);
    const input = container.querySelector('#my-custom-id');
    expect(input).toBeInTheDocument();
  });

  it('generates id from label when no id provided', () => {
    render(<Input label="First Name" />);
    const label = screen.getByText('First Name');
    const forAttr = label.getAttribute('for');
    expect(forAttr).toBe('first-name');
  });

  it('applies additional className', () => {
    const { container } = render(<Input className="my-extra-class" />);
    const input = container.querySelector('input');
    expect(input?.className).toContain('my-extra-class');
  });
});
