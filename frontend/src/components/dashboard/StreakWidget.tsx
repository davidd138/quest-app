'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, TrendingUp } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import DashboardWidget from './DashboardWidget';

// ---------- Types ----------

interface StreakData {
  current: number;
  best: number;
  lastCompletedDate: string | null;
}

// ---------- Component ----------

export default function StreakWidget() {
  const [streak] = useLocalStorage<StreakData>('daily-streak', {
    current: 0,
    best: 0,
    lastCompletedDate: null,
  });

  // Generate 14-day calendar
  const calendarDays = useMemo(() => {
    const days: { date: string; dayNum: number; isToday: boolean; completed: boolean }[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const lastDate = streak.lastCompletedDate;

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Simple heuristic: if we have a streak of N days ending at lastCompletedDate,
      // mark those last N days as completed
      let completed = false;
      if (lastDate && streak.current > 0) {
        const lastDt = new Date(lastDate + 'T12:00:00');
        const thisDt = new Date(dateStr + 'T12:00:00');
        const diffDays = Math.floor(
          (lastDt.getTime() - thisDt.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays >= 0 && diffDays < streak.current) {
          completed = true;
        }
      }

      days.push({
        date: dateStr,
        dayNum: d.getDate(),
        isToday: dateStr === todayStr,
        completed,
      });
    }
    return days;
  }, [streak]);

  // Flame size scales with streak
  const flameSize = Math.min(streak.current * 3 + 28, 52);

  // Motivation text
  const motivationText = streak.current === 0
    ? 'Start your streak today!'
    : streak.current >= 7
      ? 'Unstoppable! Keep it up!'
      : "Don't break your streak!";

  return (
    <DashboardWidget title="Daily Streak" draggable>
      {/* Streak counter */}
      <div className="flex items-center gap-4 mb-5">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 1.5 + Math.min(streak.current * 0.1, 1),
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative"
        >
          {/* Glow behind flame */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-orange-500/20 blur-lg"
            style={{ width: flameSize + 16, height: flameSize + 16, top: -8, left: -8 }}
          />
          <Flame
            style={{ width: flameSize, height: flameSize }}
            className="text-orange-400 relative drop-shadow-[0_0_12px_rgba(251,146,60,0.6)]"
          />
        </motion.div>

        <div>
          <p className="text-3xl font-heading font-bold text-white">
            {streak.current}
          </p>
          <p className="text-sm text-slate-400">day streak</p>
        </div>

        <div className="ml-auto text-right">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <TrendingUp className="w-3 h-3" />
            <span>Best: {streak.best}</span>
          </div>
        </div>
      </div>

      {/* 14-day calendar */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">
            Last 14 days
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day) => (
            <div
              key={day.date}
              className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium transition-all ${
                day.completed
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : day.isToday
                    ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                    : 'bg-navy-800/50 text-slate-600 border border-white/5'
              }`}
              title={day.date}
            >
              {day.dayNum}
            </div>
          ))}
        </div>
      </div>

      {/* Motivation */}
      <p className="text-sm text-center text-amber-400/80 font-medium">{motivationText}</p>
    </DashboardWidget>
  );
}
