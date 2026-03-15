'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Medal, Trophy, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_LEADERBOARD } from '@/lib/graphql/queries';
import type { LeaderboardEntry } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

function PodiumCard({
  entry,
  rank,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  isCurrentUser: boolean;
}) {
  const config = {
    1: {
      height: 'h-40',
      bg: 'from-amber-500/20 to-amber-600/5',
      border: 'border-amber-500/40',
      icon: Crown,
      iconColor: 'text-amber-400',
      order: 'order-2',
      label: '1st',
    },
    2: {
      height: 'h-32',
      bg: 'from-slate-400/15 to-slate-500/5',
      border: 'border-slate-400/30',
      icon: Medal,
      iconColor: 'text-slate-300',
      order: 'order-1',
      label: '2nd',
    },
    3: {
      height: 'h-28',
      bg: 'from-amber-700/15 to-amber-800/5',
      border: 'border-amber-700/30',
      icon: Medal,
      iconColor: 'text-amber-600',
      order: 'order-3',
      label: '3rd',
    },
  };

  const c = config[rank];
  const Icon = c.icon;

  const initials = entry.userName
    ? entry.userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <motion.div
      variants={itemVariants}
      className={`${c.order} flex flex-col items-center`}
    >
      <div className="relative mb-3">
        {entry.avatarUrl ? (
          <img
            src={entry.avatarUrl}
            alt={entry.userName}
            className={`w-16 h-16 rounded-2xl object-cover border-2 ${c.border} ${
              isCurrentUser ? 'ring-2 ring-violet-500' : ''
            }`}
          />
        ) : (
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/30 to-emerald-500/30 flex items-center justify-center border-2 ${c.border} ${
              isCurrentUser ? 'ring-2 ring-violet-500' : ''
            }`}
          >
            <span className="text-lg font-bold text-white">{initials}</span>
          </div>
        )}
        <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center ${
          rank === 1 ? 'bg-amber-500' : rank === 2 ? 'bg-slate-400' : 'bg-amber-700'
        }`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>

      <p className={`font-heading font-semibold text-sm ${isCurrentUser ? 'text-violet-400' : 'text-white'}`}>
        {entry.userName}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{entry.questsCompleted} quests</p>

      <div
        className={`w-full ${c.height} mt-3 rounded-t-2xl bg-gradient-to-t ${c.bg} border-t border-x ${c.border} flex flex-col items-center justify-end pb-4`}
      >
        <span className={`text-2xl font-heading font-bold ${c.iconColor}`}>
          {entry.totalPoints.toLocaleString()}
        </span>
        <span className="text-xs text-slate-500">points</span>
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { data: entries, loading, execute } = useQuery<LeaderboardEntry[]>(GET_LEADERBOARD);

  useEffect(() => {
    execute({ limit: 50 });
  }, [execute]);

  const top3 = entries?.slice(0, 3) || [];
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-white">Leaderboard</h1>
        <p className="text-slate-400 mt-1">See how you rank among fellow adventurers</p>
      </motion.div>

      {/* Top 3 Podium */}
      {loading ? (
        <div className="flex justify-center items-end gap-4 pt-8 pb-4">
          {[32, 40, 28].map((h, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-navy-800 animate-pulse mb-3" />
              <div className="h-4 w-20 bg-navy-800 rounded animate-pulse mb-2" />
              <div className={`w-28 bg-navy-800 rounded-t-2xl animate-pulse`} style={{ height: `${h * 4}px` }} />
            </div>
          ))}
        </div>
      ) : top3.length >= 3 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex justify-center items-end gap-4 pt-8 pb-4"
        >
          {[
            { entry: top3[1], rank: 2 as const },
            { entry: top3[0], rank: 1 as const },
            { entry: top3[2], rank: 3 as const },
          ].map(({ entry, rank }) => (
            <PodiumCard
              key={entry.userId}
              entry={entry}
              rank={rank}
              isCurrentUser={entry.userId === user?.userId}
            />
          ))}
        </motion.div>
      ) : null}

      {/* Full Ranking Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="glass rounded-2xl overflow-hidden"
      >
        {/* Table Header */}
        <div className="grid grid-cols-[60px_1fr_100px_100px_80px] gap-4 px-6 py-3 border-b border-slate-700/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Rank</span>
          <span>Player</span>
          <span className="text-right">Points</span>
          <span className="text-right">Quests</span>
          <span className="text-right">Avg</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[60px_1fr_100px_100px_80px] gap-4 px-6 py-4 animate-pulse">
                <div className="h-5 w-8 bg-navy-800 rounded" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-navy-800" />
                  <div className="h-4 w-24 bg-navy-800 rounded" />
                </div>
                <div className="h-4 w-12 bg-navy-800 rounded ml-auto" />
                <div className="h-4 w-8 bg-navy-800 rounded ml-auto" />
                <div className="h-4 w-10 bg-navy-800 rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : (
          entries?.map((entry, i) => {
            const isCurrentUser = entry.userId === user?.userId;
            const initials = entry.userName
              ? entry.userName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : '??';

            return (
              <motion.div
                key={entry.userId}
                variants={itemVariants}
                className={`grid grid-cols-[60px_1fr_100px_100px_80px] gap-4 px-6 py-4 border-b border-slate-700/20 transition-colors ${
                  isCurrentUser
                    ? 'bg-violet-500/5 border-l-2 border-l-violet-500'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.03, type: 'spring' }}
                    className={`text-lg font-heading font-bold ${
                      entry.rank <= 3 ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    #{entry.rank}
                  </motion.span>
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  {entry.avatarUrl ? (
                    <img
                      src={entry.avatarUrl}
                      alt={entry.userName}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-slate-300">{initials}</span>
                    </div>
                  )}
                  <span
                    className={`truncate font-medium text-sm ${
                      isCurrentUser ? 'text-violet-400' : 'text-slate-200'
                    }`}
                  >
                    {entry.userName}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-violet-500">(you)</span>
                    )}
                  </span>
                </div>
                <span className="text-right text-sm font-semibold text-white flex items-center justify-end gap-1">
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                  {entry.totalPoints.toLocaleString()}
                </span>
                <span className="text-right text-sm text-slate-400">
                  {entry.questsCompleted}
                </span>
                <span className="text-right text-sm text-slate-400">
                  {Math.round(entry.averageScore)}%
                </span>
              </motion.div>
            );
          })
        )}

        {!loading && (!entries || entries.length === 0) && (
          <div className="p-12 text-center">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No rankings yet. Be the first!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
