import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Mock next/navigation
const mockPathname = vi.fn(() => '/quests/abc-123/edit');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Breadcrumbs', () => {
  it('renders path segments as breadcrumb items', () => {
    mockPathname.mockReturnValue('/quests');
    render(<Breadcrumbs />);

    expect(screen.getByText('Quests')).toBeInTheDocument();
  });

  it('renders links to parent routes', () => {
    mockPathname.mockReturnValue('/quests/abc-123/edit');
    render(<Breadcrumbs dynamicLabels={{ 'abc-123': 'Dragon Valley Quest' }} />);

    // "Quests" should be a link
    const questsLink = screen.getByText('Quests');
    expect(questsLink.closest('a')).toHaveAttribute('href', '/quests');

    // Dynamic segment should be a link
    const dynamicLink = screen.getByText('Dragon Valley Quest');
    expect(dynamicLink.closest('a')).toHaveAttribute('href', '/quests/abc-123');
  });

  it('does not render the current (last) page as a link', () => {
    mockPathname.mockReturnValue('/quests/abc-123/edit');
    render(<Breadcrumbs dynamicLabels={{ 'abc-123': 'Dragon Valley Quest' }} />);

    // "Edit" is the last segment and should not be a link
    const editText = screen.getByText('Edit');
    expect(editText.tagName).not.toBe('A');
    expect(editText.closest('a')).toBeNull();
    expect(editText).toHaveAttribute('aria-current', 'page');
  });

  it('handles dynamic segments with dynamicLabels prop', () => {
    mockPathname.mockReturnValue('/quests/quest-456');
    render(<Breadcrumbs dynamicLabels={{ 'quest-456': 'Haunted Forest' }} />);

    // Last segment uses dynamic label and is not a link
    expect(screen.getByText('Haunted Forest')).toBeInTheDocument();
  });

  it('renders a Home link', () => {
    mockPathname.mockReturnValue('/dashboard');
    render(<Breadcrumbs />);

    const homeLink = screen.getByLabelText('Home');
    expect(homeLink).toHaveAttribute('href', '/dashboard');
  });

  it('renders separator icons between segments', () => {
    mockPathname.mockReturnValue('/admin/quests/new');
    const { container } = render(<Breadcrumbs />);

    // ChevronRight icons should be present (rendered as SVGs with aria-hidden)
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    // One separator for each crumb (Home > Admin > Quests > New = 3 separators)
    expect(separators.length).toBe(3);
  });

  it('returns null for root path', () => {
    mockPathname.mockReturnValue('/');
    const { container } = render(<Breadcrumbs />);

    expect(container.querySelector('nav')).toBeNull();
  });

  it('filters out route group segments in parentheses', () => {
    // Next.js route groups like (app) should not appear
    mockPathname.mockReturnValue('/dashboard');
    render(<Breadcrumbs />);

    expect(screen.queryByText('(app)')).toBeNull();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
