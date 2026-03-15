'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Target,
  Sparkles,
  Play,
  Check,
  Loader2,
  Clock,
  Zap,
} from 'lucide-react';
import type { DailyChallengeData, ChallengeStatus } from '@/app/(app)/daily/page';

// ---------- Types ----------

interface DailyChallengeProps {
  challenge: DailyChallengeData;
  onStatusChange: (id: string, status: ChallengeStatus) => void;
}

// ---------- Config ----------

const challengeConfig: Record<
  DailyChallengeData['type'],
  {
    icon: React.ElementType;
    gradient: string;
    borderColor: string;
    bgGlow: string;
    accentColor: string;
  }
> = {
  voice_sprint: {
    icon: Mic,
    gradient: 'from-cyan-500/20 to-blue-600/20',
    borderColor: 'border-cyan-500/30',
    bgGlow: 'from-cyan-500/5 to-transparent',
    accentColor: 'text-cyan-400',
  },
  perfect_score: {
    icon: Target,
    gradient: 'from-emerald-500/20 to-teal-600/20',
    borderColor: 'border-emerald-500/30',
    bgGlow: 'from-emerald-500/5 to-transparent',
    accentColor: 'text-emerald-400',
  },
  creative_answer: {
    icon: Sparkles,
    gradient: 'from-violet-500/20 to-fuchsia-600/20',
    borderColor: 'border-violet-500/30',
    bgGlow: 'from-violet-500/5 to-transparent',
    accentColor: 'text-violet-400',
  },
};

// ---------- Confetti particles ----------

function CompletionConfetti() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    y: -(Math.random() * 150 + 50),
    rotate: Math.random() * 720 - 360,
    scale: Math.random() * 0.5 + 0.5,
    color: ['bg-amber-400', 'bg-emerald-400', 'bg-violet-400', 'bg-cyan-400', 'bg-rose-400'][
      i % 5
    ],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: '50%', y: '50%', opacity: 1, scale: 0 }}
          animate={{
            x: `calc(50% + ${p.x}px)`,
            y: `calc(50% + ${p.y}px)`,
            opacity: 0,
            scale: p.scale,
            rotate: p.rotate,
          }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className={`absolute w-2 h-2 rounded-full ${p.color}`}
        />
      ))}
    </div>
  );
}

// ---------- Component ----------

export default function DailyChallenge({ challenge, onStatusChange }: DailyChallengeProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const config = challengeConfig[challenge.type];
  const Icon = config.icon;

  const handleStart = useCallback(() => {
    onStatusChange(challenge.id, 'in_progress');
  }, [challenge.id, onStatusChange]);

  const handleComplete = useCallback(() => {
    setShowConfetti(true);
    onStatusChange(challenge.id, 'completed');
    setTimeout(() => setShowConfetti(false), 1500);
  }, [challenge.id, onStatusChange]);

  const isCompleted = challenge.status === 'completed';
  const isInProgress = challenge.status === 'in_progress';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {/* Animated border glow */}
      <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r ${config.gradient} opacity-60`} />

      <div
        className={`relative glass rounded-2xl p-6 border ${config.borderColor} overflow-hidden`}
      >
        {/* Background glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGlow} pointer-events-none`} />

        {/* Confetti overlay */}
        <AnimatePresence>{showConfetti && <CompletionConfetti />}</AnimatePresence>

        <div className="relative">
          {/* Icon + Status */}
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <Check className="w-6 h-6 text-emerald-400" />
                </motion.div>
              ) : (
                <Icon className={`w-6 h-6 ${config.accentColor}`} />
              )}
            </div>
            {isCompleted && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium"
              >
                Completed
              </motion.span>
            )}
            {isInProgress && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-medium flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                In Progress
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h3 className="font-heading font-bold text-white text-lg mb-1">{challenge.title}</h3>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">{challenge.description}</p>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{challenge.timeLimit} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
              <span>{challenge.rewardXP} XP</span>
            </div>
          </div>

          {/* Action Button */}
          {!isCompleted && !isInProgress && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className={`w-full py-3 rounded-xl bg-gradient-to-r ${config.gradient} border ${config.borderColor} text-white font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all`}
            >
              <Play className="w-4 h-4" />
              Start Challenge
            </motion.button>
          )}

          {isInProgress && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/30 text-emerald-400 font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            >
              <Check className="w-4 h-4" />
              Mark Complete
            </motion.button>
          )}

          {isCompleted && (
            <div className="w-full py-3 rounded-xl bg-emerald-500/10 text-center text-sm text-emerald-400 font-medium">
              +{challenge.rewardXP} XP earned
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
