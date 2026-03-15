import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuestProgress from '@/components/quest/QuestProgress';
import type { Stage, CompletedStage } from '@/types';

// Mock framer-motion
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

const makeStage = (id: string, order: number, title: string): Stage => ({
  id,
  order,
  title,
  description: `${title} description`,
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
    description: 'Talk',
    successCriteria: 'Complete',
    failureHints: ['Try again'],
  },
  points: 100,
  hints: ['Hint 1'],
});

const makeCompletedStage = (stageId: string): CompletedStage => ({
  stageId,
  points: 100,
  attempts: 1,
  completedAt: '2025-01-01T00:00:00Z',
  duration: 300,
});

describe('QuestProgress', () => {
  const stages: Stage[] = [
    makeStage('s1', 1, 'Market Visit'),
    makeStage('s2', 2, 'Palace Tour'),
    makeStage('s3', 3, 'Park Walk'),
    makeStage('s4', 4, 'Museum'),
  ];

  it('renders correct number of stages', () => {
    render(
      <QuestProgress
        stages={stages}
        completedStages={[]}
        currentStageIndex={0}
      />,
    );
    // Each stage title is rendered
    expect(screen.getByText('Market Visit')).toBeInTheDocument();
    expect(screen.getByText('Palace Tour')).toBeInTheDocument();
    expect(screen.getByText('Park Walk')).toBeInTheDocument();
    expect(screen.getByText('Museum')).toBeInTheDocument();
  });

  it('shows stage numbers for uncompleted stages', () => {
    render(
      <QuestProgress
        stages={stages}
        completedStages={[]}
        currentStageIndex={0}
      />,
    );
    // Uncompleted stages show their 1-based index
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('completed stages show checkmark icon instead of number', () => {
    const { container } = render(
      <QuestProgress
        stages={stages}
        completedStages={[makeCompletedStage('s1'), makeCompletedStage('s2')]}
        currentStageIndex={2}
      />,
    );
    // Completed stages have emerald-500 background
    const completedDots = container.querySelectorAll('.bg-emerald-500');
    expect(completedDots.length).toBe(2);
  });

  it('current stage is highlighted with violet styling', () => {
    const { container } = render(
      <QuestProgress
        stages={stages}
        completedStages={[makeCompletedStage('s1')]}
        currentStageIndex={1}
      />,
    );
    // Current stage has violet-500 background
    const currentDot = container.querySelector('.bg-violet-500');
    expect(currentDot).toBeInTheDocument();
  });

  it('locked/future stages have muted styling', () => {
    const { container } = render(
      <QuestProgress
        stages={stages}
        completedStages={[]}
        currentStageIndex={0}
      />,
    );
    // Locked stages have the dim bg-white/5 class
    const lockedDots = container.querySelectorAll('.bg-white\\/5');
    // Stages 2, 3, 4 should be locked (index 1, 2, 3)
    expect(lockedDots.length).toBe(3);
  });

  it('connector lines exist between stages', () => {
    const { container } = render(
      <QuestProgress
        stages={stages}
        completedStages={[]}
        currentStageIndex={0}
      />,
    );
    // There should be n-1 connector lines
    const connectors = container.querySelectorAll('.rounded-full.transition-colors');
    expect(connectors.length).toBe(3);
  });

  it('completed connector lines are emerald', () => {
    const { container } = render(
      <QuestProgress
        stages={stages}
        completedStages={[makeCompletedStage('s1'), makeCompletedStage('s2')]}
        currentStageIndex={2}
      />,
    );
    const emeraldConnectors = container.querySelectorAll('.bg-emerald-500.rounded-full.transition-colors');
    // First two connectors (s1->s2, s2->s3) should be completed
    expect(emeraldConnectors.length).toBeGreaterThanOrEqual(1);
  });

  it('renders with empty stages array', () => {
    const { container } = render(
      <QuestProgress
        stages={[]}
        completedStages={[]}
        currentStageIndex={0}
      />,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuestProgress
        stages={stages}
        completedStages={[]}
        currentStageIndex={0}
        className="custom-class"
      />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('completed stage titles have emerald text color', () => {
    render(
      <QuestProgress
        stages={stages}
        completedStages={[makeCompletedStage('s1')]}
        currentStageIndex={1}
      />,
    );
    const marketVisit = screen.getByText('Market Visit');
    expect(marketVisit.className).toContain('text-emerald-400');
  });

  it('current stage title has violet text color', () => {
    render(
      <QuestProgress
        stages={stages}
        completedStages={[makeCompletedStage('s1')]}
        currentStageIndex={1}
      />,
    );
    const palaceTour = screen.getByText('Palace Tour');
    expect(palaceTour.className).toContain('text-violet-400');
  });

  it('future stage titles have muted text color', () => {
    render(
      <QuestProgress
        stages={stages}
        completedStages={[]}
        currentStageIndex={0}
      />,
    );
    const museum = screen.getByText('Museum');
    expect(museum.className).toContain('text-slate-600');
  });
});
