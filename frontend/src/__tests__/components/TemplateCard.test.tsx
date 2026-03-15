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

import TemplateCard from '@/components/quest/TemplateCard';

// ---------- Test Data ----------

const mockTemplate = {
  id: 'tmpl-1',
  title: 'Classic City Walking Tour',
  description: 'A versatile walking tour template perfect for any city',
  category: 'city_tour' as const,
  stages: [
    { order: 1, title: 'Meeting Point', description: 'Gather at the start', challengeType: 'exploration' as const, estimatedMinutes: 10 },
    { order: 2, title: 'Historic District', description: 'Explore old town', challengeType: 'trivia' as const, estimatedMinutes: 20 },
    { order: 3, title: 'Grand Finale', description: 'Complete the tour', challengeType: 'voice' as const, estimatedMinutes: 10 },
  ],
  estimatedDuration: 40,
  difficulty: 'easy' as const,
  uses: 1284,
  rating: 4.7,
  totalRatings: 342,
  featured: true,
  createdAt: '2025-11-01',
  author: 'QuestMaster Team',
};

describe('TemplateCard', () => {
  const mockOnUseTemplate = vi.fn();
  const mockOnPreview = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders template name', () => {
    render(
      <TemplateCard
        template={mockTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />,
    );

    expect(screen.getByText('Classic City Walking Tour')).toBeInTheDocument();
  });

  it('shows category badge', () => {
    render(
      <TemplateCard
        template={mockTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />,
    );

    expect(screen.getByText('City Tour')).toBeInTheDocument();
  });

  it('displays stage count', () => {
    render(
      <TemplateCard
        template={mockTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />,
    );

    expect(screen.getByText('3 stages')).toBeInTheDocument();
  });

  it('use template button calls handler', () => {
    render(
      <TemplateCard
        template={mockTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />,
    );

    const useButton = screen.getByText('Use Template');
    fireEvent.click(useButton);

    expect(mockOnUseTemplate).toHaveBeenCalledWith('tmpl-1');
  });

  it('preview button calls handler', () => {
    render(
      <TemplateCard
        template={mockTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />,
    );

    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);

    expect(mockOnPreview).toHaveBeenCalledWith('tmpl-1');
  });

  it('rating stars are visible', () => {
    render(
      <TemplateCard
        template={mockTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />,
    );

    const ratingLabel = screen.getByLabelText(/out of 5 stars/i);
    expect(ratingLabel).toBeInTheDocument();
  });

  it('shows difficulty label', () => {
    render(
      <TemplateCard
        template={mockTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />,
    );

    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('shows uses count', () => {
    render(
      <TemplateCard
        template={mockTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />,
    );

    expect(screen.getByText('1,284')).toBeInTheDocument();
  });
});
