'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Zap,
  Target,
  Clock,
  UserPlus,
  MessageSquare,
  Download,
  Star,
  Compass,
  Flame,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  level: number;
  title: string;
  questsCompleted: number;
  totalPoints: number;
  achievements: number;
  playTimeHours: number;
  topAchievements: Achievement[];
  recentCompletions: RecentCompletion[];
  favoriteCategories: CategoryStat[];
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface RecentCompletion {
  questId: string;
  questTitle: string;
  completedAt: string;
  points: number;
  difficulty: string;
}

interface CategoryStat {
  category: string;
  count: number;
  color: string;
}

const PLACEHOLDER_USER: UserProfile = {
  id: 'placeholder',
  name: 'Quest Explorer',
  level: 24,
  title: 'Veteran Pathfinder',
  questsCompleted: 47,
  totalPoints: 12850,
  achievements: 23,
  playTimeHours: 86,
  topAchievements: [
    { id: 'a1', name: 'First Steps', icon: 'footprints', rarity: 'common' },
    { id: 'a2', name: 'Voice Master', icon: 'mic', rarity: 'rare' },
    { id: 'a3', name: 'Speed Runner', icon: 'zap', rarity: 'epic' },
    { id: 'a4', name: 'Legend Slayer', icon: 'sword', rarity: 'legendary' },
    { id: 'a5', name: 'Social Butterfly', icon: 'users', rarity: 'rare' },
    { id: 'a6', name: 'Map Explorer', icon: 'map', rarity: 'epic' },
  ],
  recentCompletions: [
    { questId: 'q1', questTitle: 'Madrid Mystery Tour', completedAt: '2026-03-14T10:00:00Z', points: 450, difficulty: 'medium' },
    { questId: 'q2', questTitle: 'Barcelona Legends', completedAt: '2026-03-12T14:30:00Z', points: 680, difficulty: 'hard' },
    { questId: 'q3', questTitle: 'Seville Secrets', completedAt: '2026-03-10T09:15:00Z', points: 320, difficulty: 'easy' },
  ],
  favoriteCategories: [
    { category: 'Mystery', count: 15, color: '#8b5cf6' },
    { category: 'Adventure', count: 12, color: '#10b981' },
    { category: 'History', count: 9, color: '#f59e0b' },
    { category: 'Culture', count: 7, color: '#3b82f6' },
    { category: 'Other', count: 4, color: '#64748b' },
  ],
};

const rarityColors: Record<string, string> = {
  common: 'from-slate-400 to-slate-500 border-slate-400/30',
  rare: 'from-blue-400 to-blue-600 border-blue-400/30',
  epic: 'from-violet-400 to-violet-600 border-violet-400/30',
  legendary: 'from-amber-400 to-amber-600 border-amber-400/30',
};

const diffColors: Record<string, string> = {
  easy: 'text-emerald-400',
  medium: 'text-amber-400',
  hard: 'text-rose-400',
  legendary: 'text-violet-400',
};

function MiniPieChart({ categories }: { categories: CategoryStat[] }) {
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  let cumulativePercent = 0;

  const slices = categories.map((cat) => {
    const percent = (cat.count / total) * 100;
    const startAngle = (cumulativePercent / 100) * 360;
    const endAngle = ((cumulativePercent + percent) / 100) * 360;
    cumulativePercent += percent;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const largeArc = percent > 50 ? 1 : 0;

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    return (
      <path
        key={cat.category}
        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={cat.color}
        opacity={0.85}
      />
    );
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        {slices}
        <circle cx="50" cy="50" r="20" fill="#0f172a" />
      </svg>
      <div className="space-y-1">
        {categories.map((cat) => (
          <div key={cat.category} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-slate-400">{cat.category}</span>
            <span className="text-slate-500">({cat.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [user] = useState<UserProfile>(PLACEHOLDER_USER);
  const [friendRequested, setFriendRequested] = useState(false);

  useEffect(() => {
    // In production, fetch user profile by userId
    void userId;
  }, [userId]);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Back Link */}
      <motion.div variants={itemVariants}>
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leaderboard
        </Link>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-emerald-600/5" />
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-28 h-28 rounded-2xl object-cover border-2 border-violet-500/30 shadow-xl shadow-violet-500/10"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-violet-500/20">
                <span className="text-4xl font-bold text-white">{initials}</span>
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-violet-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
              Lv.{user.level}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-heading text-3xl font-bold text-white">{user.name}</h1>
            <p className="text-violet-400 font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
              <Shield className="w-4 h-4" />
              {user.title}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-3 mt-5">
              <button
                onClick={() => setFriendRequested(!friendRequested)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  friendRequested
                    ? 'bg-slate-700 text-slate-300 border border-slate-600'
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                {friendRequested ? 'Request Sent' : 'Add Friend'}
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 text-sm font-medium border border-slate-700/50 transition-colors">
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-400 text-sm border border-slate-700/50 transition-colors"
                title="Download Player Card"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5 text-center border border-emerald-500/20">
          <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-white">{user.questsCompleted}</p>
          <p className="text-xs text-slate-400 mt-0.5">Quests Completed</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center border border-violet-500/20">
          <Zap className="w-6 h-6 text-violet-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-white">{user.totalPoints.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Points</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center border border-amber-500/20">
          <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-white">{user.achievements}</p>
          <p className="text-xs text-slate-400 mt-0.5">Achievements</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center border border-rose-500/20">
          <Clock className="w-6 h-6 text-rose-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-white">{user.playTimeHours}h</p>
          <p className="text-xs text-slate-400 mt-0.5">Play Time</p>
        </div>
      </motion.div>

      {/* Achievement Badges Showcase */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Top Achievements
          </h2>
          <Link
            href={`/users/${userId}/achievements`}
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {user.topAchievements.slice(0, 6).map((achievement) => (
            <div
              key={achievement.id}
              className={`glass rounded-xl p-4 text-center border bg-gradient-to-br ${rarityColors[achievement.rarity]} border-opacity-20 hover:scale-[1.02] transition-transform`}
            >
              <div className="w-12 h-12 rounded-xl bg-navy-900/60 flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                <Flame className="w-6 h-6 text-white/80" />
              </div>
              <p className="text-sm font-medium text-white">{achievement.name}</p>
              <p className="text-xs text-slate-400 capitalize mt-0.5">{achievement.rarity}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Completions */}
        <motion.div variants={itemVariants}>
          <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            Recent Completions
          </h2>
          <div className="glass rounded-2xl overflow-hidden divide-y divide-slate-700/30">
            {user.recentCompletions.map((completion) => (
              <Link
                key={completion.questId}
                href={`/quests/${completion.questId}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-violet-300 transition-colors truncate">
                    {completion.questTitle}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(completion.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-violet-400">+{completion.points}</p>
                  <p className={`text-xs capitalize ${diffColors[completion.difficulty] || 'text-slate-400'}`}>
                    {completion.difficulty}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Favorite Categories */}
        <motion.div variants={itemVariants}>
          <h2 className="font-heading text-xl font-bold text-white mb-4">Favorite Categories</h2>
          <div className="glass rounded-2xl p-6">
            <MiniPieChart categories={user.favoriteCategories} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
