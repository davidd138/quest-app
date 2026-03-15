'use client';

import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Layers,
  Trophy,
  TrendingUp,
  BarChart3,
  Activity,
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
  Area,
  AreaChart,
} from 'recharts';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_ADMIN_ANALYTICS } from '@/lib/graphql/queries';
import Card from '@/components/ui/Card';
import type { AdminAnalytics } from '@/types';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.08 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: string;
  color: 'violet' | 'emerald' | 'amber' | 'rose';
}

const colorStyles = {
  violet: {
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    trendColor: 'text-violet-400',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    trendColor: 'text-emerald-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    trendColor: 'text-amber-400',
  },
  rose: {
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    trendColor: 'text-rose-400',
  },
};

function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <motion.div variants={itemVariants}>
      <Card variant="elevated" padding="md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="font-heading text-3xl font-bold text-white">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={12} className={styles.trendColor} />
                <span className={`text-xs font-medium ${styles.trendColor}`}>{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${styles.iconBg}`}>
            <Icon size={22} className={styles.iconColor} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 shadow-xl border border-white/10">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

function AdminAnalyticsContent() {
  const { data: analytics, loading, execute: fetchAnalytics } = useQuery<AdminAnalytics>(GET_ADMIN_ANALYTICS);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const popularQuestsData = useMemo(() => {
    if (!analytics?.popularQuests) return [];
    return analytics.popularQuests.slice(0, 8).map((q) => ({
      name: q.questTitle.length > 20 ? q.questTitle.slice(0, 20) + '...' : q.questTitle,
      completions: q.completions,
      avgScore: Math.round(q.averageScore),
    }));
  }, [analytics]);

  const growthData = useMemo(() => {
    if (!analytics?.userGrowth) return [];
    return analytics.userGrowth.map((g) => ({
      date: new Date(g.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      users: g.users,
      completions: g.completions,
    }));
  }, [analytics]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 size={28} className="text-violet-400" />
          Analytics Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Platform performance and user engagement metrics
        </p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Users"
          value={analytics?.totalUsers ?? 0}
          color="violet"
        />
        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={analytics?.activeUsers ?? 0}
          color="emerald"
        />
        <StatCard
          icon={Layers}
          label="Total Quests"
          value={analytics?.totalQuests ?? 0}
          color="amber"
        />
        <StatCard
          icon={Trophy}
          label="Completions"
          value={analytics?.totalCompletions ?? 0}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Popular quests bar chart */}
        <motion.div variants={itemVariants}>
          <Card variant="elevated" padding="lg">
            <h3 className="font-heading font-semibold text-white mb-6 flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              Popular Quests
            </h3>
            {popularQuestsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularQuestsData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="completions"
                    name="Completions"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="avgScore"
                    name="Avg Score"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No data available
              </div>
            )}
          </Card>
        </motion.div>

        {/* User growth line chart */}
        <motion.div variants={itemVariants}>
          <Card variant="elevated" padding="lg">
            <h3 className="font-heading font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              User Growth
            </h3>
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="completionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="Users"
                    stroke="#8b5cf6"
                    fill="url(#usersGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="completions"
                    name="Completions"
                    stroke="#10b981"
                    fill="url(#completionsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No data available
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Recent activity table */}
      <motion.div variants={itemVariants}>
        <Card variant="elevated" padding="none">
          <div className="px-5 py-4 border-b border-white/10">
            <h3 className="font-heading font-semibold text-white flex items-center gap-2">
              <Activity size={16} className="text-violet-400" />
              Popular Quest Details
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Quest
                  </th>
                  <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Completions
                  </th>
                  <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Avg Score
                  </th>
                  <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Avg Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {(analytics?.popularQuests ?? []).map((quest) => (
                  <tr
                    key={quest.questId}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="text-sm text-white font-medium">{quest.questTitle}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-slate-300">{quest.completions}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-emerald-400 font-medium">
                        {Math.round(quest.averageScore)}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-slate-300">
                        {Math.round(quest.averageTime / 60)}m
                      </span>
                    </td>
                  </tr>
                ))}
                {(!analytics?.popularQuests || analytics.popularQuests.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-sm">
                      No quest data available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <AdminGuard>
      <AdminAnalyticsContent />
    </AdminGuard>
  );
}
