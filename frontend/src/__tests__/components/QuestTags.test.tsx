import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Tag color mapping by type
const TAG_COLORS: Record<string, string> = {
  category: 'bg-violet-500/15 text-violet-400',
  difficulty: 'bg-amber-500/15 text-amber-400',
  location: 'bg-emerald-500/15 text-emerald-400',
  default: 'bg-navy-800/50 text-slate-400',
};

// Inline QuestTags component for testing
function QuestTags({
  tags,
  maxVisible = 3,
  onTagClick,
  tagType = 'default',
}: {
  tags: string[];
  maxVisible?: number;
  onTagClick?: (tag: string) => void;
  tagType?: string;
}) {
  const visibleTags = tags.slice(0, maxVisible);
  const overflowCount = tags.length - maxVisible;
  const colorClass = TAG_COLORS[tagType] || TAG_COLORS.default;

  return (
    <div className="flex flex-wrap gap-1.5" data-testid="quest-tags">
      {visibleTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagClick?.(tag)}
          className={`text-xs px-2 py-0.5 rounded ${colorClass}`}
          data-testid={`tag-${tag}`}
        >
          {tag}
        </button>
      ))}
      {overflowCount > 0 && (
        <span
          className="text-xs px-2 py-0.5 rounded bg-navy-800/30 text-slate-500"
          data-testid="tag-overflow"
        >
          +{overflowCount} more
        </span>
      )}
    </div>
  );
}

describe('QuestTags', () => {
  const sampleTags = ['mystery', 'walking', 'historical', 'outdoor', 'cultural'];

  it('renders visible tags up to maxVisible', () => {
    render(<QuestTags tags={sampleTags} maxVisible={3} />);
    expect(screen.getByTestId('tag-mystery')).toBeInTheDocument();
    expect(screen.getByTestId('tag-walking')).toBeInTheDocument();
    expect(screen.getByTestId('tag-historical')).toBeInTheDocument();
    expect(screen.queryByTestId('tag-outdoor')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tag-cultural')).not.toBeInTheDocument();
  });

  it('shows overflow count when tags exceed maxVisible', () => {
    render(<QuestTags tags={sampleTags} maxVisible={3} />);
    const overflow = screen.getByTestId('tag-overflow');
    expect(overflow).toBeInTheDocument();
    expect(overflow).toHaveTextContent('+2 more');
  });

  it('does not show overflow when all tags are visible', () => {
    render(<QuestTags tags={['mystery', 'walking']} maxVisible={3} />);
    expect(screen.queryByTestId('tag-overflow')).not.toBeInTheDocument();
  });

  it('does not show overflow when tags equal maxVisible', () => {
    render(<QuestTags tags={['mystery', 'walking', 'history']} maxVisible={3} />);
    expect(screen.queryByTestId('tag-overflow')).not.toBeInTheDocument();
  });

  it('calls onTagClick with the tag value when clicked', () => {
    const handleClick = vi.fn();
    render(<QuestTags tags={sampleTags} onTagClick={handleClick} />);
    fireEvent.click(screen.getByTestId('tag-mystery'));
    expect(handleClick).toHaveBeenCalledWith('mystery');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onTagClick for each clicked tag independently', () => {
    const handleClick = vi.fn();
    render(<QuestTags tags={sampleTags} onTagClick={handleClick} />);
    fireEvent.click(screen.getByTestId('tag-mystery'));
    fireEvent.click(screen.getByTestId('tag-walking'));
    expect(handleClick).toHaveBeenCalledTimes(2);
    expect(handleClick).toHaveBeenNthCalledWith(1, 'mystery');
    expect(handleClick).toHaveBeenNthCalledWith(2, 'walking');
  });

  it('renders without onTagClick without errors', () => {
    render(<QuestTags tags={sampleTags} />);
    // Clicking should not throw
    fireEvent.click(screen.getByTestId('tag-mystery'));
    expect(screen.getByTestId('tag-mystery')).toBeInTheDocument();
  });

  it('applies category color class', () => {
    render(<QuestTags tags={['mystery']} tagType="category" />);
    const tag = screen.getByTestId('tag-mystery');
    expect(tag.className).toContain('bg-violet-500/15');
    expect(tag.className).toContain('text-violet-400');
  });

  it('applies difficulty color class', () => {
    render(<QuestTags tags={['hard']} tagType="difficulty" />);
    const tag = screen.getByTestId('tag-hard');
    expect(tag.className).toContain('bg-amber-500/15');
    expect(tag.className).toContain('text-amber-400');
  });

  it('applies location color class', () => {
    render(<QuestTags tags={['madrid']} tagType="location" />);
    const tag = screen.getByTestId('tag-madrid');
    expect(tag.className).toContain('bg-emerald-500/15');
    expect(tag.className).toContain('text-emerald-400');
  });

  it('applies default color class for unknown type', () => {
    render(<QuestTags tags={['misc']} tagType="unknown" />);
    const tag = screen.getByTestId('tag-misc');
    expect(tag.className).toContain('bg-navy-800/50');
    expect(tag.className).toContain('text-slate-400');
  });

  it('renders empty when no tags provided', () => {
    render(<QuestTags tags={[]} />);
    const container = screen.getByTestId('quest-tags');
    expect(container.children).toHaveLength(0);
  });

  it('renders with custom maxVisible', () => {
    render(<QuestTags tags={sampleTags} maxVisible={1} />);
    expect(screen.getByTestId('tag-mystery')).toBeInTheDocument();
    expect(screen.queryByTestId('tag-walking')).not.toBeInTheDocument();
    expect(screen.getByTestId('tag-overflow')).toHaveTextContent('+4 more');
  });
});
