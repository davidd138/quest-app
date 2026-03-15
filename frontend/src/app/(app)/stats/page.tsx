'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Trophy,
  Flame,
  Zap,
  Clock,
  MessageSquare,
  Globe,
  Compass,
  Star,
  Shield,
  Swords,
  BookOpen,
  Award,
  Share2,
  ChevronRight,
  TrendingUp,
  Calendar,
  Target,
} from 'lucide-react';

// ---------- Mock Data ----------

const playerData = {
  name: 'Alex Mercer',
  title: 'Elite Adventurer',
  level: 47,
  xp: 23400,
  xpToNextLevel: 25000,
  rank: 12,
  joinedDate: '2025-06-15',
};

const skills = [
  { name: 'Communication', value: 85, color: 'from-violet-500 to-fuchsia-500', icon: MessageSquare },
  { name: 'Knowledge', value: 72, color: 'from-cyan-500 to-blue-500', icon: BookOpen },
  { name: 'Persuasion', value: 91, color: 'from-amber-500 to-orange-500', icon: Swords },
  { name: 'Exploration', value: 68, color: 'from-emerald-500 to-teal-500', icon: Compass },
  { name: 'Problem Solving', value: 78, color: 'from-rose-500 to-pink-500', icon: Target },
  { name: 'Leadership', value: 64, color: 'from-indigo-500 to-violet-500', icon: Shield },
];

const questHistory = [
  { date: '2026-03-15', quest: 'The Lost Temple of Madrid', score: 920, category: 'adventure' },
  { date: '2026-03-13', quest: 'Culinary Secrets of Barcelona', score: 850, category: 'culinary' },
  { date: '2026-03-11', quest: 'Mystery at the Museum', score: 985, category: 'mystery' },
  { date: '2026-03-09', quest: 'Urban Explorer: Tokyo', score: 720, category: 'urban' },
  { date: '2026-03-07', quest: 'The Enchanted Garden', score: 890, category: 'nature' },
  { date: '2026-03-05', quest: 'Historical Walk: Rome', score: 810, category: 'cultural' },
  { date: '2026-03-03', quest: 'Night Market Detective', score: 940, category: 'mystery' },
  { date: '2026-03-01', quest: 'Team Building Challenge', score: 760, category: 'team_building' },
];

const categoryStats = [
  { name: 'Adventure', count: 24, icon: Compass, color: 'text-violet-400' },
  { name: 'Mystery', count: 18, icon: Target, color: 'text-slate-300' },
  { name: 'Cultural', count: 15, icon: Globe, color: 'text-amber-400' },
  { name: 'Culinary', count: 12, icon: Star, color: 'text-rose-400' },
  { name: 'Nature', count: 8, icon: Compass, color: 'text-emerald-400' },
  { name: 'Urban', count: 6, icon: Shield, color: 'text-cyan-400' },
];

const stats = {
  questsCompleted: 87,
  totalPoints: 23400,
  totalPlayTime: 4320, // minutes
  wordsSpoken: 48500,
  longestStreak: 14,
  currentStreak: 7,
  fastestQuest: { name: 'Speed Run Challenge', time: 8.5 },
  hardestQuest: { name: 'Legendary Labyrinth', difficulty: 'legendary' },
  countriesExplored: ['Spain', 'Japan', 'Italy', 'France', 'Germany', 'UK', 'Portugal', 'Greece'],
  achievements: 15,
};

// ---------- Helpers ----------

function formatPlayTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

// ---------- Animations ----------

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// ---------- Page ----------

export default function StatsPage() {
  const [shareHovered, setShareHovered] = useState(false);

  const xpPercent = (playerData.xp / playerData.xpToNextLevel) * 100;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/25">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            Player Stats
          </h1>
          <p className="text-slate-400 mt-2 ml-[60px]">Your complete adventure profile and statistics</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setShareHovered(true)}
          onHoverEnd={() => setShareHovered(false)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-violet-500/25 self-start md:self-auto"
        >
          <Share2 className="w-4 h-4" />
          Share Player Card
        </motion.button>
      </motion.div>

      {/* Player Card */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl border border-white/10 overflow-hidden relative"
      >
        {/* Card background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-fuchsia-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(139,92,246,0.08),transparent_50%)]" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar + Level */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-violet-500/30 border-4 border-navy-950">
                  AM
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-sm font-black text-navy-950 border-4 border-navy-950 shadow-xl">
                  {playerData.level}
                </div>
              </div>
              <div className="mt-4 text-center">
                <h2 className="font-heading text-xl font-bold text-white">{playerData.name}</h2>
                <p className="text-xs text-violet-400 font-medium">{playerData.title}</p>
                <p className="text-[10px] text-slate-500 mt-1">Rank #{playerData.rank}</p>
              </div>

              {/* XP Bar */}
              <div className="w-full mt-4 max-w-[200px]">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Level {playerData.level}</span>
                  <span>{playerData.xp.toLocaleString()} / {playerData.xpToNextLevel.toLocaleString()} XP</span>
                </div>
                <div className="h-2.5 rounded-full bg-navy-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-400" />
                Character Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skills.map((skill, i) => {
                  const Icon = skill.icon;
                  return (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-300">{skill.name}</span>
                          <span className="text-xs font-bold text-white">{skill.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-navy-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.value}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                            className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Quests Completed', value: stats.questsCompleted, icon: Compass, color: 'text-violet-400', bgColor: 'bg-violet-500/15' },
          { label: 'Total Points', value: stats.totalPoints.toLocaleString(), icon: Zap, color: 'text-emerald-400', bgColor: 'bg-emerald-500/15' },
          { label: 'Play Time', value: formatPlayTime(stats.totalPlayTime), icon: Clock, color: 'text-cyan-400', bgColor: 'bg-cyan-500/15' },
          { label: 'Words Spoken', value: `${(stats.wordsSpoken / 1000).toFixed(1)}k`, icon: MessageSquare, color: 'text-amber-400', bgColor: 'bg-amber-500/15' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-5 border border-white/10"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-heading font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Middle Section: Streaks + Records + Countries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Streaks */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Streaks
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Current Streak</span>
                <span className="text-lg font-bold text-amber-400 flex items-center gap-1">
                  {stats.currentStreak}
                  <Flame className="w-4 h-4" />
                </span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-3 rounded-full ${
                      i < stats.currentStreak
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-navy-800'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
              <span className="text-xs text-slate-400">Longest Streak</span>
              <span className="text-sm font-bold text-white">{stats.longestStreak} days</span>
            </div>
          </div>
        </motion.div>

        {/* Records */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Personal Records
          </h3>
          <div className="space-y-3">
            <div className="rounded-xl bg-white/5 px-4 py-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Fastest Quest</p>
              <p className="text-sm font-semibold text-white mt-0.5">{stats.fastestQuest.name}</p>
              <p className="text-xs text-emerald-400">{stats.fastestQuest.time} minutes</p>
            </div>
            <div className="rounded-xl bg-white/5 px-4 py-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Hardest Quest Beaten</p>
              <p className="text-sm font-semibold text-white mt-0.5">{stats.hardestQuest.name}</p>
              <p className="text-xs text-violet-400 capitalize">{stats.hardestQuest.difficulty}</p>
            </div>
            <div className="rounded-xl bg-white/5 px-4 py-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Achievements Earned</p>
              <p className="text-sm font-semibold text-amber-400 mt-0.5">{stats.achievements} / 30</p>
            </div>
          </div>
        </motion.div>

        {/* Countries */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Countries Explored
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.countriesExplored.map((country) => (
              <motion.span
                key={country}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300"
              >
                {country}
              </motion.span>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">{stats.countriesExplored.length} countries visited</p>
        </motion.div>
      </div>

      {/* Most Played Categories */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          Most Played Categories
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categoryStats.map((cat, i) => {
            const Icon = cat.icon;
            const maxCount = categoryStats[0].count;
            const percent = (cat.count / maxCount) * 100;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-white/5 border border-white/5 p-4 text-center"
              >
                <Icon className={`w-5 h-5 ${cat.color} mx-auto mb-2`} />
                <p className="text-lg font-bold text-white">{cat.count}</p>
                <p className="text-[10px] text-slate-500 mb-2">{cat.name}</p>
                <div className="h-1.5 rounded-full bg-navy-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quest History Timeline */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-violet-400" />
          Quest History Timeline
        </h3>
        <div className="space-y-0">
          {questHistory.map((entry, i) => {
            const isLast = i === questHistory.length - 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-4 group"
              >
                {/* Timeline line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-violet-500 border-2 border-navy-950 shadow-lg shadow-violet-500/20 mt-1.5" />
                  {!isLast && <div className="w-px flex-1 bg-white/10 my-1" />}
                </div>

                {/* Content */}
                <div className={`flex-1 flex items-center justify-between rounded-xl px-4 py-3 -mt-0.5 ${!isLast ? 'mb-2' : ''} group-hover:bg-white/[0.02] transition-colors`}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{entry.quest}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className="capitalize">&middot; {entry.category.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className="text-sm font-bold text-emerald-400">{entry.score}</span>
                    <p className="text-[10px] text-slate-600">points</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
