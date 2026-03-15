'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import type { QuestDifficulty } from '@/types';

// ---------- Types ----------

interface QuestDifficultyScaleProps {
  difficulty: QuestDifficulty;
  /** Numeric value 0-100 for exact position on the scale */
  difficultyScore?: number;
  /** Metrics to show in tooltip */
  metrics?: {
    estimatedTime?: string;
    challengeCount?: number;
    averageScore?: number;
    completionRate?: number;
  };
  className?: string;
}

// ---------- Config ----------

const segments: { key: QuestDifficulty; label: string; color: string; gradient: string; range: [number, number] }[] = [
  {
    key: 'easy',
    label: 'Easy',
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-emerald-400',
    range: [0, 25],
  },
  {
    key: 'medium',
    label: 'Medium',
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-amber-400',
    range: [25, 50],
  },
  {
    key: 'hard',
    label: 'Hard',
    color: 'text-rose-400',
    gradient: 'from-rose-500 to-rose-400',
    range: [50, 75],
  },
  {
    key: 'legendary',
    label: 'Legendary',
    color: 'text-violet-400',
    gradient: 'from-violet-500 to-fuchsia-500',
    range: [75, 100],
  },
];

const difficultyDefaults: Record<QuestDifficulty, number> = {
  easy: 15,
  medium: 40,
  hard: 65,
  legendary: 88,
};

// ---------- Helpers ----------

function getActiveSegment(difficulty: QuestDifficulty) {
  return segments.find((s) => s.key === difficulty) || segments[0];
}

function getMarkerPosition(difficulty: QuestDifficulty, score?: number): number {
  if (score !== undefined) return Math.min(100, Math.max(0, score));
  return difficultyDefaults[difficulty];
}

// ---------- Sub-components ----------

function Tooltip({
  visible,
  metrics,
  difficulty,
}: {
  visible: boolean;
  metrics?: QuestDifficultyScaleProps['metrics'];
  difficulty: QuestDifficulty;
}) {
  const segment = getActiveSegment(difficulty);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-10"
    >
      <div className="bg-navy-800/95 backdrop-blur-xl rounded-xl border border-white/10 p-3 min-w-[180px] shadow-xl">
        <p className={`text-xs font-semibold ${segment.color} mb-2`}>{segment.label} Difficulty</p>
        <div className="space-y-1.5">
          {metrics?.estimatedTime && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Est. Time</span>
              <span className="text-slate-300 font-medium">{metrics.estimatedTime}</span>
            </div>
          )}
          {metrics?.challengeCount !== undefined && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Challenges</span>
              <span className="text-slate-300 font-medium">{metrics.challengeCount}</span>
            </div>
          )}
          {metrics?.averageScore !== undefined && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Avg. Score</span>
              <span className="text-slate-300 font-medium">{metrics.averageScore}%</span>
            </div>
          )}
          {metrics?.completionRate !== undefined && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Completion</span>
              <span className="text-slate-300 font-medium">{metrics.completionRate}%</span>
            </div>
          )}
          {!metrics && (
            <p className="text-[11px] text-slate-500">No detailed metrics available</p>
          )}
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-navy-800/95 border-r border-b border-white/10 rotate-45 -mt-1" />
      </div>
    </motion.div>
  );
}

// ---------- Main Component ----------

const QuestDifficultyScale: React.FC<QuestDifficultyScaleProps> = ({
  difficulty,
  difficultyScore,
  metrics,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const markerPos = getMarkerPosition(difficulty, difficultyScore);
  const activeSegment = getActiveSegment(difficulty);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${className}`}
    >
      {/* Labels */}
      <div className="flex justify-between mb-2">
        {segments.map((seg) => (
          <span
            key={seg.key}
            className={`text-[10px] font-medium transition-colors ${
              seg.key === difficulty ? seg.color : 'text-slate-600'
            }`}
          >
            {seg.label}
          </span>
        ))}
      </div>

      {/* Scale bar */}
      <div className="relative h-3 rounded-full overflow-hidden bg-white/5 border border-white/5">
        {/* Gradient segments */}
        <div className="absolute inset-0 flex">
          {segments.map((seg, i) => (
            <div
              key={seg.key}
              className={`flex-1 bg-gradient-to-r ${seg.gradient} ${
                seg.key === difficulty ? 'opacity-100' : 'opacity-20'
              } transition-opacity duration-500`}
              style={{
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.1)' : undefined,
              }}
            />
          ))}
        </div>

        {/* Animated marker */}
        <div className="absolute inset-0 flex items-center">
          <motion.div
            className="relative"
            initial={{ left: '0%' }}
            animate={{ left: `${markerPos}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            style={{ position: 'absolute' }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {/* Marker pin */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6, type: 'spring', stiffness: 200 }}
              className="relative -translate-x-1/2"
            >
              {/* Glow ring */}
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-0 w-5 h-5 rounded-full -translate-x-[2px] -translate-y-[4px] ${
                  activeSegment.key === 'legendary'
                    ? 'bg-violet-500/30'
                    : activeSegment.key === 'hard'
                      ? 'bg-rose-500/30'
                      : activeSegment.key === 'medium'
                        ? 'bg-amber-500/30'
                        : 'bg-emerald-500/30'
                }`}
              />
              {/* Pin dot */}
              <div
                className={`w-4 h-4 rounded-full border-2 border-white shadow-lg -translate-y-[3px] ${
                  activeSegment.key === 'legendary'
                    ? 'bg-violet-500'
                    : activeSegment.key === 'hard'
                      ? 'bg-rose-500'
                      : activeSegment.key === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                }`}
              />
              {/* Arrow pointing down */}
              <div
                className={`w-0 h-0 mx-auto -mt-[1px] border-l-[4px] border-r-[4px] border-t-[5px] border-transparent ${
                  activeSegment.key === 'legendary'
                    ? 'border-t-violet-500'
                    : activeSegment.key === 'hard'
                      ? 'border-t-rose-500'
                      : activeSegment.key === 'medium'
                        ? 'border-t-amber-500'
                        : 'border-t-emerald-500'
                }`}
              />
            </motion.div>

            {/* Tooltip */}
            <Tooltip visible={showTooltip} metrics={metrics} difficulty={difficulty} />
          </motion.div>
        </div>
      </div>

      {/* Info hint */}
      <div className="flex items-center justify-end mt-2">
        <button
          onClick={() => setShowTooltip(!showTooltip)}
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-400 transition-colors"
        >
          <Info size={10} />
          <span>View metrics</span>
        </button>
      </div>
    </motion.div>
  );
};

export default QuestDifficultyScale;
