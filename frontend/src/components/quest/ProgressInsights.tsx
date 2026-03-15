'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Flame,
  Trophy,
  AlertTriangle,
} from 'lucide-react';

// ---------- Types ----------

interface WeeklyComparison {
  thisWeek: number;
  lastWeek: number;
  label: string;
}

interface SkillData {
  skill: string;
  score: number;
  fullMark: number;
}

interface MilestonePreview {
  title: string;
  description: string;
  current: number;
  target: number;
}

interface ProgressInsightsProps {
  totalQuestsCompleted: number;
  totalPoints: number;
  averageScore: number;
  currentStreak: number;
  bestStreak: number;
  strengths: string[];
  weakAreas: string[];
  weeklyComparison: WeeklyComparison[];
  skillRadar: SkillData[];
  nextMilestone: MilestonePreview;
  className?: string;
}

// ---------- Stat Card ----------

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
      <div className={`w-9 h-9 rounded-lg ${color} bg-opacity-15 flex items-center justify-center`}>
        <Icon size={16} className={color} />
      </div>
      <div>
        <p className="text-sm font-bold text-white">{value}</p>
        <p className="text-[10px] text-slate-500">{label}</p>
      </div>
    </div>
  );
}

// ---------- Weekly Chart ----------

function WeeklyChart({ data }: { data: WeeklyComparison[] }) {
  const chartData = data.map((d) => ({
    name: d.label,
    'This Week': d.thisWeek,
    'Last Week': d.lastWeek,
  }));

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={2}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '11px',
            }}
            itemStyle={{ color: '#e2e8f0' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Bar dataKey="Last Week" fill="#475569" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar dataKey="This Week" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- Skill Radar Chart ----------

function SkillRadarChart({ data }: { data: SkillData[] }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.05)" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- Milestone Progress ----------

function MilestoneProgress({ milestone }: { milestone: MilestonePreview }) {
  const percentage = Math.min(
    (milestone.current / milestone.target) * 100,
    100,
  );

  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <Trophy size={14} className="text-amber-400" />
        <span className="text-xs font-medium text-white">Next Milestone</span>
      </div>
      <p className="text-[11px] text-slate-300 mb-1">{milestone.title}</p>
      <p className="text-[10px] text-slate-500 mb-2">{milestone.description}</p>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-1">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500">
          {milestone.current} / {milestone.target}
        </span>
        <span className="text-[10px] text-amber-400 font-medium">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

// ---------- Main Component ----------

const ProgressInsights: React.FC<ProgressInsightsProps> = ({
  totalQuestsCompleted,
  totalPoints,
  averageScore,
  currentStreak,
  bestStreak,
  strengths,
  weakAreas,
  weeklyComparison,
  skillRadar,
  nextMilestone,
  className = '',
}) => {
  const weeklyTrend = useMemo(() => {
    const thisWeekTotal = weeklyComparison.reduce((s, d) => s + d.thisWeek, 0);
    const lastWeekTotal = weeklyComparison.reduce((s, d) => s + d.lastWeek, 0);
    if (lastWeekTotal === 0) return { direction: 'up' as const, percent: 100 };
    const change = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
    return {
      direction: change >= 0 ? ('up' as const) : ('down' as const),
      percent: Math.abs(Math.round(change)),
    };
  }, [weeklyComparison]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={16} className="text-violet-400" />
        <h2 className="text-sm font-semibold text-white">Your Journey So Far</h2>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <StatCard
          icon={Target}
          label="Quests Completed"
          value={totalQuestsCompleted}
          color="text-emerald-400"
        />
        <StatCard
          icon={Sparkles}
          label="Total Points"
          value={totalPoints.toLocaleString()}
          color="text-violet-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={`${Math.round(averageScore)}%`}
          color="text-blue-400"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${currentStreak} days`}
          color="text-amber-400"
        />
      </div>

      {/* Streak Info */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 mb-5">
        <Flame size={14} className="text-amber-400" />
        <span className="text-[11px] text-slate-300">
          {currentStreak > 0
            ? `${currentStreak}-day streak! Best: ${bestStreak} days`
            : `Start a streak today! Best: ${bestStreak} days`}
        </span>
      </div>

      {/* Insights - Strengths */}
      {strengths.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={12} className="text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Strengths</span>
          </div>
          <div className="space-y-1">
            {strengths.map((insight, i) => (
              <p key={i} className="text-[11px] text-slate-300 leading-relaxed pl-4">
                {insight}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Insights - Weak Areas */}
      {weakAreas.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} className="text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Areas to Improve</span>
          </div>
          <div className="space-y-1">
            {weakAreas.map((area, i) => (
              <p key={i} className="text-[11px] text-slate-300 leading-relaxed pl-4">
                {area}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Skill Radar */}
      {skillRadar.length > 0 && (
        <div className="mb-5">
          <span className="text-[10px] text-slate-500 mb-1 block">Skill Distribution</span>
          <SkillRadarChart data={skillRadar} />
        </div>
      )}

      {/* This Week vs Last Week */}
      {weeklyComparison.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500">This Week vs Last Week</span>
            <div className="flex items-center gap-1">
              {weeklyTrend.direction === 'up' ? (
                <TrendingUp size={10} className="text-emerald-400" />
              ) : (
                <TrendingDown size={10} className="text-rose-400" />
              )}
              <span
                className={`text-[10px] font-medium ${
                  weeklyTrend.direction === 'up'
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {weeklyTrend.percent}%
              </span>
            </div>
          </div>
          <WeeklyChart data={weeklyComparison} />
        </div>
      )}

      {/* Next Milestone */}
      <MilestoneProgress milestone={nextMilestone} />
    </motion.div>
  );
};

export default ProgressInsights;
