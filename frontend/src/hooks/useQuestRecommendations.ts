'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Quest, QuestCategory, QuestDifficulty, Score } from '@/types';

// ---------- Types ----------

export interface RecommendationReason {
  type: 'category_affinity' | 'difficulty_match' | 'geographic' | 'popularity' | 'freshness';
  label: string;
}

export interface RecommendedQuest extends Quest {
  recommendationScore: number;
  reason: RecommendationReason;
}

interface UserPreferences {
  favoriteCategories?: QuestCategory[];
  excludedCategories?: QuestCategory[];
  preferredDifficulty?: QuestDifficulty;
  dismissedQuestIds?: string[];
}

interface UseQuestRecommendationsInput {
  completedQuests: Quest[];
  scores: Score[];
  preferences: UserPreferences;
  availableQuests: Quest[];
  userLocation?: { lat: number; lng: number } | null;
}

interface UseQuestRecommendationsReturn {
  recommendations: RecommendedQuest[];
  categoryRecommendations: RecommendedQuest[];
  challengeRecommendations: RecommendedQuest[];
  nearbyRecommendations: RecommendedQuest[];
  trendingRecommendations: RecommendedQuest[];
  newThisWeek: RecommendedQuest[];
  dismiss: (questId: string) => void;
  refresh: () => void;
  loading: boolean;
}

// ---------- Scoring Weights ----------

const WEIGHTS = {
  categoryAffinity: 0.30,
  difficultyMatch: 0.20,
  geographic: 0.15,
  popularity: 0.20,
  freshness: 0.15,
};

// ---------- Helpers ----------

const DIFFICULTY_ORDER: Record<QuestDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  legendary: 4,
};

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCategoryAffinity(
  completedQuests: Quest[],
): Record<QuestCategory, number> {
  const counts: Partial<Record<QuestCategory, number>> = {};
  const total = completedQuests.length || 1;

  for (const q of completedQuests) {
    counts[q.category] = (counts[q.category] || 0) + 1;
  }

  const affinity: Record<string, number> = {};
  const categories: QuestCategory[] = [
    'adventure', 'mystery', 'cultural', 'educational',
    'culinary', 'nature', 'urban', 'team_building',
  ];

  for (const cat of categories) {
    affinity[cat] = (counts[cat] || 0) / total;
  }

  return affinity as Record<QuestCategory, number>;
}

function getAverageScore(scores: Score[]): number {
  if (scores.length === 0) return 50;
  const total = scores.reduce((sum, s) => sum + s.totalPoints, 0);
  return total / scores.length;
}

function getIdealDifficulty(avgScore: number): QuestDifficulty {
  if (avgScore >= 800) return 'legendary';
  if (avgScore >= 500) return 'hard';
  if (avgScore >= 250) return 'medium';
  return 'easy';
}

function daysSinceCreation(createdAt: string): number {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  return Math.max(0, (now - created) / (1000 * 60 * 60 * 24));
}

const CACHE_KEY = 'qm-recommendation-cache';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface CacheEntry {
  timestamp: number;
  data: RecommendedQuest[];
}

function getCachedResults(): RecommendedQuest[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_DURATION_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCachedResults(data: RecommendedQuest[]): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry = { timestamp: Date.now(), data };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore quota errors
  }
}

// ---------- Scoring ----------

function scoreQuest(
  quest: Quest,
  categoryAffinity: Record<QuestCategory, number>,
  idealDifficulty: QuestDifficulty,
  userLocation: { lat: number; lng: number } | null | undefined,
  maxPlayCount: number,
): { score: number; reason: RecommendationReason } {
  // 1. Category affinity
  const catScore = categoryAffinity[quest.category] || 0;

  // 2. Difficulty match (1.0 = exact, decreasing with distance)
  const idealNum = DIFFICULTY_ORDER[idealDifficulty];
  const questNum = DIFFICULTY_ORDER[quest.difficulty];
  const diffDistance = Math.abs(idealNum - questNum);
  const diffScore = Math.max(0, 1 - diffDistance * 0.3);

  // 3. Geographic proximity (normalized 0-1, 1=close, 0=far/no location)
  let geoScore = 0;
  if (userLocation && quest.location) {
    const dist = haversineDistance(
      userLocation.lat, userLocation.lng,
      quest.location.latitude, quest.location.longitude,
    );
    geoScore = Math.max(0, 1 - dist / 50); // 50km max
  }

  // 4. Popularity (normalized by max play count; use tags length as proxy)
  const popularityProxy = quest.tags.length; // in real app this would be play count
  const popScore = maxPlayCount > 0 ? popularityProxy / maxPlayCount : 0;

  // 5. Freshness (newer quests get a boost)
  const age = daysSinceCreation(quest.createdAt);
  const freshScore = Math.max(0, 1 - age / 90); // 90-day decay

  // Weighted total
  const totalScore =
    catScore * WEIGHTS.categoryAffinity +
    diffScore * WEIGHTS.difficultyMatch +
    geoScore * WEIGHTS.geographic +
    popScore * WEIGHTS.popularity +
    freshScore * WEIGHTS.freshness;

  // Determine primary reason
  const reasons: { score: number; reason: RecommendationReason }[] = [
    {
      score: catScore * WEIGHTS.categoryAffinity,
      reason: {
        type: 'category_affinity',
        label: `Porque disfrutas de ${quest.category.replace('_', ' ')}`,
      },
    },
    {
      score: diffScore * WEIGHTS.difficultyMatch,
      reason: {
        type: 'difficulty_match',
        label: `Dificultad perfecta para ti`,
      },
    },
    {
      score: geoScore * WEIGHTS.geographic,
      reason: {
        type: 'geographic',
        label: `Cerca de tu ubicacion`,
      },
    },
    {
      score: popScore * WEIGHTS.popularity,
      reason: {
        type: 'popularity',
        label: `Popular entre otros jugadores`,
      },
    },
    {
      score: freshScore * WEIGHTS.freshness,
      reason: {
        type: 'freshness',
        label: `Nueva aventura reciente`,
      },
    },
  ];

  const bestReason = reasons.sort((a, b) => b.score - a.score)[0];

  return { score: totalScore, reason: bestReason.reason };
}

// ---------- Hook ----------

export function useQuestRecommendations({
  completedQuests,
  scores,
  preferences,
  availableQuests,
  userLocation,
}: UseQuestRecommendationsInput): UseQuestRecommendationsReturn {
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(
    new Set(preferences.dismissedQuestIds || []),
  );
  const [cacheVersion, setCacheVersion] = useState(0);
  const completedIds = useRef(new Set<string>());

  useEffect(() => {
    completedIds.current = new Set(completedQuests.map((q) => q.id));
  }, [completedQuests]);

  const recommendations = useMemo(() => {
    // Check cache first
    const cached = getCachedResults();
    if (cached && cacheVersion === 0) {
      setLoading(false);
      return cached;
    }

    const categoryAffinity = getCategoryAffinity(completedQuests);
    const avgScore = getAverageScore(scores);
    const idealDifficulty = getIdealDifficulty(avgScore);
    const maxPlayCount = Math.max(1, ...availableQuests.map((q) => q.tags.length));

    const eligible = availableQuests.filter(
      (q) =>
        q.isPublished &&
        !completedIds.current.has(q.id) &&
        !dismissedIds.has(q.id) &&
        !(preferences.excludedCategories || []).includes(q.category),
    );

    const scored: RecommendedQuest[] = eligible.map((quest) => {
      const { score, reason } = scoreQuest(
        quest,
        categoryAffinity,
        idealDifficulty,
        userLocation,
        maxPlayCount,
      );

      return {
        ...quest,
        recommendationScore: Math.round(score * 100),
        reason,
      };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

    setCachedResults(scored);
    setLoading(false);

    return scored;
  }, [availableQuests, completedQuests, scores, preferences, userLocation, dismissedIds, cacheVersion]);

  // Category-based recommendations ("Because you enjoyed X")
  const categoryRecommendations = useMemo(
    () => recommendations.filter((q) => q.reason.type === 'category_affinity').slice(0, 10),
    [recommendations],
  );

  // Challenge recommendations (higher difficulty than usual)
  const challengeRecommendations = useMemo(() => {
    const avgScore = getAverageScore(scores);
    const ideal = DIFFICULTY_ORDER[getIdealDifficulty(avgScore)];
    return recommendations
      .filter((q) => DIFFICULTY_ORDER[q.difficulty] > ideal)
      .slice(0, 10);
  }, [recommendations, scores]);

  // Nearby recommendations
  const nearbyRecommendations = useMemo(
    () => recommendations.filter((q) => q.reason.type === 'geographic').slice(0, 10),
    [recommendations],
  );

  // Trending (popularity-driven)
  const trendingRecommendations = useMemo(
    () =>
      [...recommendations]
        .sort((a, b) => b.tags.length - a.tags.length)
        .slice(0, 10),
    [recommendations],
  );

  // New this week
  const newThisWeek = useMemo(
    () =>
      recommendations
        .filter((q) => daysSinceCreation(q.createdAt) <= 7)
        .slice(0, 10),
    [recommendations],
  );

  const dismiss = useCallback((questId: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(questId);
      return next;
    });
  }, []);

  const refresh = useCallback(() => {
    sessionStorage.removeItem(CACHE_KEY);
    setCacheVersion((v) => v + 1);
    setLoading(true);
  }, []);

  return {
    recommendations,
    categoryRecommendations,
    challengeRecommendations,
    nearbyRecommendations,
    trendingRecommendations,
    newThisWeek,
    dismiss,
    refresh,
    loading,
  };
}
