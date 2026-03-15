'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Crown, Sparkles } from 'lucide-react';

// ---------- Types ----------

interface XPProgressBarProps {
  currentXP: number;
  xpGained?: number;
  showLevelUp?: boolean;
  className?: string;
}

interface LevelConfig {
  name: string;
  minXP: number;
  maxXP: number;
  icon: React.FC<{ size?: number; className?: string }>;
  gradient: string;
  color: string;
}

// ---------- Level Definitions ----------

const levels: LevelConfig[] = [
  {
    name: 'Novato',
    minXP: 0,
    maxXP: 100,
    icon: Star,
    gradient: 'from-slate-500 to-slate-400',
    color: 'text-slate-400',
  },
  {
    name: 'Explorador',
    minXP: 100,
    maxXP: 500,
    icon: Zap,
    gradient: 'from-emerald-500 to-teal-400',
    color: 'text-emerald-400',
  },
  {
    name: 'Aventurero',
    minXP: 500,
    maxXP: 1500,
    icon: Sparkles,
    gradient: 'from-violet-500 to-purple-400',
    color: 'text-violet-400',
  },
  {
    name: 'Maestro',
    minXP: 1500,
    maxXP: 5000,
    icon: Crown,
    gradient: 'from-amber-500 to-yellow-400',
    color: 'text-amber-400',
  },
  {
    name: 'Leyenda',
    minXP: 5000,
    maxXP: 99999,
    icon: Crown,
    gradient: 'from-rose-500 via-fuchsia-500 to-violet-500',
    color: 'text-rose-400',
  },
];

function getLevel(xp: number): { level: LevelConfig; levelIndex: number } {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].minXP) {
      return { level: levels[i], levelIndex: i };
    }
  }
  return { level: levels[0], levelIndex: 0 };
}

// ---------- Floating XP Text ----------

function FloatingXP({ amount, onComplete }: { amount: number; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -40, scale: 1.2 }}
      transition={{ duration: 1.8, ease: 'easeOut' }}
      className="absolute -top-2 right-0 z-20 pointer-events-none"
    >
      <span className="text-sm font-bold text-amber-400 whitespace-nowrap">
        +{amount} XP
      </span>
    </motion.div>
  );
}

// ---------- Level Up Celebration ----------

function LevelUpCelebration({ level, onDismiss }: { level: LevelConfig; onDismiss: () => void }) {
  const Icon = level.icon;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={onDismiss}
    >
      {/* Particle burst */}
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        const dist = 60 + Math.random() * 120;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 1 + Math.random() * 0.5, delay: Math.random() * 0.2 }}
            className="absolute w-2 h-2 rounded-full bg-amber-400"
          />
        );
      })}

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${level.gradient} flex items-center justify-center mx-auto mb-6 shadow-2xl`}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <Icon size={48} className="text-white" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-2"
        >
          Level Up!
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`font-heading text-4xl font-bold bg-gradient-to-r ${level.gradient} bg-clip-text text-transparent`}
        >
          {level.name}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-slate-500 text-xs mt-4"
        >
          Tap to continue
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// ---------- Main Component ----------

const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP,
  xpGained,
  showLevelUp = false,
  className = '',
}) => {
  const [showFloatingXP, setShowFloatingXP] = useState(!!xpGained);
  const [showCelebration, setShowCelebration] = useState(showLevelUp);

  const { level, levelIndex } = getLevel(currentXP);
  const nextLevel = levelIndex < levels.length - 1 ? levels[levelIndex + 1] : null;
  const Icon = level.icon;

  const xpInLevel = currentXP - level.minXP;
  const xpForLevel = (nextLevel?.minXP ?? level.maxXP) - level.minXP;
  const percentage = Math.min((xpInLevel / xpForLevel) * 100, 100);

  return (
    <div className={`relative ${className}`}>
      {/* Floating XP animation */}
      <AnimatePresence>
        {showFloatingXP && xpGained && (
          <FloatingXP
            amount={xpGained}
            onComplete={() => setShowFloatingXP(false)}
          />
        )}
      </AnimatePresence>

      {/* Level Up Modal */}
      <AnimatePresence>
        {showCelebration && (
          <LevelUpCelebration
            level={level}
            onDismiss={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>

      {/* Main bar */}
      <div className="flex items-center gap-3">
        {/* Level icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${level.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
        >
          <Icon size={18} className="text-white" />
        </motion.div>

        {/* Progress section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${level.color}`}>
                Lv. {levelIndex + 1}
              </span>
              <span className="text-xs font-semibold text-white">
                {level.name}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              {currentXP.toLocaleString()} XP total
            </span>
          </div>

          {/* XP bar */}
          <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${level.gradient} relative`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </motion.div>
          </div>

          {/* XP numbers */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-slate-600">
              {xpInLevel} / {xpForLevel} XP
            </span>
            {nextLevel && (
              <span className="text-[10px] text-slate-600">
                Next: {nextLevel.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default XPProgressBar;
