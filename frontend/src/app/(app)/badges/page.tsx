'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Star,
  Target,
  Flame,
  Compass,
  Zap,
  Crown,
  Shield,
  Users,
  Award,
  Sparkles,
  Share2,
  Filter,
} from 'lucide-react';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_ACHIEVEMENTS } from '@/lib/graphql/queries';
import type { Achievement } from '@/types';

// ---------- Types ----------

type BadgeCategory = 'quest' | 'social' | 'skill' | 'special';

interface BadgeDefinition {
  type: string;
  title: string;
  description: string;
  category: BadgeCategory;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
  maxProgress?: number;
}

// ---------- Constants ----------

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 10 },
  show: { opacity: 1, scale: 1, y: 0 },
};

const ALL_BADGES: BadgeDefinition[] = [
  // Quest badges
  {
    type: 'first_quest',
    title: 'First Steps',
    description: 'Complete your first quest',
    category: 'quest',
    icon: Compass,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/20',
    rarity: 'common',
    requirement: 'Complete 1 quest',
    maxProgress: 1,
  },
  {
    type: 'adventurer',
    title: 'Adventurer',
    description: 'Complete 5 quests',
    category: 'quest',
    icon: Target,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20',
    rarity: 'common',
    requirement: 'Complete 5 quests',
    maxProgress: 5,
  },
  {
    type: 'explorer',
    title: 'Seasoned Explorer',
    description: 'Complete 10 quests across different categories',
    category: 'quest',
    icon: Compass,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/15',
    borderColor: 'border-teal-500/30',
    glowColor: 'shadow-teal-500/20',
    rarity: 'rare',
    requirement: 'Complete 10 quests',
    maxProgress: 10,
  },
  // Skill badges
  {
    type: 'speed_runner',
    title: 'Speed Runner',
    description: 'Complete a quest in under 10 minutes',
    category: 'skill',
    icon: Zap,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/20',
    rarity: 'rare',
    requirement: 'Finish any quest under 10 minutes',
  },
  {
    type: 'perfect_score',
    title: 'Perfectionist',
    description: 'Achieve a perfect score on any quest',
    category: 'skill',
    icon: Star,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/15',
    borderColor: 'border-violet-500/30',
    glowColor: 'shadow-violet-500/20',
    rarity: 'epic',
    requirement: 'Score 100% on any quest',
  },
  {
    type: 'streak',
    title: 'On Fire',
    description: 'Maintain a 7-day activity streak',
    category: 'skill',
    icon: Flame,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/30',
    glowColor: 'shadow-rose-500/20',
    rarity: 'rare',
    requirement: '7 consecutive active days',
  },
  // Social badges
  {
    type: 'social',
    title: 'Social Butterfly',
    description: 'Have 20 conversations with AI characters',
    category: 'social',
    icon: Users,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/15',
    borderColor: 'border-pink-500/30',
    glowColor: 'shadow-pink-500/20',
    rarity: 'common',
    requirement: 'Complete 20 conversations',
    maxProgress: 20,
  },
  {
    type: 'champion',
    title: 'Champion',
    description: 'Reach the top 3 on the leaderboard',
    category: 'social',
    icon: Crown,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/20',
    rarity: 'legendary',
    requirement: 'Top 3 on global leaderboard',
  },
  {
    type: 'protector',
    title: 'Guardian',
    description: 'Help 10 other players',
    category: 'social',
    icon: Shield,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20',
    rarity: 'rare',
    requirement: 'Help 10 other players',
    maxProgress: 10,
  },
  // Special badges
  {
    type: 'legendary',
    title: 'Legend',
    description: 'Complete a legendary difficulty quest',
    category: 'special',
    icon: Trophy,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/20',
    rarity: 'legendary',
    requirement: 'Complete a legendary quest',
  },
  {
    type: 'collector',
    title: 'Collector',
    description: 'Earn 10 different badges',
    category: 'special',
    icon: Award,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/15',
    borderColor: 'border-violet-500/30',
    glowColor: 'shadow-violet-500/20',
    rarity: 'epic',
    requirement: 'Earn 10 different badges',
    maxProgress: 10,
  },
  {
    type: 'veteran',
    title: 'Veteran',
    description: 'Accumulate 100 hours of play time',
    category: 'special',
    icon: Sparkles,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/15',
    borderColor: 'border-indigo-500/30',
    glowColor: 'shadow-indigo-500/20',
    rarity: 'legendary',
    requirement: '100 hours total play time',
  },
];

const RARITY_COLORS: Record<string, { text: string; bg: string }> = {
  common: { text: 'text-slate-400', bg: 'bg-slate-500/20' },
  rare: { text: 'text-blue-400', bg: 'bg-blue-500/20' },
  epic: { text: 'text-violet-400', bg: 'bg-violet-500/20' },
  legendary: { text: 'text-amber-400', bg: 'bg-amber-500/20' },
};

const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  quest: 'Quest Badges',
  social: 'Social Badges',
  skill: 'Skill Badges',
  special: 'Special Badges',
};

// ---------- Badge Card ----------

function BadgeCard({
  badge,
  earned,
  earnedAt,
  isNew,
  progress,
}: {
  badge: BadgeDefinition;
  earned: boolean;
  earnedAt?: string;
  isNew?: boolean;
  progress?: number;
}) {
  const Icon = badge.icon;
  const rarityStyle = RARITY_COLORS[badge.rarity];

  return (
    <motion.div variants={badgeVariants} className="relative">
      {/* New badge shimmer */}
      {isNew && earned && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: 3 }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
      )}

      <div
        className={`glass rounded-2xl p-5 text-center relative overflow-hidden transition-all duration-300 border ${
          earned
            ? `${badge.borderColor} shadow-lg ${badge.glowColor} hover:shadow-xl`
            : 'border-slate-700/20 opacity-50 grayscale'
        }`}
      >
        {earned && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
        )}

        <div className="relative">
          {/* Rarity tag */}
          <div className="absolute -top-1 -right-1">
            <span
              className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${rarityStyle.bg} ${rarityStyle.text}`}
            >
              {badge.rarity}
            </span>
          </div>

          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
              earned ? badge.bgColor : 'bg-navy-800'
            }`}
          >
            {earned ? (
              <Icon className={`w-8 h-8 ${badge.color}`} />
            ) : (
              <Icon className="w-8 h-8 text-slate-600" />
            )}
          </div>

          {/* Title */}
          <h4
            className={`font-heading font-semibold text-sm ${
              earned ? 'text-white' : 'text-slate-500'
            }`}
          >
            {badge.title}
          </h4>

          {/* Description */}
          <p
            className={`text-[11px] mt-1 ${
              earned ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {badge.description}
          </p>

          {/* Progress bar for unearned */}
          {!earned && badge.maxProgress && progress !== undefined && (
            <div className="mt-3">
              <div className="h-1.5 rounded-full bg-navy-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${badge.bgColor.replace('/15', '')}`}
                  style={{
                    width: `${Math.min((progress / badge.maxProgress) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-[9px] text-slate-600 mt-1">
                {progress}/{badge.maxProgress}
              </p>
            </div>
          )}

          {/* Earned date */}
          {earned && earnedAt && (
            <p className="text-[10px] text-slate-500 mt-2.5">
              Earned{' '}
              {new Date(earnedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}

          {/* Requirement hint for unearned */}
          {!earned && (
            <p className="text-[9px] text-slate-600 mt-2 italic">
              {badge.requirement}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Rarity Distribution ----------

function RarityChart({ earned }: { earned: Set<string> }) {
  const distribution = useMemo(() => {
    const counts: Record<string, { total: number; earned: number }> = {};
    for (const badge of ALL_BADGES) {
      if (!counts[badge.rarity]) counts[badge.rarity] = { total: 0, earned: 0 };
      counts[badge.rarity].total++;
      if (earned.has(badge.type)) counts[badge.rarity].earned++;
    }
    return counts;
  }, [earned]);

  return (
    <div className="space-y-2">
      {['common', 'rare', 'epic', 'legendary'].map((rarity) => {
        const data = distribution[rarity] ?? { total: 0, earned: 0 };
        const pct = data.total > 0 ? (data.earned / data.total) * 100 : 0;
        const style = RARITY_COLORS[rarity];

        return (
          <div key={rarity} className="flex items-center gap-2">
            <span className={`text-[10px] w-16 capitalize ${style.text}`}>
              {rarity}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${style.bg.replace('/20', '')}`}
              />
            </div>
            <span className="text-[10px] text-slate-500 w-8 text-right">
              {data.earned}/{data.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Main Page ----------

export default function BadgesPage() {
  const { data: achievements, loading, execute } = useQuery<Achievement[]>(GET_ACHIEVEMENTS);
  const [activeCategory, setActiveCategory] = useState<BadgeCategory | 'all'>('all');
  const [newBadgeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    execute();
  }, [execute]);

  const earnedTypes = useMemo(
    () => new Set(achievements?.map((a) => a.type) || []),
    [achievements],
  );

  const earnedMap = useMemo(() => {
    const map: Record<string, Achievement> = {};
    for (const a of achievements ?? []) {
      map[a.type] = a;
    }
    return map;
  }, [achievements]);

  const filteredBadges = useMemo(() => {
    const badges =
      activeCategory === 'all'
        ? ALL_BADGES
        : ALL_BADGES.filter((b) => b.category === activeCategory);
    // Sort: earned first
    return [...badges].sort((a, b) => {
      const aEarned = earnedTypes.has(a.type) ? 0 : 1;
      const bEarned = earnedTypes.has(b.type) ? 0 : 1;
      return aEarned - bEarned;
    });
  }, [activeCategory, earnedTypes]);

  const earnedCount = ALL_BADGES.filter((b) => earnedTypes.has(b.type)).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Badge Collection</h1>
          <p className="text-slate-400 mt-1">
            {earnedCount} of {ALL_BADGES.length} badges earned
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-colors"
        >
          <Share2 size={12} />
          Share Collection
        </button>
      </motion.div>

      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-300">Collection Progress</span>
          <span className="text-sm text-violet-400 font-medium">
            {Math.round((earnedCount / ALL_BADGES.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-navy-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(earnedCount / ALL_BADGES.length) * 100}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-rose-500 to-amber-500"
          />
        </div>
      </motion.div>

      {/* Rarity distribution + Category filters */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-xl p-4"
        >
          <h3 className="text-xs font-semibold text-white mb-3">Rarity Distribution</h3>
          <RarityChart earned={earnedTypes} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 glass rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter size={12} className="text-slate-400" />
            <h3 className="text-xs font-semibold text-white">Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeCategory === 'all'
                  ? 'bg-violet-500/15 border-violet-500/30 text-violet-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              All ({ALL_BADGES.length})
            </button>
            {(Object.keys(CATEGORY_LABELS) as BadgeCategory[]).map((cat) => {
              const count = ALL_BADGES.filter((b) => b.category === cat).length;
              const earnedInCat = ALL_BADGES.filter(
                (b) => b.category === cat && earnedTypes.has(b.type),
              ).length;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    activeCategory === cat
                      ? 'bg-violet-500/15 border-violet-500/30 text-violet-400'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {CATEGORY_LABELS[cat]} ({earnedInCat}/{count})
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Badge Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-navy-800 mx-auto mb-3" />
              <div className="h-4 w-2/3 bg-navy-800 rounded mx-auto mb-2" />
              <div className="h-3 w-full bg-navy-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredBadges.map((badge) => (
            <BadgeCard
              key={badge.type}
              badge={badge}
              earned={earnedTypes.has(badge.type)}
              earnedAt={earnedMap[badge.type]?.earnedAt}
              isNew={newBadgeIds.has(badge.type)}
              progress={undefined}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
