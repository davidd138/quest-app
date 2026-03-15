'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Star, Clock, Users, Zap, Share2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const mockAchievement = {
  id: 'a1',
  title: 'Quest Master',
  description: 'Complete 50 quests across all difficulty levels. A true adventurer leaves no stone unturned.',
  category: 'Quests',
  rarity: 'Legendary',
  pointsAwarded: 500,
  earnedAt: '2026-03-10T14:30:00Z',
  progress: 50,
  total: 50,
  percentPlayers: 2.4,
  recentEarners: [
    { name: 'Elena V.', earnedAt: '2026-03-14' },
    { name: 'Marcus C.', earnedAt: '2026-03-12' },
    { name: 'Sofia R.', earnedAt: '2026-03-08' },
  ],
};

const rarityColors: Record<string, string> = {
  Common: 'text-slate-400 bg-slate-500/15 border-slate-500/30',
  Rare: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  Epic: 'text-violet-400 bg-violet-500/15 border-violet-500/30',
  Legendary: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
};

export default function PageClient({ id }: { id: string }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <Link href="/achievements" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Achievements
        </Link>
      </motion.div>

      {/* Achievement card */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-8 border border-amber-500/20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent" />
        <div className="relative">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 flex items-center justify-center mx-auto mb-4"
          >
            <Trophy className="w-12 h-12 text-amber-400" />
          </motion.div>
          <h1 className="font-heading text-3xl font-bold text-white mb-2">{mockAchievement.title}</h1>
          <span className={`inline-block text-xs px-3 py-1 rounded-lg font-medium border ${rarityColors[mockAchievement.rarity]}`}>
            {mockAchievement.rarity}
          </span>
          <p className="text-slate-400 mt-4 max-w-md mx-auto">{mockAchievement.description}</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center border border-white/5">
          <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <p className="text-xl font-heading font-bold text-white">{mockAchievement.pointsAwarded}</p>
          <p className="text-xs text-slate-500">Points Earned</p>
        </div>
        <div className="glass rounded-xl p-4 text-center border border-white/5">
          <Users className="w-5 h-5 text-violet-400 mx-auto mb-2" />
          <p className="text-xl font-heading font-bold text-white">{mockAchievement.percentPlayers}%</p>
          <p className="text-xs text-slate-500">Players Earned</p>
        </div>
        <div className="glass rounded-xl p-4 text-center border border-white/5">
          <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <p className="text-xl font-heading font-bold text-white">{new Date(mockAchievement.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          <p className="text-xs text-slate-500">Date Earned</p>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div variants={itemVariants} className="glass rounded-xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Progress</span>
          <span className="text-sm text-emerald-400 font-medium">{mockAchievement.progress}/{mockAchievement.total}</span>
        </div>
        <div className="w-full h-3 rounded-full bg-navy-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(mockAchievement.progress / mockAchievement.total) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
          />
        </div>
      </motion.div>

      {/* Recent earners */}
      <motion.div variants={itemVariants}>
        <h3 className="font-heading font-semibold text-white mb-3">Recent Earners</h3>
        <div className="space-y-2">
          {mockAchievement.recentEarners.map((earner, i) => (
            <div key={i} className="glass rounded-xl p-3 flex items-center gap-3 border border-transparent">
              <Avatar name={earner.name} size="sm" />
              <span className="text-sm text-slate-300 flex-1">{earner.name}</span>
              <span className="text-xs text-slate-500">{earner.earnedAt}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Share */}
      <motion.div variants={itemVariants} className="flex justify-center pb-8">
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/10 text-slate-300 hover:text-white transition-colors">
          <Share2 className="w-4 h-4" />
          Share Achievement
        </button>
      </motion.div>
    </motion.div>
  );
}
