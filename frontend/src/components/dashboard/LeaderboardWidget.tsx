'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight, Crown, Medal } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_LEADERBOARD } from '@/lib/graphql/queries';
import type { LeaderboardEntry } from '@/types';
import DashboardWidget from './DashboardWidget';

// ---------- Rank badge colors ----------

const rankStyles: Record<number, { bg: string; text: string; icon: React.ElementType }> = {
  1: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Crown },
  2: { bg: 'bg-slate-400/20', text: 'text-slate-300', icon: Medal },
  3: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: Medal },
};

// ---------- Component ----------

export default function LeaderboardWidget() {
  const { user } = useAuth();
  const { data: leaderboard, execute: fetchLeaderboard } = useQuery<LeaderboardEntry[]>(GET_LEADERBOARD);

  const refresh = useCallback(() => {
    fetchLeaderboard({ limit: 5 });
  }, [fetchLeaderboard]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const entries = leaderboard?.slice(0, 5) || [];
  const userRank = entries.findIndex((e) => e.userId === user?.userId);

  return (
    <DashboardWidget
      title="Leaderboard"
      onRefresh={refresh}
      draggable
      actions={
        <Link
          href="/leaderboard"
          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {entries.length === 0 ? (
        <div className="text-center py-6">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No leaderboard data yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const isUser = entry.userId === user?.userId;
            const style = rankStyles[entry.rank] || {
              bg: 'bg-navy-800',
              text: 'text-slate-500',
              icon: null,
            };

            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  isUser
                    ? 'bg-violet-600/10 border border-violet-500/20'
                    : 'bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                {/* Rank */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${style.bg} ${style.text}`}
                >
                  {entry.rank}
                </motion.div>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-emerald-500/30 flex items-center justify-center text-xs text-white font-semibold flex-shrink-0">
                  {entry.avatarUrl ? (
                    <img
                      src={entry.avatarUrl}
                      alt={entry.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    entry.userName?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>

                {/* Name */}
                <span className={`flex-1 text-sm font-medium truncate ${isUser ? 'text-violet-300' : 'text-white'}`}>
                  {isUser ? 'You' : entry.userName}
                </span>

                {/* Points */}
                <span className="text-xs text-emerald-400 font-mono">
                  {entry.totalPoints.toLocaleString()}
                </span>
              </motion.div>
            );
          })}

          {/* User not in top 5 */}
          {userRank === -1 && user && (
            <div className="border-t border-white/5 pt-2 mt-2">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-navy-800 text-slate-500">
                  --
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-emerald-500/30 flex items-center justify-center text-xs text-white font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className="flex-1 text-sm font-medium text-violet-300">You</span>
                <span className="text-xs text-emerald-400 font-mono">
                  {(user.totalPoints || 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <Link
            href="/leaderboard"
            className="block text-center text-xs text-violet-400 hover:text-violet-300 pt-2 transition-colors"
          >
            View full leaderboard
          </Link>
        </div>
      )}
    </DashboardWidget>
  );
}
