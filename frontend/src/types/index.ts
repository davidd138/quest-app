// Enums
export type UserStatus = 'pending' | 'active' | 'suspended' | 'expired';
export type QuestCategory = 'adventure' | 'mystery' | 'cultural' | 'educational' | 'culinary' | 'nature' | 'urban' | 'team_building';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';
export type ChallengeType = 'conversation' | 'riddle' | 'knowledge' | 'negotiation' | 'persuasion' | 'exploration' | 'trivia';
export type ProgressStatus = 'in_progress' | 'completed' | 'abandoned';
export type ConversationStatus = 'in_progress' | 'completed' | 'analyzed';

// Core types
export interface User {
  userId: string;
  email: string;
  name?: string;
  role: string;
  status: UserStatus;
  avatarUrl?: string;
  totalPoints: number;
  questsCompleted: number;
  groups?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
  radius?: number;
}

export interface Character {
  name: string;
  role: string;
  personality: string;
  backstory: string;
  avatarUrl?: string;
  voiceStyle: string;
  greetingMessage: string;
}

export interface Challenge {
  type: ChallengeType;
  description: string;
  successCriteria: string;
  failureHints: string[];
  maxAttempts?: number;
}

export interface Stage {
  id: string;
  order: number;
  title: string;
  description: string;
  location: Location;
  character: Character;
  challenge: Challenge;
  points: number;
  hints: string[];
  unlockCondition?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  estimatedDuration: number;
  coverImageUrl?: string;
  stages: Stage[];
  totalPoints: number;
  location: Location;
  radius: number;
  tags: string[];
  isPublished: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompletedStage {
  stageId: string;
  conversationId?: string;
  points: number;
  attempts: number;
  completedAt: string;
  duration: number;
}

export interface Progress {
  id: string;
  userId: string;
  questId: string;
  currentStageIndex: number;
  completedStages: CompletedStage[];
  status: ProgressStatus;
  startedAt: string;
  completedAt?: string;
  totalPoints: number;
  totalDuration: number;
}

export interface ChallengeResult {
  passed: boolean;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface Conversation {
  id: string;
  userId: string;
  questId: string;
  stageId: string;
  characterName: string;
  transcript: string;
  status: ConversationStatus;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  challengeResult?: ChallengeResult;
}

export interface Score {
  id: string;
  userId: string;
  questId: string;
  questTitle: string;
  totalPoints: number;
  completionTime: number;
  stagesCompleted: number;
  totalStages: number;
  completedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl?: string;
  totalPoints: number;
  questsCompleted: number;
  averageScore: number;
}

export interface Achievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  iconUrl?: string;
  earnedAt: string;
  questId?: string;
}

export interface ActivityEntry {
  date: string;
  questTitle: string;
  action: string;
  points: number;
}

export interface CategoryStat {
  category: string;
  completed: number;
  total: number;
  averageScore: number;
}

export interface Analytics {
  totalQuests: number;
  questsCompleted: number;
  totalPoints: number;
  averageScore: number;
  totalPlayTime: number;
  favoriteCategory?: string;
  completionRate: number;
  recentActivity: ActivityEntry[];
  categoryBreakdown: CategoryStat[];
}

export interface QuestStat {
  questId: string;
  questTitle: string;
  completions: number;
  averageScore: number;
  averageTime: number;
}

export interface GrowthEntry {
  date: string;
  users: number;
  completions: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalQuests: number;
  totalCompletions: number;
  popularQuests: QuestStat[];
  userGrowth: GrowthEntry[];
}

export interface RealtimeToken {
  token: string;
  expiresAt: number;
}

export interface QuestRating {
  id: string;
  questId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
}

export interface QuestRatingStats {
  averageRating: number;
  totalRatings: number;
  distribution: number[];
}

// Connection types
export interface QuestConnection {
  items: Quest[];
  nextToken?: string;
}

export interface ConversationConnection {
  items: Conversation[];
  nextToken?: string;
}

export interface UserConnection {
  items: User[];
  nextToken?: string;
}

// Input types
export interface LocationInput {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
  radius?: number;
}

export interface CharacterInput {
  name: string;
  role: string;
  personality: string;
  backstory: string;
  avatarUrl?: string;
  voiceStyle: string;
  greetingMessage: string;
}

export interface ChallengeInput {
  type: ChallengeType;
  description: string;
  successCriteria: string;
  failureHints: string[];
  maxAttempts?: number;
}

export interface StageInput {
  id?: string;
  order: number;
  title: string;
  description: string;
  location: LocationInput;
  character: CharacterInput;
  challenge: ChallengeInput;
  points: number;
  hints: string[];
  unlockCondition?: string;
}

export interface CreateQuestInput {
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  estimatedDuration: number;
  coverImageUrl?: string;
  stages: StageInput[];
  location: LocationInput;
  radius: number;
  tags: string[];
  isPublished?: boolean;
}

export interface UpdateQuestInput {
  id: string;
  title?: string;
  description?: string;
  category?: QuestCategory;
  difficulty?: QuestDifficulty;
  estimatedDuration?: number;
  coverImageUrl?: string;
  stages?: StageInput[];
  location?: LocationInput;
  radius?: number;
  tags?: string[];
  isPublished?: boolean;
}

export interface UpdateProgressInput {
  id: string;
  currentStageIndex?: number;
  status?: ProgressStatus;
}

export interface CompleteStageInput {
  questId: string;
  stageId: string;
  conversationId: string;
}

export interface CreateConversationInput {
  questId: string;
  stageId: string;
}

export interface UpdateConversationInput {
  id: string;
  transcript?: string;
  status?: string;
  duration?: number;
}
