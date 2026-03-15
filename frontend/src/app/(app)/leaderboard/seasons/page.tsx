'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Crown,
  Medal,
  Calendar,
  Clock,
  Zap,
  Star,
  ChevronRight,
  Flame,
  Gift,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------

interface SeasonWinner {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl?: string;
  seasonPoints: number;
  questsCompleted: number;
}

interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'past' | 'upcoming';
  winners?: SeasonWinner[];
  totalParticipants?: number;
  rewards: { badge: string; title: string }[];
}

type PointsMode = 'season' | 'alltime';

const CURRENT_SEASON: Season = {
  id: 'spring-2026',
  name: 'Spring 2026',
  startDate: '2026-03-01T00:00:00Z',
  endDate: '2026-05-31T23:59:59Z',
  status: 'active',
  totalParticipants: 1247,
  rewards: [
    { badge: 'Spring Champion', title: 'Blossom Crown' },
    { badge: 'Top 10', title: 'Spring Seeker' },
    { badge: 'Top 50', title: 'Petal Collector' },
  ],
};

const PAST_SEASONS: Season[] = [
  {
    id: 'winter-2025',
    name: 'Winter 2025',
    startDate: '2025-12-01T00:00:00Z',
    endDate: '2026-02-28T23:59:59Z',
    status: 'past',
    totalParticipants: 1102,
    winners: [
      { rank: 1, userId: 'u1', userName: 'Sofia Ramirez', seasonPoints: 28400, questsCompleted: 67 },
      { rank: 2, userId: 'u2', userName: 'Aiko Tanaka', seasonPoints: 25100, questsCompleted: 59 },
      { rank: 3, userId: 'u3', userName: 'Marcus Chen', seasonPoints: 22800, questsCompleted: 54 },
    ],
    rewards: [
      { badge: 'Winter Champion', title: 'Frost Crown' },
      { badge: 'Top 10', title: 'Snow Walker' },
      { badge: 'Top 50', title: 'Winter Explorer' },
    ],
  },
  {
    id: 'fall-2025',
    name: 'Fall 2025',
    startDate: '2025-09-01T00:00:00Z',
    endDate: '2025-11-30T23:59:59Z',
    status: 'past',
    totalParticipants: 934,
    winners: [
      { rank: 1, userId: 'u4', userName: 'Elena Voss', seasonPoints: 31200, questsCompleted: 72 },
      { rank: 2, userId: 'u5', userName: 'James Wright', seasonPoints: 27600, questsCompleted: 63 },
      { rank: 3, userId: 'u1', userName: 'Sofia Ramirez', seasonPoints: 24300, questsCompleted: 58 },
    ],
    rewards: [
      { badge: 'Fall Champion', title: 'Harvest Crown' },
      { badge: 'Top 10', title: 'Autumn Blade' },
      { badge: 'Top 50', title: 'Leaf Gatherer' },
    ],
  },
  {
    id: 'summer-2025',
    name: 'Summer 2025',
    startDate: '2025-06-01T00:00:00Z',
    endDate: '2025-08-31T23:59:59Z',
    status: 'past',
    totalParticipants: 812,
    winners: [
      { rank: 1, userId: 'u2', userName: 'Aiko Tanaka', seasonPoints: 29800, questsCompleted: 68 },
      { rank: 2, userId: 'u4', userName: 'Elena Voss', seasonPoints: 26400, questsCompleted: 61 },
      { rank: 3, userId: 'u6', userName: 'Liam OBrien', seasonPoints: 23100, questsCompleted: 55 },
    ],
    rewards: [
      { badge: 'Summer Champion', title: 'Sun Crown' },
      { badge: 'Top 10', title: 'Wave Rider' },
      { badge: 'Top 50', title: 'Summer Scout' },
    ],
  },
];

const SEASON_RANKINGS: SeasonWinner[] = [
  { rank: 1, userId: 'u1', userName: 'Sofia Ramirez', seasonPoints: 14200, questsCompleted: 34 },
  { rank: 2, userId: 'u2', userName: 'Aiko Tanaka', seasonPoints: 12800, questsCompleted: 30 },
  { rank: 3, userId: 'u3', userName: 'Marcus Chen', seasonPoints: 11500, questsCompleted: 27 },
  { rank: 4, userId: 'u4', userName: 'Elena Voss', seasonPoints: 10200, questsCompleted: 24 },
  { rank: 5, userId: 'u5', userName: 'James Wright', seasonPoints: 9800, questsCompleted: 23 },
  { rank: 6, userId: 'u6', userName: 'Liam OBrien', seasonPoints: 8400, questsCompleted: 20 },
  { rank: 7, userId: 'u7', userName: 'Diana Prince', seasonPoints: 7600, questsCompleted: 18 },
  { rank: 8, userId: 'u8', userName: 'Alex Morgan', seasonPoints: 6900, questsCompleted: 16 },
  { rank: 9, userId: 'u9', userName: 'Kai Nakamura', seasonPoints: 6200, questsCompleted: 15 },
  { rank: 10, userId: 'current-user', userName: 'Current User', seasonPoints: 5800, questsCompleted: 14 },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return timeLeft;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <span className="text-2xl font-heading font-bold text-white">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-1.5">{label}</span>
    </div>
  );
}

function SeasonTop3Card({
  winner,
  rank,
  isCurrentUser,
}: {
  winner: SeasonWinner;
  rank: 1 | 2 | 3;
  isCurrentUser: boolean;
}) {
  const config = {
    1: { height: 'h-36', bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/40', icon: Crown, iconColor: 'text-amber-400', order: 'order-2', badgeBg: 'bg-amber-500' },
    2: { height: 'h-28', bg: 'from-slate-400/15 to-slate-500/5', border: 'border-slate-400/30', icon: Medal, iconColor: 'text-slate-300', order: 'order-1', badgeBg: 'bg-slate-400' },
    3: { height: 'h-24', bg: 'from-amber-700/15 to-amber-800/5', border: 'border-amber-700/30', icon: Medal, iconColor: 'text-amber-600', order: 'order-3', badgeBg: 'bg-amber-700' },
  };
  const c = config[rank];
  const Icon = c.icon;

  return (
    <motion.div variants={itemVariants} className={`${c.order} flex flex-col items-center`}>
      <div className="relative mb-2">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/30 to-emerald-500/30 flex items-center justify-center border-2 ${c.border} ${
            isCurrentUser ? 'ring-2 ring-violet-500' : ''
          }`}
        >
          <span className="text-sm font-bold text-white">{getInitials(winner.userName)}</span>
        </div>
        <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center ${c.badgeBg}`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <p className={`font-heading font-semibold text-xs ${isCurrentUser ? 'text-violet-400' : 'text-white'}`}>
        {winner.userName}
      </p>
      <p className="text-[10px] text-slate-500">{winner.questsCompleted} quests</p>
      <div
        className={`w-full ${c.height} mt-2 rounded-t-2xl bg-gradient-to-t ${c.bg} border-t border-x ${c.border} flex flex-col items-center justify-end pb-3`}
      >
        <span className={`text-xl font-heading font-bold ${c.iconColor}`}>
          {winner.seasonPoints.toLocaleString()}
        </span>
        <span className="text-[10px] text-slate-500">pts</span>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SeasonsPage() {
  const { user } = useAuth();
  const [pointsMode, setPointsMode] = useState<PointsMode>('season');
  const countdown = useCountdown(CURRENT_SEASON.endDate);

  const myRank = SEASON_RANKINGS.find((r) => r.userId === user?.userId || r.userId === 'current-user');

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back to leaderboard */}
      <Link href="/leaderboard" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Leaderboard
      </Link>

      {/* Season Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl border border-violet-500/20 p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-emerald-600/10" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-bl-full" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Current Season</p>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">{CURRENT_SEASON.name}</h1>
            </div>
          </div>
          <p className="text-slate-400 text-sm ml-[52px]">
            {CURRENT_SEASON.totalParticipants?.toLocaleString()} participants competing
          </p>

          {/* Countdown */}
          <div className="mt-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Season Ends In
            </p>
            <div className="flex gap-3">
              <CountdownUnit value={countdown.days} label="Days" />
              <CountdownUnit value={countdown.hours} label="Hours" />
              <CountdownUnit value={countdown.minutes} label="Min" />
              <CountdownUnit value={countdown.seconds} label="Sec" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Season Rewards Preview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-400" />
          Season Rewards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CURRENT_SEASON.rewards.map((reward, i) => (
            <motion.div
              key={reward.badge}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className={`glass rounded-2xl border p-5 text-center ${
                i === 0
                  ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent'
                  : i === 1
                  ? 'border-slate-400/20'
                  : 'border-white/10'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
                i === 0 ? 'bg-amber-500/20' : i === 1 ? 'bg-slate-400/15' : 'bg-white/5'
              }`}>
                {i === 0 ? (
                  <Crown className="w-6 h-6 text-amber-400" />
                ) : (
                  <Star className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <p className="font-heading font-semibold text-white text-sm">{reward.badge}</p>
              <p className="text-xs text-slate-400 mt-1">Exclusive title: <span className="text-violet-400">{reward.title}</span></p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Your Season Progress */}
      {myRank && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl border border-violet-500/20 p-6 bg-violet-500/5"
        >
          <h3 className="text-sm font-semibold text-violet-400 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Your Season Progress
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-white">#{myRank.rank}</p>
              <p className="text-xs text-slate-500">Current Rank</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-emerald-400">{myRank.seasonPoints.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Season Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-amber-400">{myRank.questsCompleted}</p>
              <p className="text-xs text-slate-500">Quests Done</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Points toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPointsMode('season')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            pointsMode === 'season'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Season Points
          </span>
        </button>
        <button
          onClick={() => setPointsMode('alltime')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            pointsMode === 'alltime'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            All-time Points
          </span>
        </button>
      </div>

      {/* Top 3 Podium */}
      {SEASON_RANKINGS.length >= 3 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex justify-center items-end gap-4 pt-4 pb-2"
        >
          {[
            { winner: SEASON_RANKINGS[1], rank: 2 as const },
            { winner: SEASON_RANKINGS[0], rank: 1 as const },
            { winner: SEASON_RANKINGS[2], rank: 3 as const },
          ].map(({ winner, rank }) => (
            <SeasonTop3Card
              key={winner.userId}
              winner={winner}
              rank={rank}
              isCurrentUser={winner.userId === user?.userId || winner.userId === 'current-user'}
            />
          ))}
        </motion.div>
      )}

      {/* Season Ranking Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="grid grid-cols-[60px_1fr_100px_80px] gap-4 px-6 py-3 border-b border-slate-700/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Rank</span>
          <span>Player</span>
          <span className="text-right">{pointsMode === 'season' ? 'Season Pts' : 'All-time'}</span>
          <span className="text-right">Quests</span>
        </div>

        {SEASON_RANKINGS.map((entry, i) => {
          const isCurrentUser = entry.userId === user?.userId || entry.userId === 'current-user';
          return (
            <motion.div
              key={entry.userId}
              variants={itemVariants}
              className={`grid grid-cols-[60px_1fr_100px_80px] gap-4 px-6 py-4 border-b border-slate-700/20 transition-colors ${
                isCurrentUser
                  ? 'bg-violet-500/5 border-l-2 border-l-violet-500'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center">
                <span className={`text-lg font-heading font-bold ${entry.rank <= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                  #{entry.rank}
                </span>
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-300">{getInitials(entry.userName)}</span>
                </div>
                <span className={`truncate font-medium text-sm ${isCurrentUser ? 'text-violet-400' : 'text-slate-200'}`}>
                  {entry.userName}
                  {isCurrentUser && <span className="ml-2 text-xs text-violet-500">(you)</span>}
                </span>
              </div>
              <span className="text-right text-sm font-semibold text-white flex items-center justify-end gap-1">
                <Zap className="w-3.5 h-3.5 text-violet-400" />
                {entry.seasonPoints.toLocaleString()}
              </span>
              <span className="text-right text-sm text-slate-400">{entry.questsCompleted}</span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Past Seasons Archive */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          Past Seasons
        </h2>
        <div className="space-y-4">
          {PAST_SEASONS.map((season, i) => (
            <motion.div
              key={season.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              className="glass rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading font-bold text-white flex items-center gap-2">
                    {season.name}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 font-normal">
                      Ended
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {season.totalParticipants?.toLocaleString()} participants
                  </p>
                </div>

                {/* Winners */}
                {season.winners && (
                  <div className="flex items-center gap-4">
                    {season.winners.map((w) => (
                      <div key={w.userId} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                          w.rank === 1 ? 'bg-amber-500' : w.rank === 2 ? 'bg-slate-400' : 'bg-amber-700'
                        }`}>
                          {w.rank}
                        </div>
                        <span className="text-xs text-slate-300">{w.userName}</span>
                        <span className="text-xs text-slate-500">{w.seasonPoints.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
