'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Calendar,
  Gift,
  Star,
  Zap,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Check,
  Target,
  Clock,
  Crown,
} from 'lucide-react';

// ---------- Types ----------

interface DailyStreakProps {
  currentStreak: number;
  longestStreak: number;
  activeDays: string[]; // ISO date strings
  todayBonusClaimed: boolean;
  dailyBonusPoints: number;
  onClaimBonus?: () => void;
}

// ---------- Mock Weekly Challenge ----------

const weeklyChallenge = {
  title: 'Weekend Warrior',
  description: 'Complete 3 quests this weekend',
  progress: 2,
  target: 3,
  reward: 500,
  endsIn: '1d 14h',
};

// ---------- Streak Milestones ----------

const milestones = [
  { days: 7, label: '1 Week', icon: Flame, reward: 100, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  { days: 14, label: '2 Weeks', icon: Star, reward: 250, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  { days: 30, label: '1 Month', icon: Trophy, reward: 500, color: 'text-violet-400', bg: 'bg-violet-500/15' },
  { days: 60, label: '2 Months', icon: Crown, reward: 1000, color: 'text-rose-400', bg: 'bg-rose-500/15' },
  { days: 100, label: '100 Days', icon: Crown, reward: 2500, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  { days: 365, label: '1 Year', icon: Crown, reward: 10000, color: 'text-amber-400', bg: 'bg-amber-500/15' },
];

// ---------- Calendar ----------

function StreakCalendar({ activeDays, currentMonth }: { activeDays: Set<string>; currentMonth: Date }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const days = [];
  // Empty cells for alignment
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push(dateStr);
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
        <div key={i} className="text-[10px] text-slate-600 text-center font-semibold py-1">
          {d}
        </div>
      ))}
      {days.map((dateStr, i) => {
        if (!dateStr) return <div key={`empty-${i}`} />;
        const isActive = activeDays.has(dateStr);
        const isToday = dateStr === today;
        const isFuture = dateStr > today;

        return (
          <motion.div
            key={dateStr}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.01 }}
            className={`
              w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all
              ${isActive
                ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20'
                : isToday
                ? 'bg-white/10 text-white border border-violet-500/50'
                : isFuture
                ? 'text-slate-700'
                : 'text-slate-500 hover:bg-white/5'
              }
            `}
          >
            {isActive ? (
              <Check size={12} strokeWidth={3} />
            ) : (
              parseInt(dateStr.split('-')[2])
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ---------- Fire Animation ----------

function FlameAnimation({ streak }: { streak: number }) {
  // Intensity scales with streak
  const intensity = Math.min(streak / 30, 1);
  const flameSize = 48 + intensity * 24;

  return (
    <div className="relative" style={{ width: flameSize + 24, height: flameSize + 24 }}>
      {/* Outer glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(251,146,60,${0.2 + intensity * 0.2}) 0%, transparent 70%)`,
        }}
      />

      {/* Inner flame icon */}
      <motion.div
        animate={{
          y: [-2, 2, -2],
          rotate: [-3, 3, -3],
        }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Flame
          size={flameSize}
          className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.5)]"
          fill="url(#fireGrad)"
        />
      </motion.div>

      {/* SVG gradient definition */}
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>

      {/* Spark particles */}
      {streak > 7 && Array.from({ length: Math.min(streak / 5, 8) }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30 - Math.random() * 20],
            x: [-5 + Math.random() * 10, -10 + Math.random() * 20],
            opacity: [1, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 0.8 + Math.random() * 0.5,
            repeat: Infinity,
            delay: Math.random() * 1,
          }}
          className="absolute w-1.5 h-1.5 rounded-full bg-amber-300"
          style={{
            left: '50%',
            top: '30%',
          }}
        />
      ))}
    </div>
  );
}

// ---------- Main Component ----------

export default function DailyStreak({
  currentStreak,
  longestStreak,
  activeDays,
  todayBonusClaimed,
  dailyBonusPoints,
  onClaimBonus,
}: DailyStreakProps) {
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const activeDaysSet = useMemo(() => new Set(activeDays), [activeDays]);

  const nextMilestone = milestones.find(m => m.days > currentStreak);
  const daysToMilestone = nextMilestone ? nextMilestone.days - currentStreak : 0;

  const monthLabel = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const navigateMonth = (delta: number) => {
    setCalendarMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + delta);
      return d;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Main Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-white/10 p-6 md:p-8 relative overflow-hidden"
      >
        {/* Background flame glow */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-orange-600 blur-3xl" />
        </div>

        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* Flame animation */}
          <FlameAnimation streak={currentStreak} />

          {/* Stats */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-1">
              {currentStreak}
              <span className="text-xl text-slate-400 font-normal ml-2">day streak</span>
            </h2>
            <p className="text-slate-500 text-sm mb-4">
              Longest streak: <span className="text-amber-400 font-semibold">{longestStreak} days</span>
            </p>

            {/* Next milestone */}
            {nextMilestone && (
              <div className="inline-flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <div className={`w-8 h-8 rounded-lg ${nextMilestone.bg} flex items-center justify-center`}>
                  <nextMilestone.icon className={`w-4 h-4 ${nextMilestone.color}`} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400">
                    <span className="text-white font-semibold">{daysToMilestone} days</span> to {nextMilestone.label}
                  </p>
                  <p className="text-[10px] text-emerald-400">+{nextMilestone.reward} bonus points</p>
                </div>
                {/* Progress to milestone */}
                <div className="w-16 h-1.5 rounded-full bg-navy-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStreak / nextMilestone.days) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Daily bonus claim */}
          <motion.div
            whileHover={!todayBonusClaimed ? { scale: 1.05 } : undefined}
            whileTap={!todayBonusClaimed ? { scale: 0.95 } : undefined}
            onClick={!todayBonusClaimed ? onClaimBonus : undefined}
            className={`
              flex-shrink-0 w-32 h-32 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all cursor-pointer
              ${todayBonusClaimed
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border-violet-500/30 hover:border-violet-500/50'
              }
            `}
          >
            {todayBonusClaimed ? (
              <>
                <Check className="w-8 h-8 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-semibold">Claimed!</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Gift className="w-10 h-10 text-violet-400" />
                </motion.div>
                <span className="text-xs text-violet-300 font-semibold">+{dailyBonusPoints} pts</span>
                <span className="text-[10px] text-slate-500">Claim Today</span>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-400" />
              Activity Calendar
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 font-medium min-w-[120px] text-center">{monthLabel}</span>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <StreakCalendar activeDays={activeDaysSet} currentMonth={calendarMonth} />
          <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gradient-to-br from-violet-500 to-fuchsia-500" />
              Active
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border border-violet-500/50" />
              Today
            </span>
          </div>
        </motion.div>

        {/* Weekly Challenge + Milestones */}
        <div className="space-y-6">
          {/* Weekly Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl border border-white/10 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500" />
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <Target className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-sm">{weeklyChallenge.title}</h3>
                  <p className="text-[10px] text-slate-500">{weeklyChallenge.description}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock size={10} />
                {weeklyChallenge.endsIn}
              </span>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{weeklyChallenge.progress}/{weeklyChallenge.target}</span>
                <span className="text-emerald-400 font-semibold">+{weeklyChallenge.reward} pts</span>
              </div>
              <div className="w-full h-3 rounded-full bg-navy-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(weeklyChallenge.progress / weeklyChallenge.target) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl border border-white/10 p-6"
          >
            <h3 className="font-heading font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Streak Milestones
            </h3>
            <div className="space-y-3">
              {milestones.slice(0, 5).map((milestone) => {
                const isReached = currentStreak >= milestone.days;
                const Icon = milestone.icon;
                return (
                  <div
                    key={milestone.days}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      isReached ? 'bg-white/5' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isReached ? milestone.bg : 'bg-slate-800'
                    }`}>
                      {isReached ? (
                        <Check className={`w-4 h-4 ${milestone.color}`} />
                      ) : (
                        <Icon className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isReached ? 'text-white' : 'text-slate-500'}`}>
                        {milestone.label}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold ${isReached ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {isReached ? 'Earned' : `+${milestone.reward} pts`}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
