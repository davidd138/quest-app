'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Timer, Zap, AlertTriangle } from 'lucide-react';

// ---------- Types ----------

type TimeLimit = 30 | 60 | 120 | 300;

interface TimedChallengeProps {
  timeLimit: TimeLimit;
  isActive: boolean;
  maxPauses?: number;
  bestTime?: number;
  onTimeUp: (elapsedSeconds: number) => void;
  onComplete?: (elapsedSeconds: number, multiplier: number) => void;
  className?: string;
}

interface TimerPhase {
  color: string;
  ringColor: string;
  bgColor: string;
  label: string;
}

// ---------- Helpers ----------

const PHASES: { threshold: number; phase: TimerPhase }[] = [
  {
    threshold: 0.5,
    phase: {
      color: 'text-emerald-400',
      ringColor: 'stroke-emerald-500',
      bgColor: 'bg-emerald-500/10',
      label: 'Plenty of Time',
    },
  },
  {
    threshold: 0.75,
    phase: {
      color: 'text-amber-400',
      ringColor: 'stroke-amber-500',
      bgColor: 'bg-amber-500/10',
      label: 'Keep Going',
    },
  },
  {
    threshold: 0.9,
    phase: {
      color: 'text-orange-400',
      ringColor: 'stroke-orange-500',
      bgColor: 'bg-orange-500/10',
      label: 'Hurry Up',
    },
  },
  {
    threshold: 1.0,
    phase: {
      color: 'text-rose-400',
      ringColor: 'stroke-rose-500',
      bgColor: 'bg-rose-500/10',
      label: 'Almost Out!',
    },
  },
];

function getPhase(ratio: number): TimerPhase {
  for (const { threshold, phase } of PHASES) {
    if (ratio <= threshold) return phase;
  }
  return PHASES[PHASES.length - 1].phase;
}

function getMultiplier(ratio: number): number {
  if (ratio < 0.5) return 2.0;
  if (ratio < 0.75) return 1.5;
  return 1.0;
}

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ---------- Progress Ring ----------

function ProgressRing({
  radius,
  stroke,
  progress,
  className,
}: {
  radius: number;
  stroke: number;
  progress: number;
  className: string;
}) {
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
      {/* Background ring */}
      <circle
        stroke="rgba(255,255,255,0.05)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {/* Progress ring */}
      <motion.circle
        className={className}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{
          strokeDasharray: circumference,
        }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </svg>
  );
}

// ---------- Main Component ----------

const TimedChallenge: React.FC<TimedChallengeProps> = ({
  timeLimit,
  isActive,
  maxPauses = 3,
  bestTime,
  onTimeUp,
  onComplete,
  className = '',
}) => {
  const [remaining, setRemaining] = useState<number>(timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [pausesUsed, setPausesUsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const elapsed = timeLimit - remaining;
  const ratio = elapsed / timeLimit;
  const phase = getPhase(ratio);
  const multiplier = getMultiplier(ratio);
  const showWarning = remaining <= 10 && remaining > 0;

  // Tick countdown
  useEffect(() => {
    if (!isActive || isPaused || isFinished) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          setShowTimeUp(true);
          onTimeUp(timeLimit);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, isFinished, timeLimit, onTimeUp]);

  const handlePause = useCallback(() => {
    if (pausesUsed >= maxPauses || isFinished) return;
    setIsPaused(true);
    setPausesUsed((p) => p + 1);
  }, [pausesUsed, maxPauses, isFinished]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleComplete = useCallback(() => {
    if (isFinished) return;
    setIsFinished(true);
    onComplete?.(elapsed, multiplier);
  }, [isFinished, elapsed, multiplier, onComplete]);

  const progressRatio = remaining / timeLimit;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-2xl border border-white/10 ${phase.bgColor} backdrop-blur-xl p-6 ${className}`}
    >
      {/* Time's up overlay */}
      <AnimatePresence>
        {showTimeUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 rounded-2xl bg-navy-950/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              <Timer size={48} className="text-rose-400 mb-4" />
            </motion.div>
            <h3 className="text-2xl font-heading font-bold text-white mb-2">
              Time&apos;s Up!
            </h3>
            <p className="text-slate-400 text-sm mb-1">
              You used all {formatCountdown(timeLimit)}
            </p>
            <p className="text-slate-500 text-xs">Score multiplier: 1.0x</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer size={16} className={phase.color} />
          <span className="text-xs font-medium text-slate-300">Timed Challenge</span>
        </div>
        <span className={`text-xs font-medium ${phase.color}`}>{phase.label}</span>
      </div>

      {/* Circular countdown */}
      <div className="relative flex items-center justify-center mb-4">
        <ProgressRing
          radius={64}
          stroke={6}
          progress={progressRatio}
          className={phase.ringColor}
        />
        <div className="absolute flex flex-col items-center">
          <motion.span
            className={`font-mono text-2xl font-bold ${phase.color} tracking-wider`}
            animate={showWarning ? { scale: [1, 1.05, 1] } : {}}
            transition={showWarning ? { duration: 0.5, repeat: Infinity } : {}}
          >
            {formatCountdown(remaining)}
          </motion.span>
          {isPaused && (
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[10px] text-slate-500 mt-0.5"
            >
              PAUSED
            </motion.span>
          )}
        </div>
      </div>

      {/* Warning pulse */}
      <AnimatePresence>
        {showWarning && !isFinished && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex items-center justify-center gap-1.5 mb-3"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <AlertTriangle size={14} className="text-rose-400" />
            </motion.div>
            <span className="text-xs text-rose-400 font-medium">
              {remaining} seconds remaining!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multiplier indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Zap size={14} className={multiplier > 1 ? 'text-amber-400' : 'text-slate-500'} />
        <span
          className={`text-sm font-bold ${
            multiplier === 2.0
              ? 'text-amber-400'
              : multiplier === 1.5
                ? 'text-emerald-400'
                : 'text-slate-500'
          }`}
        >
          {multiplier}x Multiplier
        </span>
      </div>

      {/* Best time ghost indicator */}
      {bestTime && bestTime < timeLimit && (
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <div
            className="h-1 rounded-full bg-amber-500/30 relative overflow-hidden"
            style={{ width: '100%' }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-amber-500/60 rounded-full"
              style={{ width: `${((timeLimit - bestTime) / timeLimit) * 100}%` }}
            />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 border border-amber-300"
              style={{ left: `${((timeLimit - bestTime) / timeLimit) * 100}%` }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="text-[10px] text-amber-400/60 whitespace-nowrap ml-1">
            Best: {formatCountdown(bestTime)}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isFinished && (
          <>
            <button
              onClick={isPaused ? handleResume : handlePause}
              disabled={!isPaused && pausesUsed >= maxPauses}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isPaused
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  : pausesUsed >= maxPauses
                    ? 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              {isPaused ? <Play size={12} /> : <Pause size={12} />}
              {isPaused ? 'Resume' : `Pause (${maxPauses - pausesUsed} left)`}
            </button>

            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-colors"
            >
              Complete
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default TimedChallenge;
