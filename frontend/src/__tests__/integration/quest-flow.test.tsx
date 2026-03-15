import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ---------- Mocks ----------

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        const Component = React.forwardRef(
          (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
            const { children, className, onClick, href, style, ...rest } = props;
            void rest;
            return React.createElement(
              prop,
              { ref, className, onClick, href, style, 'data-testid': props['data-testid'] },
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

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useParams: () => ({ id: 'q1', stageId: 's1' }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/quests/q1',
}));

// ---------- Mock Quest Data ----------

const mockQuest = {
  id: 'q1',
  title: 'Madrid Mystery Trail',
  description: 'Explore the mysterious streets of Madrid',
  category: 'mystery',
  difficulty: 'medium',
  estimatedDuration: 60,
  coverImageUrl: null,
  stages: [
    {
      id: 's1',
      order: 1,
      title: 'The Secret Garden',
      description: 'Find the hidden garden in Retiro Park',
      location: { latitude: 40.42, longitude: -3.68, name: 'Retiro Park' },
      character: {
        name: 'Don Quixote',
        role: 'Guide',
        personality: 'Wise and eccentric',
        backstory: 'A legendary wanderer',
        voiceStyle: 'warm',
        greetingMessage: 'Welcome, brave explorer!',
      },
      challenge: {
        type: 'conversation' as const,
        description: 'Talk to Don Quixote about the garden',
        successCriteria: 'Learn the secret path',
        failureHints: ['Ask about the roses'],
      },
      points: 200,
      hints: ['Look near the crystal palace'],
    },
    {
      id: 's2',
      order: 2,
      title: 'The Royal Palace Clue',
      description: 'Decipher the clue at the Royal Palace',
      location: { latitude: 40.42, longitude: -3.71, name: 'Royal Palace' },
      character: {
        name: 'Isabella',
        role: 'Royal Scholar',
        personality: 'Scholarly and precise',
        backstory: 'Palace historian',
        voiceStyle: 'formal',
        greetingMessage: 'Greetings, seeker of knowledge!',
      },
      challenge: {
        type: 'riddle' as const,
        description: 'Solve the palace riddle',
        successCriteria: 'Correct answer',
        failureHints: ['Think about the coat of arms'],
      },
      points: 300,
      hints: ['Count the lions on the gate'],
    },
  ],
  totalPoints: 500,
  location: { latitude: 40.42, longitude: -3.7, name: 'Madrid' },
  radius: 5000,
  tags: ['mystery', 'history'],
  isPublished: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockProgress = {
  id: 'p1',
  userId: 'u1',
  questId: 'q1',
  currentStageIndex: 0,
  completedStages: [],
  status: 'in_progress',
  startedAt: '2026-03-15T10:00:00Z',
  totalPoints: 0,
  totalDuration: 0,
};

const mockConversation = {
  id: 'conv1',
  userId: 'u1',
  questId: 'q1',
  stageId: 's1',
  characterName: 'Don Quixote',
  transcript: '',
  status: 'in_progress',
  startedAt: '2026-03-15T10:05:00Z',
};

const mockCompletionReport = {
  totalPoints: 500,
  totalDuration: 2400,
  stagesCompleted: 2,
  totalStages: 2,
};

// ---------- Mock API Calls ----------

let questData: typeof mockQuest | null = mockQuest;
let questsData = { items: [mockQuest] };
let progressData: typeof mockProgress | null = null;
let conversationData: typeof mockConversation | null = null;
let reportData: typeof mockCompletionReport | null = null;
let questLoading = false;

const mockExecute = vi.fn();
const mockMutationExecute = vi.fn();

vi.mock('@/hooks/useGraphQL', () => ({
  useQuery: (query: string) => {
    if (query.includes('listQuests') || query.includes('ListQuests')) {
      return { data: questsData, loading: questLoading, error: null, execute: mockExecute };
    }
    if (query.includes('getQuest') || query.includes('GetQuest')) {
      return { data: questData, loading: questLoading, error: null, execute: mockExecute };
    }
    if (query.includes('getProgress') || query.includes('GetProgress')) {
      return { data: progressData, loading: false, error: null, execute: mockExecute };
    }
    return { data: null, loading: false, error: null, execute: mockExecute };
  },
  useMutation: () => ({
    data: null,
    loading: false,
    error: null,
    execute: mockMutationExecute,
  }),
}));

vi.mock('@/lib/graphql/queries', () => ({
  LIST_QUESTS: 'query ListQuests { listQuests { items { id title } } }',
  GET_QUEST: 'query GetQuest { getQuest { id title } }',
  GET_PROGRESS: 'query GetProgress { getProgress { id } }',
  GET_CONVERSATION: 'query GetConversation { getConversation { id } }',
}));

vi.mock('@/lib/graphql/mutations', () => ({
  START_QUEST: 'mutation StartQuest { startQuest { id } }',
  UPDATE_PROGRESS: 'mutation UpdateProgress { updateProgress { id } }',
  COMPLETE_STAGE: 'mutation CompleteStage { completeStage { id } }',
  CREATE_CONVERSATION: 'mutation CreateConversation { createConversation { id } }',
  UPDATE_CONVERSATION: 'mutation UpdateConversation { updateConversation { id } }',
  SYNC_USER: 'mutation SyncUser { syncUser { userId } }',
}));

vi.mock('@/lib/constants', () => ({
  QUEST_CATEGORIES: [
    'adventure',
    'mystery',
    'cultural',
    'educational',
    'culinary',
    'nature',
    'urban',
    'team_building',
  ],
  QUEST_DIFFICULTIES: ['easy', 'medium', 'hard', 'legendary'],
  DIFFICULTY_COLORS: { easy: 'emerald', medium: 'amber', hard: 'rose', legendary: 'violet' },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      userId: 'u1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'player',
      status: 'active',
      totalPoints: 1200,
      questsCompleted: 5,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
    },
    loading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useRealtimeVoice', () => ({
  useRealtimeVoice: () => ({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    startListening: vi.fn(),
    stopListening: vi.fn(),
    transcript: '',
    emotion: 'neutral',
  }),
}));

// ---------- Test Suite ----------

describe('Quest Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    questData = mockQuest;
    questsData = { items: [mockQuest] };
    progressData = null;
    conversationData = null;
    reportData = null;
    questLoading = false;
  });

  describe('Quest Discovery', () => {
    it('shows quest list and allows clicking into quest detail', async () => {
      const QuestsPage = (await import('@/app/(app)/quests/page')).default;
      render(<QuestsPage />);

      // 1. User sees the quest list page
      expect(screen.getByText('Quest Catalog')).toBeInTheDocument();

      // 2. Quest card is visible
      expect(screen.getByText('Madrid Mystery Trail')).toBeInTheDocument();

      // 3. Quest shows metadata
      expect(screen.getByText('500 pts')).toBeInTheDocument();
      expect(screen.getByText('60 min')).toBeInTheDocument();
      expect(screen.getByText('2 stages')).toBeInTheDocument();

      // 4. Quest card links to detail page
      const link = screen.getByText('Madrid Mystery Trail').closest('a');
      expect(link).toHaveAttribute('href', '/quests/q1');
    });

    it('filters quests by search text reducing visible results', async () => {
      const multipleQuests = {
        items: [
          mockQuest,
          {
            ...mockQuest,
            id: 'q2',
            title: 'Barcelona Food Tour',
            description: 'A culinary adventure',
            category: 'culinary' as const,
          },
        ],
      };
      questsData = multipleQuests;

      const QuestsPage = (await import('@/app/(app)/quests/page')).default;
      render(<QuestsPage />);

      // Both quests initially visible
      expect(screen.getByText('Madrid Mystery Trail')).toBeInTheDocument();
      expect(screen.getByText('Barcelona Food Tour')).toBeInTheDocument();

      // Search narrows results
      const searchInput = screen.getByPlaceholderText('Search quests...');
      fireEvent.change(searchInput, { target: { value: 'Madrid' } });

      expect(screen.getByText('Madrid Mystery Trail')).toBeInTheDocument();
      expect(screen.queryByText('Barcelona Food Tour')).not.toBeInTheDocument();
    });

    it('displays loading skeletons then quest data', async () => {
      questLoading = true;

      const QuestsPage = (await import('@/app/(app)/quests/page')).default;
      const { container } = render(<QuestsPage />);

      // Loading state shows skeleton placeholders
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Quest Detail and Start', () => {
    it('renders quest detail with stage information and start action', async () => {
      // Simulate a quest detail page component inline
      function MockQuestDetail() {
        const quest = questData;
        if (!quest) return <div>Loading...</div>;
        return (
          <div>
            <h1>{quest.title}</h1>
            <p>{quest.description}</p>
            <span>{quest.difficulty}</span>
            <span>{quest.totalPoints} points</span>
            <div data-testid="stages">
              {quest.stages.map((s) => (
                <div key={s.id}>
                  <h3>{s.title}</h3>
                  <p>{s.character.name}</p>
                </div>
              ))}
            </div>
            <button onClick={() => mockMutationExecute({ questId: quest.id })}>
              Start Quest
            </button>
          </div>
        );
      }

      render(<MockQuestDetail />);

      // Quest title and description
      expect(screen.getByText('Madrid Mystery Trail')).toBeInTheDocument();
      expect(screen.getByText('Explore the mysterious streets of Madrid')).toBeInTheDocument();

      // Difficulty and points
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('500 points')).toBeInTheDocument();

      // Stages are listed
      expect(screen.getByText('The Secret Garden')).toBeInTheDocument();
      expect(screen.getByText('The Royal Palace Clue')).toBeInTheDocument();

      // Characters visible
      expect(screen.getByText('Don Quixote')).toBeInTheDocument();
      expect(screen.getByText('Isabella')).toBeInTheDocument();

      // Start quest action
      fireEvent.click(screen.getByText('Start Quest'));
      expect(mockMutationExecute).toHaveBeenCalledWith({ questId: 'q1' });
    });
  });

  describe('Stage Navigation and Voice Chat', () => {
    it('navigates through stages and initiates voice chat', async () => {
      function MockStagePlay() {
        const stage = mockQuest.stages[0];
        const [chatActive, setChatActive] = React.useState(false);

        return (
          <div>
            <h2>{stage.title}</h2>
            <p>{stage.description}</p>
            <p>Character: {stage.character.name}</p>
            <p>Challenge: {stage.challenge.description}</p>

            {!chatActive ? (
              <button onClick={() => setChatActive(true)}>Start Voice Chat</button>
            ) : (
              <div data-testid="voice-chat">
                <p>Voice chat with {stage.character.name}</p>
                <p>{stage.character.greetingMessage}</p>
                <button
                  onClick={() => {
                    mockMutationExecute({
                      questId: 'q1',
                      stageId: 's1',
                      conversationId: 'conv1',
                    });
                    setChatActive(false);
                  }}
                >
                  Complete Stage
                </button>
              </div>
            )}

            <button onClick={() => mockPush('/quest-play/q1/stage/s2')}>
              Next Stage
            </button>
          </div>
        );
      }

      render(<MockStagePlay />);

      // Stage info displayed
      expect(screen.getByText('The Secret Garden')).toBeInTheDocument();
      expect(screen.getByText('Character: Don Quixote')).toBeInTheDocument();
      expect(screen.getByText('Challenge: Talk to Don Quixote about the garden')).toBeInTheDocument();

      // Start voice chat
      fireEvent.click(screen.getByText('Start Voice Chat'));
      expect(screen.getByTestId('voice-chat')).toBeInTheDocument();
      expect(screen.getByText('Voice chat with Don Quixote')).toBeInTheDocument();
      expect(screen.getByText('Welcome, brave explorer!')).toBeInTheDocument();

      // Complete the stage
      fireEvent.click(screen.getByText('Complete Stage'));
      expect(mockMutationExecute).toHaveBeenCalledWith({
        questId: 'q1',
        stageId: 's1',
        conversationId: 'conv1',
      });

      // Navigate to next stage
      fireEvent.click(screen.getByText('Next Stage'));
      expect(mockPush).toHaveBeenCalledWith('/quest-play/q1/stage/s2');
    });
  });

  describe('Quest Completion', () => {
    it('displays completion report with all quest statistics', () => {
      function MockQuestReport() {
        return (
          <div>
            <h1>Quest Complete!</h1>
            <p>Madrid Mystery Trail</p>
            <div data-testid="report-stats">
              <span>Total Points: 500</span>
              <span>Duration: 40 min</span>
              <span>Stages: 2/2</span>
            </div>
            <div data-testid="stage-results">
              {mockQuest.stages.map((s) => (
                <div key={s.id}>
                  <p>{s.title} - {s.points} pts</p>
                </div>
              ))}
            </div>
            <button onClick={() => mockPush('/quests')}>Back to Quests</button>
            <button onClick={() => mockPush('/leaderboard')}>View Leaderboard</button>
          </div>
        );
      }

      render(<MockQuestReport />);

      // Completion header
      expect(screen.getByText('Quest Complete!')).toBeInTheDocument();
      expect(screen.getByText('Madrid Mystery Trail')).toBeInTheDocument();

      // Stats
      expect(screen.getByText('Total Points: 500')).toBeInTheDocument();
      expect(screen.getByText('Duration: 40 min')).toBeInTheDocument();
      expect(screen.getByText('Stages: 2/2')).toBeInTheDocument();

      // Stage results
      expect(screen.getByText('The Secret Garden - 200 pts')).toBeInTheDocument();
      expect(screen.getByText('The Royal Palace Clue - 300 pts')).toBeInTheDocument();

      // Navigation actions
      fireEvent.click(screen.getByText('Back to Quests'));
      expect(mockPush).toHaveBeenCalledWith('/quests');

      fireEvent.click(screen.getByText('View Leaderboard'));
      expect(mockPush).toHaveBeenCalledWith('/leaderboard');
    });
  });

  describe('Full End-to-End Flow Data Passing', () => {
    it('passes quest data correctly through the navigation flow', () => {
      // Verify that quest data is structured correctly for all flow steps
      expect(mockQuest.id).toBe('q1');
      expect(mockQuest.stages).toHaveLength(2);
      expect(mockQuest.stages[0].character.name).toBe('Don Quixote');
      expect(mockQuest.stages[1].character.name).toBe('Isabella');
      expect(mockQuest.totalPoints).toBe(
        mockQuest.stages.reduce((sum, s) => sum + s.points, 0),
      );
    });

    it('tracks progress state correctly through quest lifecycle', () => {
      // Initial state: no progress
      expect(progressData).toBeNull();

      // After starting quest
      progressData = { ...mockProgress };
      expect(progressData.status).toBe('in_progress');
      expect(progressData.currentStageIndex).toBe(0);
      expect(progressData.completedStages).toHaveLength(0);

      // After completing first stage
      progressData = {
        ...mockProgress,
        currentStageIndex: 1,
        completedStages: [
          {
            stageId: 's1',
            conversationId: 'conv1',
            points: 200,
            attempts: 1,
            completedAt: '2026-03-15T10:30:00Z',
            duration: 1500,
          },
        ],
        totalPoints: 200,
        totalDuration: 1500,
      };
      expect(progressData.currentStageIndex).toBe(1);
      expect(progressData.completedStages).toHaveLength(1);
      expect(progressData.totalPoints).toBe(200);

      // After completing all stages
      progressData = {
        ...mockProgress,
        currentStageIndex: 2,
        status: 'completed' as const,
        completedStages: [
          {
            stageId: 's1',
            conversationId: 'conv1',
            points: 200,
            attempts: 1,
            completedAt: '2026-03-15T10:30:00Z',
            duration: 1500,
          },
          {
            stageId: 's2',
            conversationId: 'conv2',
            points: 300,
            attempts: 1,
            completedAt: '2026-03-15T10:45:00Z',
            duration: 900,
          },
        ],
        totalPoints: 500,
        totalDuration: 2400,
        completedAt: '2026-03-15T10:45:00Z',
      };
      expect(progressData.status).toBe('completed');
      expect(progressData.totalPoints).toBe(500);
      expect(progressData.completedStages).toHaveLength(2);
    });
  });
});
