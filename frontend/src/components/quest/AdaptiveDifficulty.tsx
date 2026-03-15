'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Minus, Zap, Info } from 'lucide-react';

// ---------- Types ----------

interface DifficultyHistoryEntry {
  stageIndex: number;
  level: number;
  reason: string;
}

interface AdaptiveDifficultyProps {
  currentLevel: number;
  maxLevel?: number;
  performancePercent: number;
  history: DifficultyHistoryEntry[];
  challengeModeEnabled?: boolean;
  onChallengeModeToggle?: (enabled: boolean) => void;
  onDifficultyChange?: (newLevel: number) => void;
  className?: string;
}

// ---------- Helpers ----------

type DifficultyTrend = 'up' | 'down' | 'stable';

function getTrend(performancePercent: number): DifficultyTrend {
  if (performancePercent > 80) return 'up';
  if (performancePercent < 40) return 'down';
  return 'stable';
}

const trendConfig: Record<DifficultyTrend, { icon: React.ElementType; color: string; label: string }> = {
  up: { icon: TrendingUp, color: 'text-emerald-400', label: 'Difficulty increasing' },
  down: { icon: TrendingDown, color: 'text-amber-400', label: 'Difficulty decreasing' },
  stable: { icon: Minus, color: 'text-slate-400', label: 'Difficulty stable' },
};

function getLevelColor(level: number, maxLevel: number): string {
  const ratio = level / maxLevel;
  if (ratio <= 0.3) return 'bg-emerald-500';
  if (ratio <= 0.5) return 'bg-amber-500';
  if (ratio <= 0.7) return 'bg-orange-500';
  return 'bg-rose-500';
}

function getLevelLabel(level: number, maxLevel: number): string {
  const ratio = level / maxLevel;
  if (ratio <= 0.2) return 'Beginner';
  if (ratio <= 0.4) return 'Easy';
  if (ratio <= 0.6) return 'Medium';
  if (ratio <= 0.8) return 'Hard';
  return 'Expert';
}

function getReasonText(performancePercent: number): string {
  if (performancePercent > 80) {
    return 'Your performance is above 80%. The difficulty is increasing to keep you challenged.';
  }
  if (performancePercent < 40) {
    return 'Your performance is below 40%. The difficulty is decreasing to help you improve.';
  }
  return 'Your performance is in the comfort zone (40-80%). Difficulty stays the same.';
}

// ---------- Mini Sparkline ----------

function DifficultySparkline({
  history,
  maxLevel,
}: {
  history: DifficultyHistoryEntry[];
  maxLevel: number;
}) {
  const last10 = history.slice(-10);
  if (last10.length < 2) return null;

  const width = 160;
  const height = 40;
  const padding = 4;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const points = last10.map((entry, i) => {
    const x = padding + (i / (last10.length - 1)) * usableWidth;
    const y = padding + usableHeight - (entry.level / maxLevel) * usableHeight;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="url(#diffGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="diffGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* Current point */}
      {last10.length > 0 && (
        <circle
          cx={padding + ((last10.length - 1) / Math.max(last10.length - 1, 1)) * usableWidth}
          cy={
            padding +
            usableHeight -
            (last10[last10.length - 1].level / maxLevel) * usableHeight
          }
          r="3"
          fill="#8b5cf6"
          stroke="#1e1b4b"
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
}

// ---------- Main Component ----------

const AdaptiveDifficulty: React.FC<AdaptiveDifficultyProps> = ({
  currentLevel,
  maxLevel = 10,
  performancePercent,
  history,
  challengeModeEnabled = false,
  onChallengeModeToggle,
  onDifficultyChange,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const trend = useMemo(() => getTrend(performancePercent), [performancePercent]);
  const trendInfo = trendConfig[trend];
  const TrendIcon = trendInfo.icon;

  const levelColor = getLevelColor(currentLevel, maxLevel);
  const levelLabel = getLevelLabel(currentLevel, maxLevel);
  const reasonText = getReasonText(performancePercent);

  // Comfort zone is between 40-80% performance
  const comfortZoneStart = 40;
  const comfortZoneEnd = 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-violet-400" />
          <span className="text-sm font-medium text-white">Adaptive Difficulty</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendIcon size={14} className={trendInfo.color} />
          <span className={`text-xs ${trendInfo.color}`}>{trendInfo.label}</span>
        </div>
      </div>

      {/* Current level display */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">Level {currentLevel}/{maxLevel}</span>
            <span className="text-xs font-medium text-white">{levelLabel}</span>
          </div>
          {/* Level bar */}
          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${levelColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${(currentLevel / maxLevel) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          {/* Level dots */}
          <div className="flex justify-between mt-1">
            {Array.from({ length: maxLevel }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i < currentLevel ? levelColor : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Comfort zone meter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-500">Performance vs Comfort Zone</span>
          <span className="text-[10px] text-slate-400">{Math.round(performancePercent)}%</span>
        </div>
        <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
          {/* Comfort zone highlight */}
          <div
            className="absolute top-0 h-full bg-emerald-500/10 border-l border-r border-emerald-500/20"
            style={{
              left: `${comfortZoneStart}%`,
              width: `${comfortZoneEnd - comfortZoneStart}%`,
            }}
          />
          {/* Performance indicator */}
          <motion.div
            className="absolute top-0 w-1 h-full bg-violet-400 rounded-full"
            animate={{ left: `${Math.min(performancePercent, 100)}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[9px] text-slate-600">0%</span>
          <span className="text-[9px] text-emerald-500/60">Comfort Zone</span>
          <span className="text-[9px] text-slate-600">100%</span>
        </div>
      </div>

      {/* History sparkline */}
      {history.length >= 2 && (
        <div className="mb-4">
          <span className="text-[10px] text-slate-500 mb-1 block">Difficulty over last stages</span>
          <DifficultySparkline history={history} maxLevel={maxLevel} />
        </div>
      )}

      {/* Challenge mode toggle + tooltip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChallengeModeToggle?.(!challengeModeEnabled)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              challengeModeEnabled
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Zap size={12} />
            Challenge Mode
            {challengeModeEnabled && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500"
              />
            )}
          </button>
        </div>

        {/* Info tooltip */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Info size={14} className="text-slate-500" />
          </button>
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-full right-0 mb-2 w-56 p-3 rounded-xl bg-navy-950/95 backdrop-blur-xl border border-white/10 shadow-xl z-50"
              >
                <p className="text-[11px] text-slate-300 leading-relaxed">{reasonText}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AdaptiveDifficulty;
