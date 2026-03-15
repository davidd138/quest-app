import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import QuestTimer from '@/components/quest/QuestTimer';

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

describe('QuestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const baseProps = {
    startTime: new Date().toISOString(),
    estimatedMinutes: 10,
  };

  it('renders elapsed time starting at 00:00:00', () => {
    render(<QuestTimer {...baseProps} />);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('displays estimated duration', () => {
    render(<QuestTimer {...baseProps} />);
    expect(screen.getByText('Estimated: 10m')).toBeInTheDocument();
  });

  it('timer increments after 1 second', () => {
    render(<QuestTimer {...baseProps} />);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('00:00:01')).toBeInTheDocument();
  });

  it('timer increments after multiple seconds', () => {
    render(<QuestTimer {...baseProps} />);

    act(() => {
      vi.advanceTimersByTime(65000);
    });

    expect(screen.getByText('00:01:05')).toBeInTheDocument();
  });

  it('shows pause button when onPause is provided', () => {
    const onPause = vi.fn();
    const onResume = vi.fn();
    render(<QuestTimer {...baseProps} onPause={onPause} onResume={onResume} />);

    const pauseButton = screen.getByRole('button');
    expect(pauseButton).toBeInTheDocument();
  });

  it('calls onPause when pause button is clicked', () => {
    const onPause = vi.fn();
    const onResume = vi.fn();
    render(<QuestTimer {...baseProps} onPause={onPause} onResume={onResume} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it('calls onResume when resume button is clicked while paused', () => {
    const onPause = vi.fn();
    const onResume = vi.fn();
    render(
      <QuestTimer {...baseProps} isPaused={true} onPause={onPause} onResume={onResume} />,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('shows PAUSED text when isPaused is true', () => {
    render(<QuestTimer {...baseProps} isPaused={true} />);
    expect(screen.getByText('PAUSED')).toBeInTheDocument();
  });

  it('shows "On Track" label when under estimated time', () => {
    render(<QuestTimer {...baseProps} />);
    expect(screen.getByText('On Track')).toBeInTheDocument();
  });

  it('shows "Almost There" when approaching estimated time', () => {
    const startTime = new Date(Date.now() - 500 * 1000).toISOString();
    render(<QuestTimer {...baseProps} startTime={startTime} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // 501 seconds elapsed out of 600 = ~83.5% -> "near" state
    expect(screen.getByText('Almost There')).toBeInTheDocument();
  });

  it('shows "Over Time" when past estimated time', () => {
    const startTime = new Date(Date.now() - 700 * 1000).toISOString();
    render(<QuestTimer {...baseProps} startTime={startTime} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Over Time')).toBeInTheDocument();
  });

  it('shows best time when provided', () => {
    render(<QuestTimer {...baseProps} bestTime={420} />);
    expect(screen.getByText('Best: 7m')).toBeInTheDocument();
  });

  it('does not show best time when not provided', () => {
    render(<QuestTimer {...baseProps} />);
    expect(screen.queryByText(/Best:/)).not.toBeInTheDocument();
  });

  it('shows time bonus active when under estimated time', () => {
    render(<QuestTimer {...baseProps} />);
    expect(screen.getByText('Time Bonus Active')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<QuestTimer {...baseProps} className="my-class" />);
    expect(container.firstChild).toHaveClass('my-class');
  });
});
