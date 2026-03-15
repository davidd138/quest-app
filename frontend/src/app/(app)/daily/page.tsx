'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Timer,
  Star,
  Flame,
  Calendar,
  Trophy,
  ChevronRight,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import DailyChallenge from '@/components/quest/DailyChallenge';

// ---------- Types ----------

export type ChallengeStatus = 'available' | 'in_progress' | 'completed';

export interface DailyChallengeData {
  id: string;
  type: 'voice_sprint' | 'perfect_score' | 'creative_answer';
  title: string;
  description: string;
  timeLimit: number; // minutes
  rewardXP: number;
  status: ChallengeStatus;
  completedAt?: string;
}

interface DailyStreak {
  current: number;
  best: number;
  lastCompletedDate: string | null;
}

interface DayPerformance {
  date: string;
  completed: number;
  total: number;
}

// ---------- Helpers ----------

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function generateDailyChallenges(dateKey: string): DailyChallengeData[] {
  // Seed-based pseudo-random to ensure same challenges for everyone on the same day
  const seed = dateKey.split('-').reduce((acc, n) => acc + parseInt(n, 10), 0);

  const voiceSprintVariants = [
    { title: 'Voice Sprint', description: 'Complete a quest stage conversation in under 3 minutes' },
    { title: 'Speed Talker', description: 'Finish a character conversation in record time' },
    { title: 'Quick Dialogue', description: 'Solve a conversation challenge as fast as possible' },
  ];

  const perfectScoreVariants = [
    { title: 'Perfect Score', description: 'Achieve a 90%+ score on any challenge analysis' },
    { title: 'Flawless Run', description: 'Complete a stage challenge with a perfect rating' },
    { title: 'Master Performance', description: 'Earn top marks on a character conversation' },
  ];

  const creativeVariants = [
    { title: 'Creative Answer', description: 'Get all "strengths" marked in a conversation analysis' },
    { title: 'Storyteller', description: 'Impress a character with a creative response' },
    { title: 'Improviser', description: 'Complete a challenge using an unconventional approach' },
  ];

  const vs = voiceSprintVariants[seed % voiceSprintVariants.length];
  const ps = perfectScoreVariants[(seed + 1) % perfectScoreVariants.length];
  const cv = creativeVariants[(seed + 2) % creativeVariants.length];

  return [
    {
      id: `daily-vs-${dateKey}`,
      type: 'voice_sprint',
      title: vs.title,
      description: vs.description,
      timeLimit: 3,
      rewardXP: 150,
      status: 'available',
    },
    {
      id: `daily-ps-${dateKey}`,
      type: 'perfect_score',
      title: ps.title,
      description: ps.description,
      timeLimit: 15,
      rewardXP: 200,
      status: 'available',
    },
    {
      id: `daily-ca-${dateKey}`,
      type: 'creative_answer',
      title: cv.title,
      description: cv.description,
      timeLimit: 10,
      rewardXP: 175,
      status: 'available',
    },
  ];
}

// ---------- Animation variants ----------

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ---------- Sub-components ----------

function CountdownTimer() {
  const [time, setTime] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <Timer className="w-5 h-5 text-violet-400" />
      <div className="flex items-center gap-1 font-mono text-lg text-white">
        <span className="bg-navy-800 rounded-lg px-2 py-1 min-w-[2.5rem] text-center">
          {String(time.hours).padStart(2, '0')}
        </span>
        <span className="text-slate-500">:</span>
        <span className="bg-navy-800 rounded-lg px-2 py-1 min-w-[2.5rem] text-center">
          {String(time.minutes).padStart(2, '0')}
        </span>
        <span className="text-slate-500">:</span>
        <span className="bg-navy-800 rounded-lg px-2 py-1 min-w-[2.5rem] text-center">
          {String(time.seconds).padStart(2, '0')}
        </span>
      </div>
      <span className="text-sm text-slate-400">until reset</span>
    </div>
  );
}

function StreakDisplay({ streak }: { streak: DailyStreak }) {
  const flameSize = Math.min(streak.current * 4 + 24, 56);

  return (
    <motion.div
      variants={itemVariants}
      className="glass rounded-2xl p-6 border border-orange-500/20 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
      <div className="relative flex items-center gap-5">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [-3, 3, -3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Flame
            style={{ width: flameSize, height: flameSize }}
            className="text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.5)]"
          />
        </motion.div>
        <div>
          <p className="text-4xl font-heading font-bold text-white">
            {streak.current}
            <span className="text-lg text-slate-400 ml-2">day streak</span>
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Best: {streak.best} days
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function WeekCalendar({ history }: { history: DayPerformance[] }) {
  const days = useMemo(() => {
    const result: DayPerformance[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const existing = history.find((h) => h.date === dateStr);
      result.push(existing || { date: dateStr, completed: 0, total: 3 });
    }
    return result;
  }, [history]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10">
      <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-violet-400" />
        Last 7 Days
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayOfWeek = new Date(day.date + 'T12:00:00').getDay();
          const allDone = day.completed >= day.total;
          const partial = day.completed > 0 && !allDone;

          return (
            <div key={day.date} className="flex flex-col items-center gap-2">
              <span className="text-xs text-slate-500">{dayLabels[dayOfWeek]}</span>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                  allDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : partial
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-navy-800 text-slate-500 border border-white/5'
                }`}
              >
                {day.completed}/{day.total}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function TodayLeaderboard() {
  // Mock leaderboard data for today's challenges
  const entries = [
    { rank: 1, name: 'Alex M.', points: 525, avatar: null },
    { rank: 2, name: 'Sara K.', points: 500, avatar: null },
    { rank: 3, name: 'Carlos R.', points: 475, avatar: null },
    { rank: 4, name: 'Luna P.', points: 350, avatar: null },
    { rank: 5, name: 'You', points: 0, avatar: null, isYou: true },
  ];

  return (
    <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-white flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          Today&apos;s Leaders
        </h3>
        <Link
          href="/leaderboard"
          className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
        >
          Full board <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              (entry as { isYou?: boolean }).isYou
                ? 'bg-violet-600/10 border border-violet-500/20'
                : 'bg-white/[0.02]'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                entry.rank === 1
                  ? 'bg-amber-500/20 text-amber-400'
                  : entry.rank === 2
                    ? 'bg-slate-400/20 text-slate-300'
                    : entry.rank === 3
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-navy-800 text-slate-500'
              }`}
            >
              {entry.rank}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-emerald-500/30 flex items-center justify-center text-xs text-white font-semibold">
              {entry.name.charAt(0)}
            </div>
            <span className="flex-1 text-sm text-white font-medium">{entry.name}</span>
            <span className="text-sm text-emerald-400 font-mono">{entry.points} XP</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ---------- Main Page ----------

export default function DailyPage() {
  const { user } = useAuth();
  const todayKey = getTodayKey();

  const [challengeStates, setChallengeStates] = useLocalStorage<Record<string, ChallengeStatus>>(
    `daily-states-${todayKey}`,
    {}
  );

  const [streak, setStreak] = useLocalStorage<DailyStreak>('daily-streak', {
    current: 0,
    best: 0,
    lastCompletedDate: null,
  });

  const [weekHistory, setWeekHistory] = useLocalStorage<DayPerformance[]>('daily-history', []);

  const challenges = useMemo(() => {
    const base = generateDailyChallenges(todayKey);
    return base.map((c) => ({
      ...c,
      status: challengeStates[c.id] || c.status,
    }));
  }, [todayKey, challengeStates]);

  const completedCount = challenges.filter((c) => c.status === 'completed').length;
  const allCompleted = completedCount === 3;
  const bonusXP = allCompleted ? 250 : 0;
  const totalXP = challenges.reduce(
    (sum, c) => sum + (c.status === 'completed' ? c.rewardXP : 0),
    0
  ) + bonusXP;

  const handleStatusChange = useCallback(
    (challengeId: string, newStatus: ChallengeStatus) => {
      setChallengeStates((prev: Record<string, ChallengeStatus>) => ({
        ...prev,
        [challengeId]: newStatus,
      }));

      // Update streak if all 3 completed
      if (newStatus === 'completed') {
        const updatedStates = { ...challengeStates, [challengeId]: newStatus };
        const nowCompleted = Object.values(updatedStates).filter((s) => s === 'completed').length;

        if (nowCompleted >= 3) {
          setStreak((prev: DailyStreak) => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayKey = yesterday.toISOString().split('T')[0];
            const isConsecutive = prev.lastCompletedDate === yesterdayKey;
            const newCurrent = isConsecutive ? prev.current + 1 : 1;
            return {
              current: newCurrent,
              best: Math.max(prev.best, newCurrent),
              lastCompletedDate: todayKey,
            };
          });

          // Update week history
          setWeekHistory((prev: DayPerformance[]) => {
            const filtered = prev.filter((d) => d.date !== todayKey);
            return [...filtered, { date: todayKey, completed: 3, total: 3 }];
          });
        } else {
          setWeekHistory((prev: DayPerformance[]) => {
            const filtered = prev.filter((d) => d.date !== todayKey);
            return [...filtered, { date: todayKey, completed: nowCompleted, total: 3 }];
          });
        }
      }
    },
    [challengeStates, setChallengeStates, setStreak, setWeekHistory, todayKey]
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
            Daily Challenges
          </h1>
          <p className="text-slate-400 mt-1">Complete all 3 for a bonus reward</p>
        </div>
        <CountdownTimer />
      </motion.div>

      {/* Progress bar */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">
            {completedCount}/3 challenges completed
          </span>
          <span className="text-sm font-semibold text-emerald-400">{totalXP} XP earned</span>
        </div>
        <div className="w-full h-3 rounded-full bg-navy-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / 3) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              allCompleted
                ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                : 'bg-gradient-to-r from-violet-500 to-emerald-500'
            }`}
          />
        </div>
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-3 text-amber-400"
          >
            <Star className="w-5 h-5" />
            <span className="text-sm font-semibold">
              All challenges complete! +{bonusXP} bonus XP
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Challenges */}
      <div className="grid md:grid-cols-3 gap-5">
        {challenges.map((challenge) => (
          <DailyChallenge
            key={challenge.id}
            challenge={challenge}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <StreakDisplay streak={streak} />
        <WeekCalendar history={weekHistory} />
      </div>

      {/* Today's Leaderboard */}
      <TodayLeaderboard />
    </motion.div>
  );
}
