'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  Zap,
  Coffee,
  ChevronDown,
  ChevronUp,
  Target,
  MessageSquare,
  Lightbulb,
  Heart,
  Puzzle,
} from 'lucide-react';

// ---------- Types ----------

interface CategoryPerformance {
  category: string;
  label: string;
  avgScore: number;
  completionRate: number;
  questsCompleted: number;
}

interface PastPerformance {
  overallAvgScore: number;
  totalQuestsCompleted: number;
  easyCompletionRate: number;
  mediumCompletionRate: number;
  hardCompletionRate: number;
  legendaryCompletionRate: number;
  categoryPerformance: CategoryPerformance[];
  currentStreak: number;
  bestStreak: number;
}

type RecommendedDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

interface DifficultyAdvisorProps {
  performance: PastPerformance;
  onSelectDifficulty?: (difficulty: RecommendedDifficulty) => void;
  className?: string;
}

// ---------- Helpers ----------

const DIFFICULTY_CONFIG: Record<
  RecommendedDifficulty,
  { label: string; color: string; bgColor: string; gradient: string }
> = {
  easy: {
    label: 'Easy',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-400',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500',
    gradient: 'from-amber-500 to-yellow-400',
  },
  hard: {
    label: 'Hard',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500',
    gradient: 'from-orange-500 to-red-400',
  },
  legendary: {
    label: 'Legendary',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500',
    gradient: 'from-rose-500 to-fuchsia-500',
  },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  adventure: Zap,
  mystery: Puzzle,
  negotiation: MessageSquare,
  riddle: Lightbulb,
  cultural: Heart,
  default: Target,
};

function getRecommendedDifficulty(perf: PastPerformance): RecommendedDifficulty {
  const { overallAvgScore, mediumCompletionRate, hardCompletionRate } = perf;

  if (overallAvgScore >= 85 && hardCompletionRate >= 70) return 'legendary';
  if (overallAvgScore >= 70 && mediumCompletionRate >= 60) return 'hard';
  if (overallAvgScore >= 50 && perf.totalQuestsCompleted >= 3) return 'medium';
  return 'easy';
}

function getReasons(perf: PastPerformance, recommended: RecommendedDifficulty): string[] {
  const reasons: string[] = [];
  reasons.push(`Your average score is ${Math.round(perf.overallAvgScore)}%`);

  const rateMap: Record<RecommendedDifficulty, number> = {
    easy: perf.easyCompletionRate,
    medium: perf.mediumCompletionRate,
    hard: perf.hardCompletionRate,
    legendary: perf.legendaryCompletionRate,
  };
  const rate = rateMap[recommended];
  if (rate > 0) {
    reasons.push(
      `You complete ${Math.round(rate)}% of ${DIFFICULTY_CONFIG[recommended].label.toLowerCase()} quests`,
    );
  }

  if (perf.currentStreak >= 3) {
    reasons.push(`You're on a ${perf.currentStreak}-day streak`);
  }

  if (perf.totalQuestsCompleted < 5) {
    reasons.push('Build confidence with more completions first');
  }

  return reasons;
}

function getChallengeUp(recommended: RecommendedDifficulty): RecommendedDifficulty | null {
  const order: RecommendedDifficulty[] = ['easy', 'medium', 'hard', 'legendary'];
  const idx = order.indexOf(recommended);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

function getRelaxDown(recommended: RecommendedDifficulty): RecommendedDifficulty | null {
  const order: RecommendedDifficulty[] = ['easy', 'medium', 'hard', 'legendary'];
  const idx = order.indexOf(recommended);
  return idx > 0 ? order[idx - 1] : null;
}

// ---------- Skill Level Bar ----------

function SkillLevelBar({ category }: { category: CategoryPerformance }) {
  const Icon = CATEGORY_ICONS[category.category] ?? CATEGORY_ICONS.default;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={12} className="text-slate-400" />
          <span className="text-[11px] font-medium text-white">{category.label}</span>
        </div>
        <span className="text-[10px] text-slate-400">
          {Math.round(category.avgScore)}% avg
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(category.avgScore, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-slate-600">
          {category.questsCompleted} quests completed
        </span>
        <span className="text-[9px] text-slate-600">
          {Math.round(category.completionRate)}% completion
        </span>
      </div>
    </div>
  );
}

// ---------- Main Component ----------

const DifficultyAdvisor: React.FC<DifficultyAdvisorProps> = ({
  performance,
  onSelectDifficulty,
  className = '',
}) => {
  const [showSkills, setShowSkills] = useState(false);

  const recommended = useMemo(
    () => getRecommendedDifficulty(performance),
    [performance],
  );
  const reasons = useMemo(
    () => getReasons(performance, recommended),
    [performance, recommended],
  );
  const challengeUp = getChallengeUp(recommended);
  const relaxDown = getRelaxDown(recommended);
  const config = DIFFICULTY_CONFIG[recommended];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Brain size={16} className="text-violet-400" />
        <span className="text-sm font-medium text-white">Difficulty Advisor</span>
      </div>

      {/* Recommendation */}
      <div className="mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
        <p className="text-[11px] text-slate-400 mb-2">Recommended difficulty for you:</p>
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${config.gradient} text-white text-sm font-bold`}
          >
            {config.label}
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={12} className={config.color} />
            <span className={`text-xs font-medium ${config.color}`}>Best fit</span>
          </div>
        </div>
      </div>

      {/* Reasons */}
      <div className="space-y-1.5 mb-4">
        {reasons.map((reason, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
            <span className="text-[11px] text-slate-300 leading-relaxed">{reason}</span>
          </div>
        ))}
      </div>

      {/* Challenge / Relax buttons */}
      <div className="flex gap-2 mb-4">
        {challengeUp && (
          <button
            onClick={() => onSelectDifficulty?.(challengeUp)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/15 transition-all"
          >
            <Zap size={12} />
            Challenge yourself!
          </button>
        )}
        {relaxDown && (
          <button
            onClick={() => onSelectDifficulty?.(relaxDown)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/15 transition-all"
          >
            <Coffee size={12} />
            Take it easy
          </button>
        )}
      </div>

      {/* Select recommended */}
      <button
        onClick={() => onSelectDifficulty?.(recommended)}
        className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${config.gradient} text-white text-xs font-bold mb-4 hover:opacity-90 transition-opacity`}
      >
        Go with {config.label}
      </button>

      {/* Skill levels toggle */}
      <button
        onClick={() => setShowSkills((s) => !s)}
        className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
      >
        <Target size={12} />
        <span>Skill levels per category</span>
        {showSkills ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      <AnimatePresence>
        {showSkills && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {performance.categoryPerformance.map((cat) => (
                <SkillLevelBar key={cat.category} category={cat} />
              ))}
              {performance.categoryPerformance.length === 0 && (
                <p className="text-[11px] text-slate-500 text-center py-2">
                  Complete some quests to see your skill breakdown.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DifficultyAdvisor;
