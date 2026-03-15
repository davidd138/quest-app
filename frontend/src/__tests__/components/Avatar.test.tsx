import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Avatar from '@/components/ui/Avatar';

describe('Avatar', () => {
  it('renders initials from a single name', () => {
    const { container } = render(<Avatar name="Elena" />);
    expect(container.textContent).toContain('E');
  });

  it('renders initials from first and last name', () => {
    const { container } = render(<Avatar name="Elena Vasquez" />);
    expect(container.textContent).toContain('EV');
  });

  it('renders initials from multi-word name', () => {
    const { container } = render(<Avatar name="Ana Maria Torres" />);
    // Should use first and last
    expect(container.textContent).toContain('AT');
  });

  it('renders ? when no name provided', () => {
    const { container } = render(<Avatar />);
    expect(container.textContent).toContain('?');
  });

  describe('size variants', () => {
    it('applies xs size classes', () => {
      const { container } = render(<Avatar name="A" size="xs" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('h-6');
      expect(wrapper.className).toContain('w-6');
    });

    it('applies sm size classes', () => {
      const { container } = render(<Avatar name="A" size="sm" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('h-8');
      expect(wrapper.className).toContain('w-8');
    });

    it('applies md size classes (default)', () => {
      const { container } = render(<Avatar name="A" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('h-10');
      expect(wrapper.className).toContain('w-10');
    });

    it('applies lg size classes', () => {
      const { container } = render(<Avatar name="A" size="lg" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('h-14');
      expect(wrapper.className).toContain('w-14');
    });

    it('applies xl size classes', () => {
      const { container } = render(<Avatar name="A" size="xl" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('h-20');
      expect(wrapper.className).toContain('w-20');
    });
  });

  describe('image loading', () => {
    it('renders img element when src is provided', () => {
      const { container } = render(<Avatar name="Test" src="/avatar.jpg" />);
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img?.getAttribute('src')).toBe('/avatar.jpg');
    });

    it('does not render img when src is null', () => {
      const { container } = render(<Avatar name="Test" src={null} />);
      const img = container.querySelector('img');
      expect(img).not.toBeInTheDocument();
    });

    it('falls back to initials on image error', () => {
      const { container } = render(<Avatar name="Test User" src="/bad.jpg" />);
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();

      // Simulate error
      fireEvent.error(img!);

      // After error, img should no longer render (re-render removes it)
      const imgAfter = container.querySelector('img');
      expect(imgAfter).not.toBeInTheDocument();

      // Initials should be visible
      expect(container.textContent).toContain('TU');
    });
  });

  describe('online status dot', () => {
    it('shows online dot', () => {
      const { container } = render(<Avatar name="Test" status="online" />);
      const dot = container.querySelector('[aria-label="En linea"]');
      expect(dot).toBeInTheDocument();
      expect(dot?.className).toContain('bg-emerald-400');
    });

    it('shows offline dot', () => {
      const { container } = render(<Avatar name="Test" status="offline" />);
      const dot = container.querySelector('[aria-label="Desconectado"]');
      expect(dot).toBeInTheDocument();
      expect(dot?.className).toContain('bg-slate-500');
    });

    it('does not show dot when status is null', () => {
      const { container } = render(<Avatar name="Test" />);
      const dots = container.querySelectorAll('[aria-label="En linea"], [aria-label="Desconectado"]');
      expect(dots.length).toBe(0);
    });
  });

  describe('gradient background', () => {
    it('applies gradient classes to fallback div', () => {
      const { container } = render(<Avatar name="Test" />);
      const gradientDiv = container.querySelector('.bg-gradient-to-br');
      expect(gradientDiv).toBeInTheDocument();
    });

    it('uses deterministic gradient based on name', () => {
      const { container: c1 } = render(<Avatar name="Alice" />);
      const { container: c2 } = render(<Avatar name="Alice" />);
      const g1 = c1.querySelector('.bg-gradient-to-br')?.className;
      const g2 = c2.querySelector('.bg-gradient-to-br')?.className;
      expect(g1).toEqual(g2);
    });

    it('different names may produce different gradients', () => {
      const { container: c1 } = render(<Avatar name="Alice" />);
      const { container: c2 } = render(<Avatar name="Zara" />);
      // They might be the same by chance, but typically different
      const g1 = c1.querySelector('.bg-gradient-to-br')?.className;
      const g2 = c2.querySelector('.bg-gradient-to-br')?.className;
      // Just verify both have gradient classes
      expect(g1).toContain('from-');
      expect(g2).toContain('from-');
    });
  });

  describe('ring accent', () => {
    it('applies violet ring', () => {
      const { container } = render(<Avatar name="Test" ring="violet" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('ring-violet-500/60');
    });

    it('applies no ring by default', () => {
      const { container } = render(<Avatar name="Test" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).not.toContain('ring-2');
    });
  });

  it('passes custom className', () => {
    const { container } = render(<Avatar name="Test" className="my-custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('my-custom-class');
  });

  it('sets aria-label from name', () => {
    const { container } = render(<Avatar name="Elena" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('aria-label')).toBe('Elena');
  });
});
