'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Layers,
  Trophy,
  DollarSign,
  Star,
  Activity,
  Plus,
  Shield,
  Flag,
  FileText,
  AlertTriangle,
  Server,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_ADMIN_ANALYTICS } from '@/lib/graphql/queries';
import AdminKPICard from '@/components/admin/AdminKPICard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

// ---------- Animation Variants ----------

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, staggerChildren: 0.06 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

// ---------- Quick Action Card ----------

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  color: string;
}

function QuickAction({ icon: Icon, label, description, href, color }: QuickActionProps) {
  return (
    <Link href={href}>
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 cursor-pointer hover:border-white/20 transition-colors group"
      >
        <div className={`p-2.5 rounded-xl ${color} w-fit mb-3`}>
          <Icon size={20} className="text-white" />
        </div>
        <h3 className="font-semibold text-white text-sm mb-1">{label}</h3>
        <p className="text-xs text-slate-400">{description}</p>
        <div className="flex items-center gap-1 mt-3 text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Go <ArrowRight size={12} />
        </div>
      </motion.div>
    </Link>
  );
}

// ---------- Activity Item ----------

interface ActivityItem {
  id: string;
  type: 'quest_created' | 'user_joined' | 'quest_completed' | 'report_filed' | 'quest_published';
  message: string;
  timestamp: string;
  icon: React.ElementType;
  iconColor: string;
}

function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card variant="elevated" padding="md">
      <h3 className="font-semibold text-white text-sm mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className={`p-1.5 rounded-lg ${item.iconColor} flex-shrink-0 mt-0.5`}>
                <Icon size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 truncate">{item.message}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{item.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ---------- System Health ----------

interface HealthMetric {
  label: string;
  status: 'healthy' | 'warning' | 'error';
  value: string;
}

function SystemHealth({ metrics }: { metrics: HealthMetric[] }) {
  const statusIcons = {
    healthy: <CheckCircle2 size={14} className="text-emerald-400" />,
    warning: <AlertTriangle size={14} className="text-amber-400" />,
    error: <XCircle size={14} className="text-rose-400" />,
  };

  const statusBg = {
    healthy: 'bg-emerald-500/10',
    warning: 'bg-amber-500/10',
    error: 'bg-rose-500/10',
  };

  return (
    <Card variant="elevated" padding="md">
      <div className="flex items-center gap-2 mb-4">
        <Server size={16} className="text-slate-400" />
        <h3 className="font-semibold text-white text-sm">System Health</h3>
      </div>
      <div className="space-y-2.5">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded ${statusBg[m.status]}`}>
                {statusIcons[m.status]}
              </div>
              <span className="text-sm text-slate-300">{m.label}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">{m.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------- Pending Items ----------

interface PendingItem {
  id: string;
  label: string;
  count: number;
  href: string;
  color: string;
}

function PendingItems({ items }: { items: PendingItem[] }) {
  const total = items.reduce((s, i) => s + i.count, 0);

  return (
    <Card variant="elevated" padding="md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white text-sm">Pending Items</h3>
        {total > 0 && (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400">
            {total}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 hover:bg-white/10 transition-colors group"
          >
            <span className="text-sm text-slate-300">{item.label}</span>
            <div className="flex items-center gap-2">
              {item.count > 0 && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.color}`}>
                  {item.count}
                </span>
              )}
              <ArrowRight
                size={12}
                className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

// ---------- Alert Banner ----------

interface AlertBanner {
  id: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

function AlertsList({ alerts }: { alerts: AlertBanner[] }) {
  if (alerts.length === 0) return null;

  const severityStyles = {
    info: 'border-blue-500/30 bg-blue-500/5 text-blue-300',
    warning: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
    error: 'border-rose-500/30 bg-rose-500/5 text-rose-300',
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${severityStyles[alert.severity]}`}
        >
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span>{alert.message}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Main Page ----------

export default function AdminDashboardPage() {
  const { data: analytics, loading, execute } = useQuery(GET_ADMIN_ANALYTICS);

  useEffect(() => {
    execute();
  }, [execute]);

  // Mock/derived data - in production these would come from the API
  const kpiData = {
    totalUsers: analytics?.totalUsers ?? 0,
    questsPublished: analytics?.questsPublished ?? 0,
    completions: analytics?.completionsThisWeek ?? 0,
    revenue: analytics?.revenue ?? 0,
    avgScore: analytics?.averageRating ?? 0,
    activeNow: analytics?.activeToday ?? 0,
  };

  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'quest_created',
      message: 'New quest "The Hidden Temple" created by Admin',
      timestamp: '5 minutes ago',
      icon: Plus,
      iconColor: 'bg-violet-500/20 text-violet-400',
    },
    {
      id: '2',
      type: 'user_joined',
      message: 'New user registered: maria@example.com',
      timestamp: '12 minutes ago',
      icon: Users,
      iconColor: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      id: '3',
      type: 'quest_completed',
      message: 'User completed "Mystery of the Old Town"',
      timestamp: '25 minutes ago',
      icon: Trophy,
      iconColor: 'bg-amber-500/20 text-amber-400',
    },
    {
      id: '4',
      type: 'report_filed',
      message: 'Content report filed for quest #Q-2847',
      timestamp: '1 hour ago',
      icon: Flag,
      iconColor: 'bg-rose-500/20 text-rose-400',
    },
    {
      id: '5',
      type: 'quest_published',
      message: 'Quest "City Legends" published',
      timestamp: '2 hours ago',
      icon: Layers,
      iconColor: 'bg-blue-500/20 text-blue-400',
    },
  ];

  const healthMetrics: HealthMetric[] = [
    { label: 'API (AppSync)', status: 'healthy', value: '23ms avg' },
    { label: 'DynamoDB', status: 'healthy', value: '4ms avg' },
    { label: 'Lambda', status: 'healthy', value: '142ms avg' },
    { label: 'CloudFront', status: 'healthy', value: '99.99%' },
    { label: 'Error Rate', status: 'warning', value: '0.12%' },
  ];

  const pendingItems: PendingItem[] = [
    {
      id: 'mod',
      label: 'Moderation Queue',
      count: 3,
      href: '/admin/moderation',
      color: 'bg-rose-500/20 text-rose-400',
    },
    {
      id: 'quests',
      label: 'Community Quests',
      count: 7,
      href: '/admin/quests',
      color: 'bg-amber-500/20 text-amber-400',
    },
    {
      id: 'reports',
      label: 'Content Reports',
      count: 2,
      href: '/admin/reports/content',
      color: 'bg-violet-500/20 text-violet-400',
    },
  ];

  const alerts: AlertBanner[] = [
    {
      id: 'err-rate',
      severity: 'warning',
      message: 'Error rate slightly elevated (0.12%) in the last hour.',
    },
  ];

  return (
    <AdminGuard>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Page header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Platform overview and quick actions
          </p>
        </motion.div>

        {/* Alerts */}
        <motion.div variants={itemVariants}>
          <AlertsList alerts={alerts} />
        </motion.div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <AdminKPICard
            label="Total Users"
            value={kpiData.totalUsers}
            icon={Users}
            color="violet"
            trend={{ direction: 'up', percentage: 12.5, label: 'vs last week' }}
            sparklineData={[10, 14, 18, 16, 22, 28, kpiData.totalUsers || 35]}
            loading={loading}
            onClick={() => {}}
          />
          <AdminKPICard
            label="Quests"
            value={kpiData.questsPublished}
            icon={Layers}
            color="amber"
            trend={{ direction: 'up', percentage: 8.3, label: 'vs last week' }}
            sparklineData={[2, 3, 5, 4, 7, 8, kpiData.questsPublished || 12]}
            loading={loading}
          />
          <AdminKPICard
            label="Completions"
            value={kpiData.completions}
            icon={Trophy}
            color="rose"
            trend={{ direction: 'up', percentage: 15.2, label: 'vs last week' }}
            sparklineData={[3, 6, 4, 8, 10, 7, kpiData.completions || 14]}
            loading={loading}
          />
          <AdminKPICard
            label="Revenue"
            value={kpiData.revenue}
            format="currency"
            icon={DollarSign}
            color="cyan"
            trend={{ direction: 'up', percentage: 22.1, label: 'vs last week' }}
            sparklineData={[100, 250, 180, 420, 380, 550, kpiData.revenue || 720]}
            loading={loading}
          />
          <AdminKPICard
            label="Avg Score"
            value={kpiData.avgScore}
            format="decimal"
            icon={Star}
            color="blue"
            trend={{ direction: 'neutral', percentage: 0.2, label: 'vs last week' }}
            sparklineData={[3.8, 4.0, 3.9, 4.2, 4.1, 4.3, kpiData.avgScore || 4.2]}
            loading={loading}
          />
          <AdminKPICard
            label="Active Now"
            value={kpiData.activeNow}
            icon={Activity}
            color="emerald"
            trend={{ direction: 'up', percentage: 5.0, label: 'vs yesterday' }}
            sparklineData={[5, 8, 6, 12, 9, 14, kpiData.activeNow || 18]}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              icon={Plus}
              label="Create Quest"
              description="Design a new quest with stages and characters"
              href="/admin/quests/new"
              color="bg-violet-600"
            />
            <QuickAction
              icon={Users}
              label="Manage Users"
              description="View, search, and manage user accounts"
              href="/admin/users"
              color="bg-emerald-600"
            />
            <QuickAction
              icon={Shield}
              label="Moderation Queue"
              description="Review flagged content and reports"
              href="/admin/moderation"
              color="bg-rose-600"
            />
            <QuickAction
              icon={FileText}
              label="Reports"
              description="View platform analytics and reports"
              href="/admin/reports"
              color="bg-blue-600"
            />
          </div>
        </motion.div>

        {/* Bottom grid: Activity, Health, Pending */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div variants={itemVariants}>
            <RecentActivity items={recentActivity} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <SystemHealth metrics={healthMetrics} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <PendingItems items={pendingItems} />
          </motion.div>
        </div>
      </motion.div>
    </AdminGuard>
  );
}
