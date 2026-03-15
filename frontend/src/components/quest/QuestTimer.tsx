'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Pause, Play, Trophy, Zap } from 'lucide-react';

// ---------- Types ----------

interface QuestTimerProps {
  startTime: string;
  estimatedMinutes: number;
  bestTime?: number;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
}

// ---------- Helpers ----------

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [
    hrs.toString().padStart(2, '0'),
    mins.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':');
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

type TimerState = 'under' | 'near' | 'over';

function getTimerState(elapsed: number, estimated: number): TimerState {
  const ratio = elapsed / estimated;
  if (ratio < 0.8) return 'under';
  if (ratio < 1.0) return 'near';
  return 'over';
}

const stateConfig: Record<TimerState, { bg: string; text: string; border: string; label: string }> = {
  under: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    label: 'On Track',
  },
  near: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    label: 'Almost There',
  },
  over: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    label: 'Over Time',
  },
};

// ---------- Main Component ----------

const QuestTimer: React.FC<QuestTimerProps> = ({
  startTime,
  estimatedMinutes,
  bestTime,
  isPaused = false,
  onPause,
  onResume,
  className = '',
}) => {
  const [elapsed, setElapsed] = useState(0);
  const pausedAtRef = useRef(0);
  const totalPausedRef = useRef(0);

  const estimatedSeconds = estimatedMinutes * 60;

  const tick = useCallback(() => {
    if (isPaused) return;
    const start = new Date(startTime).getTime();
    const now = Date.now();
    setElapsed(Math.floor((now - start) / 1000) - totalPausedRef.current);
  }, [startTime, isPaused]);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    if (isPaused) {
      pausedAtRef.current = Date.now();
    } else if (pausedAtRef.current > 0) {
      totalPausedRef.current += Math.floor(
        (Date.now() - pausedAtRef.current) / 1000,
      );
      pausedAtRef.current = 0;
    }
  }, [isPaused]);

  const timerState = getTimerState(elapsed, estimatedSeconds);
  const config = stateConfig[timerState];

  const progressPct = Math.min((elapsed / estimatedSeconds) * 100, 100);
  const timeBonusActive = elapsed < estimatedSeconds;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${config.border} ${config.bg} backdrop-blur-xl p-4 ${className}`}
    >
      {/* Top row: timer + controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className={config.text} />
          <span className="text-xs text-slate-400">Elapsed Time</span>
        </div>

        {/* Pause/Resume */}
        {(onPause || onResume) && (
          <button
            onClick={isPaused ? onResume : onPause}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            {isPaused ? (
              <Play size={14} className="text-emerald-400" />
            ) : (
              <Pause size={14} className="text-slate-400" />
            )}
          </button>
        )}
      </div>

      {/* Timer display */}
      <div className="text-center mb-3">
        <motion.div
          key={isPaused ? 'paused' : 'running'}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{
            scale: 1,
            opacity: isPaused ? 0.5 : 1,
          }}
          className={`font-mono text-3xl font-bold ${config.text} tracking-wider`}
        >
          {formatTime(elapsed)}
        </motion.div>
        {isPaused && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs text-slate-500 mt-1 block"
          >
            PAUSED
          </motion.span>
        )}
      </div>

      {/* Progress bar against estimated */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>Estimated: {estimatedMinutes}m</span>
          <span className={`font-medium ${config.text}`}>{config.label}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors duration-500 ${
              timerState === 'under'
                ? 'bg-emerald-500'
                : timerState === 'near'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
            }`}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Bottom row: best time + time bonus */}
      <div className="flex items-center justify-between">
        {bestTime ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Trophy size={12} className="text-amber-400" />
            <span>Best: {formatDuration(bestTime)}</span>
          </div>
        ) : (
          <div />
        )}

        <AnimatePresence>
          {timeBonusActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 text-xs text-emerald-400 font-medium"
            >
              <Zap size={12} />
              <span>Time Bonus Active</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default QuestTimer;
