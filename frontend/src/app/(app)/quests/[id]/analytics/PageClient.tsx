'use client';

import React, { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  Clock,
  MessageSquare,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_QUEST } from '@/lib/graphql/queries';
import type { Quest } from '@/types';
import QuestFunnel from '@/components/analytics/QuestFunnel';
import RatingDistribution from '@/components/analytics/RatingDistribution';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ---------------------------------------------------------------------------
// Mock analytics data (replace with real API call)
// ---------------------------------------------------------------------------

function useMockAnalytics(quest: Quest | null) {
  return useMemo(() => {
    if (!quest) return null;

    const totalPlays = 1_247;
    const completions = 834;

    // Stage funnel
    const funnelStages = quest.stages.map((stage, i) => {
      const playersAtStage = Math.round(totalPlays * Math.pow(0.82, i));
      return {
        name: stage.title,
        players: playersAtStage,
        dropOff:
          i === 0
            ? 0
            : Math.round(
                ((Math.round(totalPlays * Math.pow(0.82, i - 1)) - playersAtStage) /
                  Math.round(totalPlays * Math.pow(0.82, i - 1))) *
                  100,
              ),
      };
    });

    // Rating distribution
    const ratings = [
      { stars: 5, count: 412 },
      { stars: 4, count: 289 },
      { stars: 3, count: 98 },
      { stars: 2, count: 24 },
      { stars: 1, count: 11 },
    ];
    const totalRatings = ratings.reduce((s, r) => s + r.count, 0);
    const avgRating =
      ratings.reduce((s, r) => s + r.stars * r.count, 0) / totalRatings;

    // Time-of-day distribution
    const hourlyPlays = Array.from({ length: 24 }, (_, h) => ({
      hour: `${String(h).padStart(2, '0')}:00`,
      plays: Math.round(
        30 + 70 * Math.exp(-0.5 * Math.pow((h - 15) / 4, 2)),
      ),
    }));

    // Character interaction stats
    const characterStats = quest.stages.map((stage) => ({
      name: stage.character.name,
      avgDuration: Math.round(60 + Math.random() * 180),
      interactions: Math.round(200 + Math.random() * 800),
    }));

    // Top scores
    const topScores = [
      { rank: 1, name: 'Elena Martinez', score: quest.totalPoints, time: '12:34' },
      { rank: 2, name: 'Carlos Ruiz', score: Math.round(quest.totalPoints * 0.95), time: '14:22' },
      { rank: 3, name: 'Maria Lopez', score: Math.round(quest.totalPoints * 0.92), time: '15:01' },
      { rank: 4, name: 'Javier Torres', score: Math.round(quest.totalPoints * 0.88), time: '16:45' },
      { rank: 5, name: 'Ana Garcia', score: Math.round(quest.totalPoints * 0.85), time: '18:12' },
    ];

    // Recent feedback
    const recentFeedback = [
      { user: 'Elena M.', rating: 5, text: 'Absolutely amazing quest! The characters felt so real.', date: '2 hours ago' },
      { user: 'Carlos R.', rating: 4, text: 'Great storyline but stage 3 felt a bit long.', date: '5 hours ago' },
      { user: 'Lucia P.', rating: 5, text: 'Best quest I have played so far. The location was perfect.', date: '1 day ago' },
      { user: 'Pablo V.', rating: 3, text: 'Good concept but some hints were confusing.', date: '2 days ago' },
    ];

    return {
      totalPlays,
      completions,
      completionRate: Math.round((completions / totalPlays) * 100),
      avgScore: Math.round(quest.totalPoints * 0.78),
      avgTime: '23:45',
      funnelStages,
      ratings,
      totalRatings,
      avgRating: Math.round(avgRating * 10) / 10,
      hourlyPlays,
      characterStats,
      topScores,
      recentFeedback,
    };
  }, [quest]);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <motion.div variants={itemVariants} className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <p className="text-3xl font-heading font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

const HOUR_CHART_COLORS = '#8b5cf6';

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function QuestAnalyticsPage() {
  const params = useParams();
  const questId = params.id as string;

  const {
    data: quest,
    loading,
    execute: fetchQuest,
  } = useQuery<Quest>(GET_QUEST);

  useEffect(() => {
    if (questId) fetchQuest({ id: questId });
  }, [questId, fetchQuest]);

  const analytics = useMockAnalytics(quest);

  // Loading state
  if (loading || !quest || !analytics) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-48 rounded-lg animate-shimmer bg-navy-800" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-shimmer bg-navy-800" />
          ))}
        </div>
        <div className="h-64 rounded-2xl animate-shimmer bg-navy-800" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <Link
            href={`/quests/${questId}`}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quest
          </Link>
          <h1 className="font-heading text-3xl font-bold text-white">
            Quest Analytics
          </h1>
          <p className="text-slate-400 mt-1">{quest.title}</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Link
            href={`/quests/${questId}/reviews`}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 transition-all"
          >
            View All Reviews
          </Link>
        </div>
      </motion.div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Plays"
          value={analytics.totalPlays.toLocaleString()}
          sub="All time"
          color="bg-violet-500/15 text-violet-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${analytics.completionRate}%`}
          sub={`${analytics.completions} completions`}
          color="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          icon={Zap}
          label="Avg Score"
          value={analytics.avgScore}
          sub={`of ${quest.totalPoints} possible`}
          color="bg-amber-500/15 text-amber-400"
        />
        <StatCard
          icon={Clock}
          label="Avg Time"
          value={analytics.avgTime}
          sub="minutes"
          color="bg-sky-500/15 text-sky-400"
        />
      </div>

      {/* Two-column: Funnel + Ratings */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Stage funnel */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <h2 className="font-heading text-lg font-semibold text-white">
              Stage-by-Stage Funnel
            </h2>
          </div>
          <QuestFunnel stages={analytics.funnelStages} />
        </motion.div>

        {/* Rating distribution */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Star className="w-5 h-5 text-amber-400" />
            <h2 className="font-heading text-lg font-semibold text-white">
              Rating Distribution
            </h2>
          </div>
          <RatingDistribution
            ratings={analytics.ratings}
            averageRating={analytics.avgRating}
            totalReviews={analytics.totalRatings}
          />
        </motion.div>
      </div>

      {/* Time of day distribution */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-sky-400" />
          <h2 className="font-heading text-lg font-semibold text-white">
            When Do People Play?
          </h2>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.hourlyPlays}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="hour"
                tick={{ fill: '#64748b', fontSize: 11 }}
                interval={2}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,15,20,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="plays" fill={HOUR_CHART_COLORS} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Two-column: Character stats + Top scores */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Character interaction stats */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h2 className="font-heading text-lg font-semibold text-white">
              Character Interactions
            </h2>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.characterStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  type="number"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  width={90}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,15,20,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'avgDuration' ? `${value}s avg` : value,
                    name === 'avgDuration' ? 'Duration' : 'Interactions',
                  ]}
                />
                <Bar dataKey="interactions" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {analytics.characterStats.map((char) => (
              <div key={char.name} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{char.name}</span>
                <span className="text-slate-500">
                  avg {Math.floor(char.avgDuration / 60)}:{String(char.avgDuration % 60).padStart(2, '0')} conversation
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top scores */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-heading text-lg font-semibold text-white">
              Top Scores
            </h2>
          </div>
          <div className="space-y-3">
            {analytics.topScores.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                  entry.rank <= 3
                    ? 'bg-white/[0.03] border border-white/5'
                    : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
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
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {entry.name}
                  </p>
                  <p className="text-xs text-slate-500">{entry.time} min</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-violet-400">
                    {entry.score}
                  </p>
                  <p className="text-xs text-slate-500">pts</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent feedback */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            <h2 className="font-heading text-lg font-semibold text-white">
              Recent Feedback
            </h2>
          </div>
          <Link
            href={`/quests/${questId}/reviews`}
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="space-y-4">
          {analytics.recentFeedback.map((fb, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/30 to-emerald-500/30 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">
                  {fb.user.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{fb.user}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s < fb.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">{fb.date}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{fb.text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI Suggestions placeholder */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-violet-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-white">
              Improve Your Quest
            </h2>
            <p className="text-xs text-slate-400">
              AI-powered suggestions based on player data
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-slate-300">
              <span className="text-violet-400 font-medium">Stage difficulty curve:</span>{' '}
              Players are dropping off significantly at stage{' '}
              {quest.stages.length > 2 ? 3 : 2}. Consider adding an extra hint
              or reducing the challenge difficulty to smooth the progression.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-slate-300">
              <span className="text-emerald-400 font-medium">Peak hours:</span>{' '}
              Most players engage between 2-6 PM. Consider scheduling related
              events or announcements during these hours for maximum visibility.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-slate-300">
              <span className="text-amber-400 font-medium">Character engagement:</span>{' '}
              The character with the longest conversations could benefit from
              more branching dialogue options to maintain pacing.
            </p>
          </div>
        </div>
        <button
          disabled
          className="mt-4 w-full py-3 rounded-xl bg-violet-600/30 text-violet-300 text-sm font-medium cursor-not-allowed opacity-60"
        >
          Generate Full Report (Coming Soon)
        </button>
      </motion.div>

      {/* Spacer */}
      <div className="h-8" />
    </motion.div>
  );
}
