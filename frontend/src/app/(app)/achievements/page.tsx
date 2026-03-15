'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Target,
  Flame,
  Compass,
  Zap,
  Crown,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_ACHIEVEMENTS } from '@/lib/graphql/queries';
import type { Achievement } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
};

const achievementIcons: Record<string, React.ElementType> = {
  first_quest: Compass,
  speed_runner: Zap,
  perfect_score: Star,
  streak: Flame,
  explorer: Target,
  champion: Crown,
  protector: Shield,
  default: Trophy,
};

const achievementColors: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  first_quest: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20', text: 'text-emerald-400' },
  speed_runner: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', glow: 'shadow-amber-500/20', text: 'text-amber-400' },
  perfect_score: { bg: 'bg-violet-500/15', border: 'border-violet-500/30', glow: 'shadow-violet-500/20', text: 'text-violet-400' },
  streak: { bg: 'bg-rose-500/15', border: 'border-rose-500/30', glow: 'shadow-rose-500/20', text: 'text-rose-400' },
  default: { bg: 'bg-violet-500/15', border: 'border-violet-500/30', glow: 'shadow-violet-500/20', text: 'text-violet-400' },
};

// Placeholder unearned achievements for display
const allAchievementTypes = [
  { type: 'first_quest', title: 'First Steps', description: 'Complete your first quest' },
  { type: 'speed_runner', title: 'Speed Runner', description: 'Complete a quest in under 10 minutes' },
  { type: 'perfect_score', title: 'Perfectionist', description: 'Achieve a perfect score on any quest' },
  { type: 'streak', title: 'On Fire', description: 'Complete 5 quests in a row' },
  { type: 'explorer', title: 'Explorer', description: 'Try all quest categories' },
  { type: 'champion', title: 'Champion', description: 'Reach the top 3 on the leaderboard' },
  { type: 'protector', title: 'Guardian', description: 'Help 10 other players' },
  { type: 'completionist', title: 'Completionist', description: 'Complete all available quests' },
  { type: 'social', title: 'Social Butterfly', description: 'Complete 20 conversations' },
  { type: 'legendary', title: 'Legend', description: 'Complete a legendary difficulty quest' },
  { type: 'collector', title: 'Collector', description: 'Earn 10 different achievements' },
  { type: 'veteran', title: 'Veteran', description: 'Accumulate 100 hours of play time' },
];

function AchievementCard({
  achievement,
  earned,
}: {
  achievement: { type: string; title: string; description: string; earnedAt?: string };
  earned: boolean;
}) {
  const Icon = achievementIcons[achievement.type] || achievementIcons.default;
  const colors = achievementColors[achievement.type] || achievementColors.default;

  return (
    <motion.div variants={cardVariants}>
      <div
        className={`glass rounded-2xl p-6 text-center relative overflow-hidden transition-all duration-300 border ${
          earned
            ? `${colors.border} shadow-lg ${colors.glow} hover:shadow-xl`
            : 'border-slate-700/20 opacity-50 grayscale'
        }`}
      >
        {earned && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
        )}
        <div className="relative">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
              earned ? colors.bg : 'bg-navy-800'
            }`}
          >
            {earned ? (
              <Icon className={`w-8 h-8 ${colors.text}`} />
            ) : (
              <HelpCircle className="w-8 h-8 text-slate-600" />
            )}
          </div>
          <h4 className={`font-heading font-semibold ${earned ? 'text-white' : 'text-slate-500'}`}>
            {achievement.title}
          </h4>
          <p className={`text-sm mt-1.5 ${earned ? 'text-slate-400' : 'text-slate-600'}`}>
            {achievement.description}
          </p>
          {earned && achievement.earnedAt && (
            <p className="text-xs text-slate-500 mt-3">
              Earned {new Date(achievement.earnedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AchievementsPage() {
  const { data: achievements, loading, execute } = useQuery<Achievement[]>(GET_ACHIEVEMENTS);

  useEffect(() => {
    execute();
  }, [execute]);

  const earnedTypes = new Set(achievements?.map((a) => a.type) || []);

  // Merge earned achievements with all possible ones
  const allAchievements = allAchievementTypes.map((template) => {
    const earned = achievements?.find((a) => a.type === template.type);
    return {
      ...template,
      earned: !!earned,
      earnedAt: earned?.earnedAt,
    };
  });

  // Sort: earned first, then by type
  const sorted = [...allAchievements].sort((a, b) => (a.earned === b.earned ? 0 : a.earned ? -1 : 1));
  const earnedCount = allAchievements.filter((a) => a.earned).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-white">Achievements</h1>
        <p className="text-slate-400 mt-1">
          {earnedCount} of {allAchievementTypes.length} unlocked
        </p>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-300">Collection Progress</span>
          <span className="text-sm text-violet-400 font-medium">
            {Math.round((earnedCount / allAchievementTypes.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-navy-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(earnedCount / allAchievementTypes.length) * 100}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-500"
          />
        </div>
      </motion.div>

      {/* Achievement Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-navy-800 mx-auto mb-4" />
              <div className="h-5 w-2/3 bg-navy-800 rounded mx-auto mb-2" />
              <div className="h-4 w-full bg-navy-800 rounded" />
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
          {sorted.map((ach) => (
            <AchievementCard
              key={ach.type}
              achievement={ach}
              earned={ach.earned}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
