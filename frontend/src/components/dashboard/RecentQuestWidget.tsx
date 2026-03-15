'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Play,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_ANALYTICS } from '@/lib/graphql/queries';
import type { Analytics } from '@/types';
import DashboardWidget from './DashboardWidget';

// ---------- Types ----------

interface RecentQuestEntry {
  questTitle: string;
  action: string;
  points: number;
  date: string;
}

// ---------- Component ----------

export default function RecentQuestWidget() {
  const { data: analytics, execute: fetchAnalytics } = useQuery<Analytics>(GET_ANALYTICS);

  const refresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recentActivity = analytics?.recentActivity?.slice(0, 3) || [];

  function getActionIcon(action: string) {
    if (action.toLowerCase().includes('complet')) {
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    }
    if (action.toLowerCase().includes('start')) {
      return <Play className="w-4 h-4 text-violet-400" />;
    }
    return <Clock className="w-4 h-4 text-slate-400" />;
  }

  function getStatusLabel(action: string) {
    if (action.toLowerCase().includes('complet')) return 'Completed';
    if (action.toLowerCase().includes('start')) return 'In Progress';
    return action;
  }

  return (
    <DashboardWidget title="Recent Quests" onRefresh={refresh} draggable>
      {recentActivity.length === 0 ? (
        <div className="text-center py-6">
          <Compass className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500 mb-3">No recent quests</p>
          <Link
            href="/quests"
            className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Browse quests <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentActivity.map((activity, i) => {
            const isCompleted = activity.action.toLowerCase().includes('complet');
            const isInProgress = activity.action.toLowerCase().includes('start');

            return (
              <motion.div
                key={`${activity.questTitle}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
              >
                {/* Quest avatar / thumbnail */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600/20 to-emerald-600/10 flex items-center justify-center flex-shrink-0">
                  <Compass className="w-5 h-5 text-violet-400/60" />
                </div>

                {/* Quest info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
                    {activity.questTitle}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getActionIcon(activity.action)}
                    <span className="text-xs text-slate-500">{getStatusLabel(activity.action)}</span>
                  </div>
                </div>

                {/* Score / Resume */}
                <div className="flex flex-col items-end gap-1">
                  {activity.points > 0 && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <Star className="w-3 h-3" />
                      {activity.points} pts
                    </span>
                  )}
                  {isInProgress && (
                    <Link
                      href="/quests"
                      className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors"
                    >
                      Resume
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}

          <Link
            href="/history"
            className="block text-center text-xs text-violet-400 hover:text-violet-300 pt-1 transition-colors"
          >
            View all history
          </Link>
        </div>
      )}
    </DashboardWidget>
  );
}
