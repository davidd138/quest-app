import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import VoiceInterface, { type TranscriptMessage } from '@/components/voice/VoiceInterface';
import type { Character, Challenge } from '@/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { whileHover, whileTap, transition, variants, initial, animate, exit, layout, key, ...rest } = props as Record<string, unknown>;
      return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    },
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { whileHover, whileTap, transition, variants, initial, animate, exit, ...rest } = props as Record<string, unknown>;
      return <button {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock sub-components
vi.mock('@/components/voice/AudioVisualizer', () => ({
  default: () => <div data-testid="audio-visualizer" />,
}));

vi.mock('@/components/voice/TranscriptPanel', () => ({
  default: ({ messages, characterName }: { messages: TranscriptMessage[]; characterName: string }) => (
    <div data-testid="transcript-panel">
      {messages.map((m) => (
        <div key={m.id} data-testid="transcript-message">
          {m.speaker === 'user' ? 'You' : characterName}: {m.text}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/voice/CharacterPanel', () => ({
  default: ({ character }: { character: Character }) => (
    <div data-testid="character-panel">
      <span>{character.name}</span>
      <span>{character.role}</span>
    </div>
  ),
}));

const mockCharacter: Character = {
  name: 'Don Quixote',
  role: 'Wandering Knight',
  personality: 'Idealistic and brave',
  backstory: 'A knight who fights windmills',
  voiceStyle: 'dramatic',
  greetingMessage: 'I am Don Quixote!',
};

const mockChallenge: Challenge = {
  type: 'conversation',
  description: 'Convince the knight to share his story',
  successCriteria: 'Engage in a meaningful dialogue',
  failureHints: ['Ask about his adventures'],
};

const defaultProps = {
  character: mockCharacter,
  challenge: mockChallenge,
  onConnect: vi.fn(),
  onDisconnect: vi.fn(),
  connectionState: 'idle' as const,
  transcript: [] as TranscriptMessage[],
  hintsRemaining: 3,
  onRequestHint: vi.fn(),
};

describe('VoiceInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders character panel with character info', () => {
    render(<VoiceInterface {...defaultProps} />);
    expect(screen.getByTestId('character-panel')).toBeInTheDocument();
    expect(screen.getByText('Don Quixote')).toBeInTheDocument();
    expect(screen.getByText('Wandering Knight')).toBeInTheDocument();
  });

  it('shows Start button in idle state', () => {
    render(<VoiceInterface {...defaultProps} />);
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('shows End button when connected (listening state)', () => {
    render(<VoiceInterface {...defaultProps} connectionState="listening" />);
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  it('shows End button when connected (speaking state)', () => {
    render(<VoiceInterface {...defaultProps} connectionState="speaking" />);
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  it('calls onConnect when Start button is clicked', () => {
    const onConnect = vi.fn();
    render(<VoiceInterface {...defaultProps} onConnect={onConnect} />);
    fireEvent.click(screen.getByText('Start'));
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it('calls onDisconnect when End button is clicked', () => {
    const onDisconnect = vi.fn();
    render(<VoiceInterface {...defaultProps} connectionState="listening" onDisconnect={onDisconnect} />);
    fireEvent.click(screen.getByText('End'));
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it('shows timer when connected', () => {
    render(<VoiceInterface {...defaultProps} connectionState="listening" />);
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('timer increments while connected', () => {
    render(<VoiceInterface {...defaultProps} connectionState="listening" />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('00:05')).toBeInTheDocument();
  });

  it('does not show timer in idle state', () => {
    render(<VoiceInterface {...defaultProps} connectionState="idle" />);
    expect(screen.queryByText('00:00')).not.toBeInTheDocument();
  });

  it('renders transcript messages', () => {
    const transcript: TranscriptMessage[] = [
      { id: '1', speaker: 'character', text: 'Hello adventurer!', timestamp: new Date() },
      { id: '2', speaker: 'user', text: 'Hi there!', timestamp: new Date() },
    ];
    render(<VoiceInterface {...defaultProps} connectionState="listening" transcript={transcript} />);
    expect(screen.getByText(/Hello adventurer!/)).toBeInTheDocument();
    expect(screen.getByText(/Hi there!/)).toBeInTheDocument();
  });

  it('shows state label for each connection state', () => {
    const { rerender } = render(<VoiceInterface {...defaultProps} connectionState="idle" />);
    expect(screen.getByText('Ready')).toBeInTheDocument();

    rerender(<VoiceInterface {...defaultProps} connectionState="connecting" />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();

    rerender(<VoiceInterface {...defaultProps} connectionState="listening" />);
    expect(screen.getByText('Listening')).toBeInTheDocument();

    rerender(<VoiceInterface {...defaultProps} connectionState="speaking" />);
    expect(screen.getByText('Speaking')).toBeInTheDocument();
  });

  it('shows hint button with remaining count when connected', () => {
    render(<VoiceInterface {...defaultProps} connectionState="listening" hintsRemaining={2} />);
    expect(screen.getByText('Hint (2)')).toBeInTheDocument();
  });

  it('disables hint button when no hints remaining', () => {
    render(<VoiceInterface {...defaultProps} connectionState="listening" hintsRemaining={0} />);
    const hintButton = screen.getByText('Hint (0)').closest('button');
    expect(hintButton).toBeDisabled();
  });

  it('renders challenge description', () => {
    render(<VoiceInterface {...defaultProps} />);
    expect(screen.getByText('Convince the knight to share his story')).toBeInTheDocument();
  });

  it('renders challenge type badge', () => {
    render(<VoiceInterface {...defaultProps} />);
    expect(screen.getByText('conversation')).toBeInTheDocument();
  });
});
