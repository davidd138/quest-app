'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Zap,
  Star,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_ANALYTICS } from '@/lib/graphql/queries';
import type { Analytics } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CHART_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#a78bfa', '#34d399'];

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    violet: { bg: 'bg-violet-600/10', text: 'text-violet-400', border: 'border-violet-500/20' },
    emerald: { bg: 'bg-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-600/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    rose: { bg: 'bg-rose-600/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  };
  const c = colorMap[color] || colorMap.violet;

  return (
    <motion.div variants={itemVariants} className={`glass rounded-2xl p-5 border ${c.border}`}>
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-heading font-bold text-white mt-0.5">{value}</p>
    </motion.div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 shadow-xl border border-slate-700/50">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((item: { name: string; value: number; color: string }, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: analytics, loading, execute } = useQuery<Analytics>(GET_ANALYTICS);

  useEffect(() => {
    execute();
  }, [execute]);

  // Prepare chart data
  const categoryData = analytics?.categoryBreakdown?.map((cat) => ({
    name: cat.category.replace(/_/g, ' '),
    completed: cat.completed,
    total: cat.total,
    score: Math.round(cat.averageScore),
  })) || [];

  const pieData = categoryData.map((cat) => ({
    name: cat.name,
    value: cat.completed,
  }));

  const radarData = categoryData.map((cat) => ({
    subject: cat.name,
    score: cat.score,
  }));

  // Score over time from recent activity
  const activityByDate = analytics?.recentActivity?.reduce((acc, act) => {
    const date = new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = { date, points: 0, count: 0 };
    acc[date].points += act.points;
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, { date: string; points: number; count: number }>) || {};

  const lineData = Object.values(activityByDate).slice(-10);

  const completionRate = analytics?.completionRate ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Track your performance and progress</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-navy-800 mb-3" />
              <div className="h-4 w-20 bg-navy-800 rounded mb-2" />
              <div className="h-7 w-16 bg-navy-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Stats Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Zap}
              label="Total Points"
              value={(analytics?.totalPoints || 0).toLocaleString()}
              color="violet"
            />
            <StatCard
              icon={Target}
              label="Completion Rate"
              value={`${Math.round(completionRate)}%`}
              color="emerald"
            />
            <StatCard
              icon={Clock}
              label="Total Play Time"
              value={`${Math.round((analytics?.totalPlayTime || 0) / 60)}h`}
              color="amber"
            />
            <StatCard
              icon={Star}
              label="Average Score"
              value={`${Math.round(analytics?.averageScore || 0)}%`}
              color="rose"
            />
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Score Over Time */}
            <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-400" />
                Points Over Time
              </h3>
              <div className="h-64">
                {lineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                      />
                      <YAxis
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="points"
                        name="Points"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6', r: 4 }}
                        activeDot={{ r: 6, fill: '#a78bfa' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    No data available yet
                  </div>
                )}
              </div>
            </motion.div>

            {/* Category Radar */}
            <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Category Performance
              </h3>
              <div className="h-64">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(148,163,184,0.1)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    No data available yet
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Completion Donut + Category Breakdown */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Completion Rate Donut */}
            <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-4">
                Completion Rate
              </h3>
              <div className="h-52 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: completionRate },
                        { name: 'Remaining', value: 100 - completionRate },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      <Cell fill="#8b5cf6" />
                      <Cell fill="rgba(148,163,184,0.1)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-heading font-bold text-white">
                    {Math.round(completionRate)}%
                  </span>
                  <span className="text-xs text-slate-500">completed</span>
                </div>
              </div>
            </motion.div>

            {/* Category Pie */}
            <motion.div variants={itemVariants} className="lg:col-span-2 glass rounded-2xl p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-4">
                Category Breakdown
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="h-52 w-52 flex-shrink-0">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                      No data
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  {categoryData.map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="text-sm text-slate-300 capitalize flex-1">{cat.name}</span>
                      <span className="text-sm text-slate-400">{cat.completed}/{cat.total}</span>
                      <span className="text-xs text-slate-500 w-12 text-right">{cat.score}%</span>
                    </div>
                  ))}
                  {categoryData.length === 0 && (
                    <p className="text-sm text-slate-500">No categories explored yet</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
