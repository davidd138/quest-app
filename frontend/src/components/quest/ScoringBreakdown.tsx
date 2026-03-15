'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Zap,
  MessageSquare,
  Lightbulb,
  Heart,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Info,
} from 'lucide-react';

// ---------- Types ----------

interface ScoreCategory {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  weight: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  tip: string;
  averageScore?: number;
}

interface ScoringBreakdownProps {
  categories: {
    accuracy: number;
    speed: number;
    communication: number;
    creativity: number;
    persistence: number;
  };
  weights?: {
    accuracy: number;
    speed: number;
    communication: number;
    creativity: number;
    persistence: number;
  };
  averages?: {
    accuracy: number;
    speed: number;
    communication: number;
    creativity: number;
    persistence: number;
  };
  maxScore?: number;
  animated?: boolean;
  className?: string;
}

// ---------- Constants ----------

const DEFAULT_WEIGHTS = {
  accuracy: 0.3,
  speed: 0.2,
  communication: 0.2,
  creativity: 0.15,
  persistence: 0.15,
};

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bgColor: string; tip: string }
> = {
  accuracy: {
    label: 'Accuracy',
    icon: Target,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
    tip: 'Solve challenges correctly on the first attempt. Read instructions carefully.',
  },
  speed: {
    label: 'Speed',
    icon: Zap,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500',
    tip: 'Complete challenges faster to earn time bonuses. Practice improves speed.',
  },
  communication: {
    label: 'Communication',
    icon: MessageSquare,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
    tip: 'Engage meaningfully with characters. Ask questions and show interest in their story.',
  },
  creativity: {
    label: 'Creativity',
    icon: Lightbulb,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500',
    tip: 'Try unique approaches. Think outside the box and explore alternative solutions.',
  },
  persistence: {
    label: 'Persistence',
    icon: Heart,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500',
    tip: 'Minimize hint usage and complete challenges with fewer attempts.',
  },
};

// ---------- Score Bar Component ----------

function ScoreBar({
  category,
  index,
  animated,
  showComparison,
}: {
  category: ScoreCategory;
  index: number;
  animated: boolean;
  showComparison: boolean;
}) {
  const [revealed, setRevealed] = useState(!animated);
  const percentage = (category.score / category.maxScore) * 100;
  const avgPercentage = category.averageScore
    ? (category.averageScore / category.maxScore) * 100
    : 0;
  const Icon = category.icon;

  useEffect(() => {
    if (!animated) return;
    const timer = setTimeout(() => setRevealed(true), index * 400 + 200);
    return () => clearTimeout(timer);
  }, [animated, index]);

  return (
    <motion.div
      initial={animated ? { opacity: 0, x: -20 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      className="space-y-1.5"
    >
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} className={category.color} />
          <span className="text-xs font-medium text-white">{category.label}</span>
          <span className="text-[10px] text-slate-500">
            (x{category.weight.toFixed(2)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${category.color}`}>
            {revealed ? category.score : 0}
          </span>
          <span className="text-[10px] text-slate-600">/ {category.maxScore}</span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${category.bgColor}`}
          initial={{ width: 0 }}
          animate={{ width: revealed ? `${percentage}%` : '0%' }}
          transition={{ duration: 0.8, delay: index * 0.15, ease: 'easeOut' }}
        />
        {/* Average marker */}
        {showComparison && category.averageScore !== undefined && (
          <div
            className="absolute top-0 h-full w-0.5 bg-white/30"
            style={{ left: `${avgPercentage}%` }}
          />
        )}
      </div>

      {/* Comparison */}
      {showComparison && category.averageScore !== undefined && (
        <div className="flex items-center gap-1 text-[10px]">
          {category.score > category.averageScore ? (
            <>
              <TrendingUp size={10} className="text-emerald-400" />
              <span className="text-emerald-400">
                +{category.score - category.averageScore} vs avg
              </span>
            </>
          ) : category.score < category.averageScore ? (
            <>
              <TrendingUp size={10} className="text-rose-400 rotate-180" />
              <span className="text-rose-400">
                {category.score - category.averageScore} vs avg
              </span>
            </>
          ) : (
            <span className="text-slate-500">Equal to average</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ---------- Main Component ----------

const ScoringBreakdown: React.FC<ScoringBreakdownProps> = ({
  categories,
  weights = DEFAULT_WEIGHTS,
  averages,
  maxScore = 100,
  animated = true,
  className = '',
}) => {
  const [showTips, setShowTips] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  const scoreCategories: ScoreCategory[] = Object.entries(categories).map(([key, score]) => ({
    key,
    ...CATEGORY_CONFIG[key],
    score,
    maxScore,
    weight: weights[key as keyof typeof weights],
    averageScore: averages?.[key as keyof typeof averages],
  }));

  // Calculate total weighted score
  const totalWeightedScore = scoreCategories.reduce(
    (sum, cat) => sum + cat.score * cat.weight,
    0,
  );
  const maxWeightedScore = scoreCategories.reduce(
    (sum, cat) => sum + cat.maxScore * cat.weight,
    0,
  );
  const totalPercentage = Math.round((totalWeightedScore / maxWeightedScore) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-white">Score Breakdown</h3>
        <motion.div
          initial={animated ? { scale: 0 } : false}
          animate={{ scale: 1 }}
          transition={{ delay: scoreCategories.length * 0.15 + 0.5, type: 'spring' }}
          className="flex items-center gap-2"
        >
          <span className="text-2xl font-bold text-white">{totalPercentage}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </motion.div>
      </div>

      {/* Category bars */}
      <div className="space-y-4 mb-5">
        {scoreCategories.map((cat, i) => (
          <ScoreBar
            key={cat.key}
            category={cat}
            index={i}
            animated={animated}
            showComparison={!!averages}
          />
        ))}
      </div>

      {/* Formula toggle */}
      <button
        onClick={() => setShowFormula((f) => !f)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors mb-3"
      >
        <Info size={12} />
        <span>Scoring formula</span>
        {showFormula ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      <AnimatePresence>
        {showFormula && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 mb-3">
              <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                Total = {scoreCategories.map((c) => `(${c.label} x ${c.weight})`).join(' + ')}
              </p>
              <p className="text-[11px] text-slate-500 mt-1.5">
                = {scoreCategories.map((c) => `(${c.score} x ${c.weight})`).join(' + ')}
              </p>
              <p className="text-[11px] text-white font-medium mt-1.5">
                = {totalWeightedScore.toFixed(1)} / {maxWeightedScore.toFixed(1)} ({totalPercentage}%)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Improvement tips toggle */}
      <button
        onClick={() => setShowTips((t) => !t)}
        className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
      >
        <Lightbulb size={12} />
        <span>How to improve</span>
        {showTips ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      <AnimatePresence>
        {showTips && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {scoreCategories
                .sort((a, b) => a.score / a.maxScore - b.score / b.maxScore)
                .slice(0, 3)
                .map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.key}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                    >
                      <Icon size={12} className={`${cat.color} mt-0.5 flex-shrink-0`} />
                      <div>
                        <p className="text-[11px] font-medium text-white">{cat.label}</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{cat.tip}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ScoringBreakdown;
