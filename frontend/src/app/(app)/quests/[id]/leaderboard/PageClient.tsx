'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Crown,
  Medal,
  Clock,
  Zap,
  Star,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/ui/Avatar';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

interface QuestRanking {
  userId: string;
  name: string;
  avatarUrl?: string;
  score: number;
  completionTime: number; // seconds
  completedAt: string;
  stagesCompleted: number;
  perfectStages: number;
}

type SortField = 'score' | 'completionTime';

const mockRankings: QuestRanking[] = [
  { userId: 'u1', name: 'Elena Vasquez', score: 2850, completionTime: 1245, completedAt: '2026-03-14T10:30:00Z', stagesCompleted: 8, perfectStages: 6 },
  { userId: 'u2', name: 'Marcus Chen', avatarUrl: '/avatars/marcus.jpg', score: 2720, completionTime: 1380, completedAt: '2026-03-13T14:22:00Z', stagesCompleted: 8, perfectStages: 5 },
  { userId: 'u3', name: 'Sofia Rivera', score: 2680, completionTime: 1190, completedAt: '2026-03-12T09:15:00Z', stagesCompleted: 8, perfectStages: 5 },
  { userId: 'u4', name: 'Liam O\'Brien', score: 2540, completionTime: 1520, completedAt: '2026-03-11T16:45:00Z', stagesCompleted: 8, perfectStages: 4 },
  { userId: 'u5', name: 'Aisha Patel', score: 2490, completionTime: 1610, completedAt: '2026-03-10T11:00:00Z', stagesCompleted: 8, perfectStages: 4 },
  { userId: 'u6', name: 'Kai Nakamura', score: 2350, completionTime: 1780, completedAt: '2026-03-09T08:30:00Z', stagesCompleted: 7, perfectStages: 3 },
  { userId: 'u7', name: 'Isabella Torres', score: 2200, completionTime: 1890, completedAt: '2026-03-08T20:10:00Z', stagesCompleted: 7, perfectStages: 3 },
  { userId: 'u8', name: 'Noah Kim', score: 2100, completionTime: 2040, completedAt: '2026-03-07T13:55:00Z', stagesCompleted: 7, perfectStages: 2 },
  { userId: 'u9', name: 'Zara Ahmed', score: 1980, completionTime: 2210, completedAt: '2026-03-06T17:20:00Z', stagesCompleted: 6, perfectStages: 2 },
  { userId: 'u10', name: 'Ethan Brooks', score: 1850, completionTime: 2400, completedAt: '2026-03-05T12:40:00Z', stagesCompleted: 6, perfectStages: 1 },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function PodiumCard({
  ranking,
  rank,
  isCurrentUser,
}: {
  ranking: QuestRanking;
  rank: 1 | 2 | 3;
  isCurrentUser: boolean;
}) {
  const config = {
    1: { icon: Crown, color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/30', height: 'h-32' },
    2: { icon: Medal, color: 'text-slate-300', bg: 'from-slate-400/15 to-slate-500/5', border: 'border-slate-400/30', height: 'h-24' },
    3: { icon: Medal, color: 'text-amber-600', bg: 'from-amber-700/15 to-amber-800/5', border: 'border-amber-700/30', height: 'h-20' },
  }[rank];
  const Icon = config.icon;

  return (
    <motion.div
      variants={itemVariants}
      className={`glass rounded-2xl p-5 border ${config.border} relative overflow-hidden ${
        isCurrentUser ? 'ring-2 ring-violet-500/40' : ''
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${config.bg}`} />
      <div className="relative flex flex-col items-center text-center">
        <Icon className={`w-6 h-6 ${config.color} mb-2`} />
        <Avatar name={ranking.name} src={ranking.avatarUrl} size="lg" />
        <p className="font-heading font-semibold text-white mt-2 text-sm truncate max-w-full">
          {ranking.name}
        </p>
        <p className="text-2xl font-heading font-bold text-white mt-1">
          {ranking.score.toLocaleString()}
        </p>
        <p className="text-xs text-slate-400">pts</p>
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          {formatTime(ranking.completionTime)}
        </div>
        {isCurrentUser && (
          <span className="mt-2 text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-medium">
            You
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function QuestLeaderboardPage() {
  const params = useParams();
  const questId = params.id as string;
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortField>('score');
  const [sortAsc, setSortAsc] = useState(false);

  const sortedRankings = [...mockRankings].sort((a, b) => {
    const mult = sortAsc ? 1 : -1;
    if (sortBy === 'score') return (b.score - a.score) * mult;
    return (a.completionTime - b.completionTime) * mult;
  });

  const top3 = sortedRankings.slice(0, 3);
  const rest = sortedRankings.slice(3);

  const currentUserId = user?.userId || '';
  const userRank = sortedRankings.findIndex((r) => r.userId === currentUserId) + 1;

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  const SortIcon = sortAsc ? ChevronUp : ChevronDown;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Back link */}
      <motion.div variants={itemVariants}>
        <Link
          href={`/quests/${questId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quest
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="inline-flex items-center gap-3 mb-3">
          <Trophy className="w-8 h-8 text-amber-400" />
          <h1 className="font-heading text-3xl font-bold text-white">Quest Leaderboard</h1>
        </div>
        <p className="text-slate-400 max-w-lg mx-auto">
          Top adventurers ranked by score and completion time
        </p>
      </motion.div>

      {/* Your rank banner */}
      {userRank > 0 && (
        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-5 border border-violet-500/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Star className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Your Rank</p>
              <p className="text-2xl font-heading font-bold text-white">#{userRank}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Score</p>
            <p className="text-xl font-heading font-bold text-violet-400">
              {sortedRankings[userRank - 1]?.score.toLocaleString()}
            </p>
          </div>
        </motion.div>
      )}

      {/* Podium - top 3 */}
      {top3.length >= 3 && (
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 items-end">
          {/* 2nd place */}
          <PodiumCard ranking={top3[1]} rank={2} isCurrentUser={top3[1].userId === currentUserId} />
          {/* 1st place */}
          <PodiumCard ranking={top3[0]} rank={1} isCurrentUser={top3[0].userId === currentUserId} />
          {/* 3rd place */}
          <PodiumCard ranking={top3[2]} rank={3} isCurrentUser={top3[2].userId === currentUserId} />
        </motion.div>
      )}

      {/* Sort controls */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <span className="text-sm text-slate-500">Sort by:</span>
        <button
          onClick={() => handleSort('score')}
          className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-colors ${
            sortBy === 'score' ? 'bg-violet-500/15 text-violet-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Score
          {sortBy === 'score' && <SortIcon className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => handleSort('completionTime')}
          className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-colors ${
            sortBy === 'completionTime' ? 'bg-violet-500/15 text-violet-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Time
          {sortBy === 'completionTime' && <SortIcon className="w-3.5 h-3.5" />}
        </button>
      </motion.div>

      {/* Ranking table */}
      <motion.div variants={itemVariants} className="space-y-2">
        {rest.map((ranking, i) => {
          const rank = i + 4;
          const isUser = ranking.userId === currentUserId;
          return (
            <motion.div
              key={ranking.userId}
              variants={itemVariants}
              className={`glass rounded-xl p-4 flex items-center gap-4 border transition-colors ${
                isUser ? 'border-violet-500/30 bg-violet-500/5' : 'border-transparent hover:border-slate-700/50'
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center">
                <span className="text-sm font-heading font-bold text-slate-400">
                  {rank}
                </span>
              </div>

              {/* Avatar & name */}
              <Avatar name={ranking.name} src={ranking.avatarUrl} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">
                  {ranking.name}
                  {isUser && (
                    <span className="ml-2 text-xs text-violet-400 font-medium">(You)</span>
                  )}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>{ranking.stagesCompleted} stages</span>
                  <span>{ranking.perfectStages} perfect</span>
                </div>
              </div>

              {/* Time */}
              <div className="text-right mr-4">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {formatTime(ranking.completionTime)}
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="font-heading font-bold text-white">
                  {ranking.score.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">pts</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty state */}
      {sortedRankings.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-12 text-center border border-slate-700/30"
        >
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-semibold text-white mb-2">
            No completions yet
          </h3>
          <p className="text-slate-400 text-sm">
            Be the first to complete this quest and claim the top spot!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
