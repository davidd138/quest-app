import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestCard from '@/components/quest/QuestCard';
import type { Quest, Progress } from '@/types';

// Mock framer-motion to render plain elements
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target: unknown, prop: string) => {
      const Component = React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
        const { children, className, onClick, href, style, ...rest } = props;
        void rest;
        return React.createElement(prop, { ref, className, onClick, href, style, 'data-testid': props['data-testid'] }, children as React.ReactNode);
      });
      Component.displayName = `motion.${prop}`;
      return Component;
    }
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

const makeStage = (id: string, order: number) => ({
  id,
  order,
  title: `Stage ${order}`,
  description: `Stage ${order} description`,
  location: { latitude: 40.4, longitude: -3.7, name: 'Madrid' },
  character: {
    name: 'Guide',
    role: 'NPC',
    personality: 'Friendly',
    backstory: 'A local guide',
    voiceStyle: 'warm',
    greetingMessage: 'Hello!',
  },
  challenge: {
    type: 'conversation' as const,
    description: 'Talk to the guide',
    successCriteria: 'Complete the conversation',
    failureHints: ['Try again'],
  },
  points: 100,
  hints: ['Look around'],
});

const baseQuest: Quest = {
  id: 'quest-1',
  title: 'Madrid Mystery Tour',
  description: 'Explore the hidden secrets of Madrid through an exciting adventure.',
  category: 'mystery',
  difficulty: 'medium',
  estimatedDuration: 60,
  stages: [makeStage('s1', 1), makeStage('s2', 2), makeStage('s3', 3)],
  totalPoints: 300,
  location: { latitude: 40.4168, longitude: -3.7038, name: 'Madrid' },
  radius: 5000,
  tags: ['mystery', 'walking'],
  isPublished: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('QuestCard', () => {
  it('renders quest title', () => {
    render(<QuestCard quest={baseQuest} />);
    expect(screen.getByText('Madrid Mystery Tour')).toBeInTheDocument();
  });

  it('renders quest description', () => {
    render(<QuestCard quest={baseQuest} />);
    expect(
      screen.getByText('Explore the hidden secrets of Madrid through an exciting adventure.'),
    ).toBeInTheDocument();
  });

  it('renders the category badge', () => {
    render(<QuestCard quest={baseQuest} />);
    expect(screen.getByText('mystery')).toBeInTheDocument();
  });

  it('renders the difficulty badge', () => {
    render(<QuestCard quest={baseQuest} />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('shows stage count', () => {
    render(<QuestCard quest={baseQuest} />);
    expect(screen.getByText('3 stages')).toBeInTheDocument();
  });

  it('shows estimated duration', () => {
    render(<QuestCard quest={baseQuest} />);
    expect(screen.getByText('60m')).toBeInTheDocument();
  });

  it('shows total points', () => {
    render(<QuestCard quest={baseQuest} />);
    expect(screen.getByText('300 pts')).toBeInTheDocument();
  });

  it('shows progress bar when progress is in_progress', () => {
    const progress: Progress = {
      id: 'p1',
      userId: 'u1',
      questId: 'quest-1',
      currentStageIndex: 1,
      completedStages: [
        { stageId: 's1', points: 100, attempts: 1, completedAt: '2025-01-01T00:00:00Z', duration: 300 },
      ],
      status: 'in_progress',
      startedAt: '2025-01-01T00:00:00Z',
      totalPoints: 100,
      totalDuration: 300,
    };
    const { container } = render(<QuestCard quest={baseQuest} progress={progress} />);
    // ProgressBar renders a motion.div with width style based on percentage
    // Check the progress bar container is present
    const progressBarWrapper = container.querySelector('.w-full.rounded-full');
    expect(progressBarWrapper).toBeInTheDocument();
  });

  it('shows completed status when progress is completed', () => {
    const progress: Progress = {
      id: 'p1',
      userId: 'u1',
      questId: 'quest-1',
      currentStageIndex: 3,
      completedStages: [
        { stageId: 's1', points: 100, attempts: 1, completedAt: '2025-01-01T00:00:00Z', duration: 300 },
        { stageId: 's2', points: 100, attempts: 1, completedAt: '2025-01-01T00:00:00Z', duration: 300 },
        { stageId: 's3', points: 100, attempts: 1, completedAt: '2025-01-01T00:00:00Z', duration: 300 },
      ],
      status: 'completed',
      startedAt: '2025-01-01T00:00:00Z',
      completedAt: '2025-01-02T00:00:00Z',
      totalPoints: 300,
      totalDuration: 900,
    };
    render(<QuestCard quest={baseQuest} progress={progress} />);
    expect(screen.getByText(/Completed/)).toBeInTheDocument();
    expect(screen.getByText(/300 pts/)).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<QuestCard quest={baseQuest} onClick={handleClick} />);
    fireEvent.click(screen.getByText('Madrid Mystery Tour'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the correct category gradient class', () => {
    const { container } = render(<QuestCard quest={baseQuest} />);
    const gradientDiv = container.querySelector('.bg-gradient-to-br');
    expect(gradientDiv?.className).toContain('from-slate-600/40');
    expect(gradientDiv?.className).toContain('to-zinc-700/40');
  });

  it('applies custom className', () => {
    const { container } = render(<QuestCard quest={baseQuest} className="my-custom-class" />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});
