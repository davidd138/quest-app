'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Clock,
  Trophy,
  Share2,
  RotateCcw,
  ChevronRight,
  Zap,
  Target,
  Users,
  TrendingUp,
  Sparkles,
  Award,
} from 'lucide-react';

// ---------- Types ----------

interface Badge {
  id: string;
  title: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface QuestSummaryProps {
  questTitle: string;
  totalScore: number;
  maxScore: number;
  starRating: number; // 1-5
  timeCompleted: number; // seconds
  estimatedTime: number; // seconds
  badges: Badge[];
  avgPlayerScore: number;
  avgPlayerTime: number;
  stagesCompleted: number;
  totalStages: number;
  onPlayAgain?: () => void;
  onNextQuest?: () => void;
  onShare?: () => void;
  onClose?: () => void;
}

// ---------- Helpers ----------

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const rarityColors = {
  common: 'from-slate-400 to-slate-500 border-slate-400/30',
  rare: 'from-cyan-400 to-blue-500 border-cyan-400/30',
  epic: 'from-violet-400 to-purple-500 border-violet-400/30',
  legendary: 'from-amber-400 to-orange-500 border-amber-400/30',
};

const rarityGlow = {
  common: '',
  rare: 'shadow-cyan-500/20',
  epic: 'shadow-violet-500/20',
  legendary: 'shadow-amber-500/30',
};

// ---------- Animated Counter ----------

function AnimatedScore({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{display.toLocaleString()}</span>;
}

// ---------- Star Rating ----------

function AnimatedStars({ rating, maxRating = 5 }: { rating: number; maxRating?: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: maxRating }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.5 + i * 0.15, type: 'spring', stiffness: 300 }}
          className="relative"
        >
          <Star
            size={36}
            className={i < rating ? 'text-amber-400' : 'text-slate-700'}
            fill={i < rating ? 'currentColor' : 'none'}
          />
          {i < rating && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ delay: 1.5 + i * 0.15, duration: 0.6 }}
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)',
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ---------- CSS Confetti ----------

function Confetti() {
  const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f97316'];
  const pieces = Array.from({ length: 60 });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((_, i) => {
        const color = colors[i % colors.length];
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const size = 4 + Math.random() * 8;
        const duration = 2 + Math.random() * 3;

        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${left}vw`, opacity: 1, rotate: 0 }}
            animate={{
              y: '110vh',
              rotate: 360 + Math.random() * 720,
              opacity: [1, 1, 0],
            }}
            transition={{ delay, duration, ease: 'linear' }}
            style={{
              position: 'absolute',
              width: size,
              height: size * (Math.random() > 0.5 ? 1 : 2.5),
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              left: 0,
            }}
          />
        );
      })}
    </div>
  );
}

// ---------- Main Component ----------

export default function QuestSummary({
  questTitle,
  totalScore,
  maxScore,
  starRating,
  timeCompleted,
  estimatedTime,
  badges,
  avgPlayerScore,
  avgPlayerTime,
  stagesCompleted,
  totalStages,
  onPlayAgain,
  onNextQuest,
  onShare,
  onClose,
}: QuestSummaryProps) {
  const isPerfect = totalScore >= maxScore;
  const scorePercentage = Math.round((totalScore / maxScore) * 100);
  const fasterThanAvg = timeCompleted < avgPlayerTime;
  const betterThanAvg = totalScore > avgPlayerScore;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      >
        {/* Confetti for perfect */}
        {isPerfect && <Confetti />}

        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: isPerfect
                ? 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
            }}
          />
        </div>

        <motion.div
          initial={{ scale: 0.85, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative w-full max-w-lg glass rounded-3xl border border-white/15 overflow-hidden shadow-2xl"
        >
          {/* Top gradient accent */}
          <div className={`h-1.5 w-full ${isPerfect ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400' : 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500'}`} />

          <div className="p-8 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                className={`w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-2xl ${
                  isPerfect
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
                    : 'bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-violet-500/30'
                }`}
              >
                {isPerfect ? (
                  <Sparkles className="w-10 h-10 text-white" />
                ) : (
                  <Trophy className="w-10 h-10 text-white" />
                )}
              </motion.div>

              <h2 className="font-heading text-2xl font-bold text-white">
                {isPerfect ? 'Perfect Score!' : 'Quest Complete!'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">{questTitle}</p>
            </motion.div>

            {/* Score reveal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <div className="text-5xl font-heading font-bold text-white mb-2">
                <AnimatedScore value={totalScore} />
                <span className="text-xl text-slate-500 font-normal"> / {maxScore}</span>
              </div>
              <AnimatedStars rating={starRating} />
            </motion.div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5 }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{formatTime(timeCompleted)}</p>
                <p className="text-[10px] text-slate-500">
                  {fasterThanAvg ? (
                    <span className="text-emerald-400">Faster than avg</span>
                  ) : (
                    <span>Est. {formatTime(estimatedTime)}</span>
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <Target className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{scorePercentage}%</p>
                <p className="text-[10px] text-slate-500">Accuracy</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{stagesCompleted}/{totalStages}</p>
                <p className="text-[10px] text-slate-500">Stages</p>
              </div>
            </motion.div>

            {/* Comparison bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8 }}
              className="rounded-xl bg-white/5 p-4"
            >
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">vs. Other Players</p>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Your Score</span>
                    <span className={betterThanAvg ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>{totalScore}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scorePercentage}%` }}
                      transition={{ delay: 3, duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Average</span>
                    <span className="text-slate-500">{avgPlayerScore}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((avgPlayerScore / maxScore) * 100)}%` }}
                      transition={{ delay: 3.2, duration: 1 }}
                      className="h-full rounded-full bg-slate-600"
                    />
                  </div>
                </div>
              </div>
              {betterThanAvg && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.5 }}
                  className="text-xs text-emerald-400 mt-2 flex items-center gap-1"
                >
                  <TrendingUp className="w-3 h-3" />
                  You scored {totalScore - avgPlayerScore} points above average!
                </motion.p>
              )}
            </motion.div>

            {/* Badges earned */}
            {badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.2 }}
              >
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Badges Earned</p>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {badges.map((badge, i) => (
                    <motion.div
                      key={badge.id}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 3.4 + i * 0.15, type: 'spring', stiffness: 250 }}
                      className={`flex-shrink-0 w-20 rounded-xl border bg-gradient-to-br p-3 text-center shadow-lg ${rarityColors[badge.rarity]} ${rarityGlow[badge.rarity]}`}
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <p className="text-[10px] text-white font-semibold leading-tight">{badge.title}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.8 }}
              className="flex gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onShare}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onPlayAgain}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onNextQuest}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25"
              >
                Next Quest
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
