'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Target,
  Clock,
  TrendingUp,
  ArrowRight,
  Compass,
  ChevronRight,
  Star,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_ANALYTICS, GET_ACHIEVEMENTS, LIST_QUESTS } from '@/lib/graphql/queries';
import type { Analytics, Achievement, Quest } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  color: 'violet' | 'emerald' | 'amber' | 'rose';
}) {
  const colorMap = {
    violet: {
      bg: 'bg-violet-600/10',
      text: 'text-violet-400',
      border: 'border-violet-500/20',
    },
    emerald: {
      bg: 'bg-emerald-600/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
    amber: {
      bg: 'bg-amber-600/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
    },
    rose: {
      bg: 'bg-rose-600/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
    },
  };

  const c = colorMap[color];

  return (
    <motion.div
      variants={itemVariants}
      className={`glass rounded-2xl p-6 border ${c.border}`}
    >
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${c.text}`} />
      </div>
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-heading font-bold text-white">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
    </motion.div>
  );
}

function QuestProgressCard({ quest, progress }: { quest: Quest; progress: number }) {
  const difficultyColors: Record<string, string> = {
    easy: 'bg-emerald-500/20 text-emerald-400',
    medium: 'bg-amber-500/20 text-amber-400',
    hard: 'bg-rose-500/20 text-rose-400',
    legendary: 'bg-violet-500/20 text-violet-400',
  };

  return (
    <Link href={`/quests/${quest.id}`}>
      <div className="glass rounded-xl p-5 hover:bg-white/[0.03] transition-all duration-200 group cursor-pointer border border-transparent hover:border-violet-500/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
              {quest.title}
            </h4>
            <p className="text-sm text-slate-400 mt-0.5">{quest.stages.length} stages</p>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
              difficultyColors[quest.difficulty] || ''
            }`}
          >
            {quest.difficulty}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">{progress}% complete</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: analytics, error: analyticsErr, execute: fetchAnalytics } = useQuery<Analytics>(GET_ANALYTICS);
  const { data: achievements, execute: fetchAchievements } = useQuery<Achievement[]>(GET_ACHIEVEMENTS);
  const { data: questsData, error: questsErr, execute: fetchQuests } = useQuery<{ items: Quest[] }>(LIST_QUESTS);

  useEffect(() => {
    fetchAnalytics().catch(() => {});
    fetchAchievements().catch(() => {});
    fetchQuests({ limit: 6 }).catch(() => {});
  }, [fetchAnalytics, fetchAchievements, fetchQuests]);

  const firstName = user?.name?.split(' ')[0] || 'Adventurer';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      data-tour="dashboard-content"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Errors */}
      {(analyticsErr || questsErr) && (
        <div className="glass rounded-xl p-4 border border-rose-500/30 bg-rose-500/5">
          <p className="text-rose-400 text-sm">{analyticsErr || questsErr}</p>
        </div>
      )}

      {/* Welcome */}
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>
        <p className="text-slate-400 mt-2">Ready for your next adventure?</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          label="Total Points"
          value={analytics?.totalPoints || user?.totalPoints || 0}
          color="violet"
        />
        <StatCard
          icon={Target}
          label="Quests Completed"
          value={analytics?.questsCompleted || user?.questsCompleted || 0}
          color="emerald"
        />
        <StatCard
          icon={Clock}
          label="Play Time"
          value={Math.round((analytics?.totalPlayTime || 0) / 60)}
          suffix="h"
          color="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Score"
          value={Math.round(analytics?.averageScore || 0)}
          suffix="%"
          color="rose"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Quests */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-white">Active Quests</h2>
            <Link
              href="/quests"
              className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {questsData?.items?.slice(0, 4).map((quest, i) => (
              <QuestProgressCard
                key={quest.id}
                quest={quest}
                progress={Math.min(((i + 1) * 25) % 100, 95)}
              />
            )) || (
              <div className="md:col-span-2 glass rounded-xl p-8 text-center">
                <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No active quests yet</p>
                <Link
                  href="/quests"
                  className="inline-flex items-center gap-2 mt-4 text-sm text-violet-400 hover:text-violet-300"
                >
                  Browse quests <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <h2 className="font-heading text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="glass rounded-2xl p-5 space-y-4">
            {analytics?.recentActivity?.slice(0, 5).map((activity, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 truncate">{activity.questTitle}</p>
                  <p className="text-xs text-slate-500">{activity.action}</p>
                </div>
                {activity.points > 0 && (
                  <span className="text-emerald-400 text-xs font-medium">
                    +{activity.points}
                  </span>
                )}
              </div>
            )) || (
              <p className="text-slate-500 text-sm text-center py-4">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recommended Quests */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold text-white">Recommended Quests</h2>
          <Link
            href="/quests"
            className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            See more <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {questsData?.items?.slice(0, 6).map((quest) => (
            <Link key={quest.id} href={`/quests/${quest.id}`}>
              <div className="glass rounded-xl p-5 min-w-[260px] max-w-[280px] hover:bg-white/[0.03] transition-all duration-200 group cursor-pointer border border-transparent hover:border-violet-500/20">
                <div
                  className="w-full h-32 rounded-lg mb-4 bg-gradient-to-br from-violet-600/30 to-emerald-600/20 flex items-center justify-center"
                >
                  <Compass className="w-10 h-10 text-violet-400/50" />
                </div>
                <h4 className="font-heading font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                  {quest.title}
                </h4>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{quest.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-emerald-400">{quest.totalPoints} pts</span>
                  <span className="text-xs text-slate-500">{quest.estimatedDuration} min</span>
                </div>
              </div>
            </Link>
          )) || null}
        </div>
      </motion.div>

      {/* Achievement Showcase */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold text-white">Latest Achievements</h2>
          <Link
            href="/achievements"
            className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements?.slice(0, 3).map((achievement) => (
            <div
              key={achievement.id}
              className="glass rounded-xl p-5 border border-amber-500/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center mb-3">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="font-heading font-semibold text-white">{achievement.title}</h4>
                <p className="text-sm text-slate-400 mt-1">{achievement.description}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )) || (
            <div className="md:col-span-3 glass rounded-xl p-8 text-center">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Complete quests to earn achievements</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
