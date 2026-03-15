'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Trophy,
  DollarSign,
  Heart,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  Bell,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { AdminGuard } from '@/components/layout/AdminGuard';
import Card from '@/components/ui/Card';
import UserActivityChart from '@/components/admin/UserActivityChart';
import PlatformHealthCard from '@/components/admin/PlatformHealthCard';

// ---------- Types ----------

type ReportType = 'user_activity' | 'quest_completion' | 'revenue' | 'platform_health';
type DateRange = '7d' | '30d' | '90d' | '1y';

interface KPICard {
  label: string;
  value: string;
  trend: number; // percentage change
  icon: React.ElementType;
  color: 'violet' | 'emerald' | 'amber' | 'rose';
}

// ---------- Mock Data ----------

const DAILY_SIGNUPS = [
  { date: 'Mar 1', users: 12, completions: 8 },
  { date: 'Mar 2', users: 18, completions: 11 },
  { date: 'Mar 3', users: 15, completions: 14 },
  { date: 'Mar 4', users: 22, completions: 16 },
  { date: 'Mar 5', users: 19, completions: 12 },
  { date: 'Mar 6', users: 25, completions: 20 },
  { date: 'Mar 7', users: 30, completions: 24 },
  { date: 'Mar 8', users: 28, completions: 22 },
  { date: 'Mar 9', users: 35, completions: 27 },
  { date: 'Mar 10', users: 32, completions: 25 },
  { date: 'Mar 11', users: 38, completions: 30 },
  { date: 'Mar 12', users: 42, completions: 33 },
  { date: 'Mar 13', users: 40, completions: 35 },
  { date: 'Mar 14', users: 45, completions: 38 },
  { date: 'Mar 15', users: 48, completions: 40 },
];

const DAILY_ACTIVE_USERS = [
  { date: 'Mar 1', dau: 145 },
  { date: 'Mar 2', dau: 162 },
  { date: 'Mar 3', dau: 158 },
  { date: 'Mar 4', dau: 175 },
  { date: 'Mar 5', dau: 180 },
  { date: 'Mar 6', dau: 195 },
  { date: 'Mar 7', dau: 210 },
  { date: 'Mar 8', dau: 205 },
  { date: 'Mar 9', dau: 220 },
  { date: 'Mar 10', dau: 235 },
  { date: 'Mar 11', dau: 240 },
  { date: 'Mar 12', dau: 255 },
  { date: 'Mar 13', dau: 260 },
  { date: 'Mar 14', dau: 270 },
  { date: 'Mar 15', dau: 280 },
];

const COMPLETION_RATE_TREND = [
  { date: 'Mar 1', rate: 62 },
  { date: 'Mar 2', rate: 64 },
  { date: 'Mar 3', rate: 61 },
  { date: 'Mar 4', rate: 67 },
  { date: 'Mar 5', rate: 65 },
  { date: 'Mar 6', rate: 70 },
  { date: 'Mar 7', rate: 72 },
  { date: 'Mar 8', rate: 69 },
  { date: 'Mar 9', rate: 74 },
  { date: 'Mar 10', rate: 73 },
  { date: 'Mar 11', rate: 76 },
  { date: 'Mar 12', rate: 75 },
  { date: 'Mar 13', rate: 78 },
  { date: 'Mar 14', rate: 77 },
  { date: 'Mar 15', rate: 80 },
];

const KPI_CARDS: KPICard[] = [
  { label: 'Total Users', value: '1,247', trend: 12.5, icon: Users, color: 'violet' },
  { label: 'Quests Completed', value: '3,842', trend: 8.3, icon: Trophy, color: 'emerald' },
  { label: 'Avg Session Time', value: '24m 30s', trend: 5.1, icon: Clock, color: 'amber' },
  { label: 'Retention Rate', value: '73.2%', trend: -2.1, icon: Heart, color: 'rose' },
];

const REPORT_TYPES: { id: ReportType; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'user_activity', label: 'User Activity', icon: Users, description: 'Signups, DAU, sessions, and engagement metrics' },
  { id: 'quest_completion', label: 'Quest Completion', icon: Trophy, description: 'Completion rates, popular quests, and difficulty analysis' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, description: 'Points economy, reward redemptions, and conversion' },
  { id: 'platform_health', label: 'Platform Health', icon: Heart, description: 'API performance, errors, and infrastructure metrics' },
];

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.06 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const colorStyles: Record<string, { iconBg: string; iconColor: string }> = {
  violet: { iconBg: 'bg-violet-500/10', iconColor: 'text-violet-400' },
  emerald: { iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
  amber: { iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
  rose: { iconBg: 'bg-rose-500/10', iconColor: 'text-rose-400' },
};

// ---------- Component ----------

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('user_activity');
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const exportCSV = useCallback((data: Record<string, unknown>[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map((row) => headers.map((h) => `"${String(row[h] ?? '')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <AdminGuard>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="p-4 md:p-8 max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 size={28} className="text-violet-400" />
            Reports Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate and export platform analytics reports
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {KPI_CARDS.map((kpi) => {
            const Icon = kpi.icon;
            const style = colorStyles[kpi.color];
            const isPositive = kpi.trend >= 0;
            return (
              <Card key={kpi.label} variant="elevated" padding="none">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${style.iconBg}`}>
                      <Icon size={18} className={style.iconColor} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(kpi.trend)}%
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
                </div>
              </Card>
            );
          })}
        </motion.div>

        {/* Report Type Selector + Date Range */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map((rt) => {
              const Icon = rt.icon;
              return (
                <button
                  key={rt.id}
                  onClick={() => setSelectedReport(rt.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedReport === rt.id
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  {rt.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-500" />
            {(['7d', '30d', '90d', '1y'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  dateRange === range
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'bg-white/5 text-slate-500 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Report Content */}
        {selectedReport === 'user_activity' && (
          <div className="space-y-6">
            {/* Signups chart */}
            <motion.div variants={itemVariants}>
              <Card variant="elevated" padding="none">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-white">User Signups Over Time</h3>
                  <button
                    onClick={() => exportCSV(DAILY_SIGNUPS as Record<string, unknown>[], 'user-signups')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/5 text-slate-400 hover:text-white transition-all"
                  >
                    <Download size={12} />
                    CSV
                  </button>
                </div>
                <div className="p-5 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={DAILY_SIGNUPS}>
                      <defs>
                        <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 13 }} />
                      <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="url(#signupGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* DAU and Activity charts */}
            <motion.div variants={itemVariants}>
              <UserActivityChart />
            </motion.div>
          </div>
        )}

        {selectedReport === 'quest_completion' && (
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card variant="elevated" padding="none">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-white">Quest Completion Rate Trend</h3>
                  <button
                    onClick={() => exportCSV(COMPLETION_RATE_TREND as Record<string, unknown>[], 'completion-rate')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/5 text-slate-400 hover:text-white transition-all"
                  >
                    <Download size={12} />
                    CSV
                  </button>
                </div>
                <div className="p-5 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={COMPLETION_RATE_TREND}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[50, 100]} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 13 }} />
                      <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {selectedReport === 'revenue' && (
          <motion.div variants={itemVariants}>
            <Card variant="elevated" padding="none">
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="font-heading font-semibold text-white">Points Economy</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                  <p className="text-3xl font-bold text-emerald-400">482,500</p>
                  <p className="text-sm text-slate-400 mt-1">Total Points Earned</p>
                </div>
                <div className="text-center p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                  <p className="text-3xl font-bold text-rose-400">127,800</p>
                  <p className="text-sm text-slate-400 mt-1">Points Redeemed</p>
                </div>
                <div className="text-center p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                  <p className="text-3xl font-bold text-violet-400">26.5%</p>
                  <p className="text-sm text-slate-400 mt-1">Redemption Rate</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {selectedReport === 'platform_health' && (
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <PlatformHealthCard />
            </motion.div>
          </div>
        )}

        {/* Scheduled Reports (Placeholder) */}
        <motion.div variants={itemVariants} className="mt-8">
          <Card variant="elevated" padding="none">
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Bell size={16} className="text-violet-400" />
              </div>
              <h3 className="font-heading font-semibold text-white">Scheduled Reports</h3>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <FileText size={20} className="text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">Weekly Activity Summary</p>
                  <p className="text-xs text-slate-500">Sent every Monday at 09:00 UTC to admin@questmaster.com</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400">Active</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 mt-3">
                <FileText size={20} className="text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">Monthly Platform Health</p>
                  <p className="text-xs text-slate-500">Sent 1st of each month at 08:00 UTC to admin@questmaster.com</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400">Active</span>
              </div>
              <p className="text-xs text-slate-600 mt-4">
                Configure scheduled reports in the platform settings. CloudWatch integration coming soon.
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AdminGuard>
  );
}
