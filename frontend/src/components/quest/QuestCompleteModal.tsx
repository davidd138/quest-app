'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Zap, Share2, ArrowRight, FileText, X } from 'lucide-react';

// ---------- Types ----------

interface AchievementUnlocked {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
}

interface QuestCompleteModalProps {
  isOpen: boolean;
  score: number;
  maxScore: number;
  xpGained: number;
  leveledUp?: boolean;
  newLevel?: number;
  starRating: number;
  achievementsUnlocked: AchievementUnlocked[];
  questTitle: string;
  onViewReport?: () => void;
  onNextQuest?: () => void;
  onShare?: () => void;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

// ---------- Animated Score Counter ----------

function AnimatedScoreCounter({
  target,
  duration = 2000,
}: {
  target: number;
  duration?: number;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target <= 0) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return (
    <span className="text-5xl font-bold text-white tabular-nums">{current}</span>
  );
}

// ---------- Star Rating Reveal ----------

function StarRatingReveal({ rating, maxStars = 5 }: { rating: number; maxStars?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: maxStars }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -90 }}
          animate={
            i < rating
              ? { scale: 1, rotate: 0 }
              : { scale: 1, rotate: 0, opacity: 0.2 }
          }
          transition={{
            delay: 1.5 + i * 0.2,
            type: 'spring',
            stiffness: 260,
            damping: 12,
          }}
        >
          <Star
            size={28}
            className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ---------- Confetti Burst ----------

function ConfettiBurst() {
  const particles = Array.from({ length: 50 }).map((_, i) => {
    const angle = (i / 50) * Math.PI * 2;
    const distance = 80 + Math.random() * 200;
    const colors = [
      'bg-amber-400',
      'bg-violet-400',
      'bg-emerald-400',
      'bg-rose-400',
      'bg-blue-400',
      'bg-pink-400',
    ];
    const color = colors[i % colors.length];
    const size = 4 + Math.random() * 6;

    return (
      <motion.div
        key={i}
        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
        animate={{
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 50,
          scale: 0,
          opacity: 0,
          rotate: Math.random() * 720,
        }}
        transition={{
          duration: 1.5 + Math.random() * 1,
          delay: Math.random() * 0.3,
          ease: 'easeOut',
        }}
        className={`absolute rounded-sm ${color}`}
        style={{ width: size, height: size }}
      />
    );
  });

  return <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{particles}</div>;
}

// ---------- XP Gained Animation ----------

function XPGainedAnimation({ xp }: { xp: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 2.5, duration: 0.5 }}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/20"
    >
      <Zap size={16} className="text-amber-400" />
      <span className="text-sm font-bold text-amber-400">+{xp} XP</span>
    </motion.div>
  );
}

// ---------- Level Up Notification ----------

function LevelUpNotification({ level }: { level: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 3, type: 'spring', stiffness: 200 }}
      className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30"
    >
      <div className="flex items-center gap-2">
        <Trophy size={16} className="text-violet-400" />
        <span className="text-sm font-bold text-violet-300">Level Up! Level {level}</span>
      </div>
    </motion.div>
  );
}

// ---------- Achievement Card ----------

function AchievementCard({ achievement, index }: { achievement: AchievementUnlocked; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 3.5 + index * 0.3 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center flex-shrink-0">
        <Trophy size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-bold text-white">{achievement.title}</p>
        <p className="text-[10px] text-slate-400">{achievement.description}</p>
      </div>
    </motion.div>
  );
}

// ---------- Main Component ----------

const QuestCompleteModal: React.FC<QuestCompleteModalProps> = ({
  isOpen,
  score,
  maxScore,
  xpGained,
  leveledUp = false,
  newLevel,
  starRating,
  achievementsUnlocked,
  questTitle,
  onViewReport,
  onNextQuest,
  onShare,
  onDismiss,
  autoDismissMs = 15000,
}) => {
  useEffect(() => {
    if (!isOpen || !onDismiss || autoDismissMs <= 0) return;
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [isOpen, onDismiss, autoDismissMs]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onDismiss?.();
    },
    [onDismiss],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          {/* Confetti */}
          <ConfettiBurst />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative w-full max-w-md mx-4 p-6 rounded-3xl bg-navy-950/95 backdrop-blur-2xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={16} className="text-slate-500" />
            </button>

            {/* Quest Complete Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-1">
                Quest Complete!
              </p>
              <p className="text-sm text-slate-400">{questTitle}</p>
            </motion.div>

            {/* Score Counter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="text-center mb-4"
            >
              <AnimatedScoreCounter target={score} />
              <span className="text-sm text-slate-500 ml-1">/ {maxScore}</span>
            </motion.div>

            {/* Star Rating */}
            <div className="flex justify-center mb-5">
              <StarRatingReveal rating={starRating} />
            </div>

            {/* XP + Level Up */}
            <div className="flex flex-col items-center gap-2 mb-5">
              <XPGainedAnimation xp={xpGained} />
              {leveledUp && newLevel && <LevelUpNotification level={newLevel} />}
            </div>

            {/* Achievements */}
            {achievementsUnlocked.length > 0 && (
              <div className="space-y-2 mb-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Achievements Unlocked
                </p>
                {achievementsUnlocked.map((ach, i) => (
                  <AchievementCard key={ach.id} achievement={ach} index={i} />
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={onViewReport}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 transition-all"
                >
                  <FileText size={14} />
                  View Report
                </button>
                <button
                  onClick={onNextQuest}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Next Quest
                  <ArrowRight size={14} />
                </button>
              </div>
              <button
                onClick={onShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 text-xs hover:bg-white/5 transition-all"
              >
                <Share2 size={12} />
                Share Completion
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestCompleteModal;
