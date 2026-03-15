'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Users, UserPlus, Trophy, Zap } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const friendStats = {
  total: 24,
  online: 8,
  questsTogether: 45,
};

const topFriends = [
  { id: 'f1', name: 'Elena Vasquez', level: 42, questsTogether: 12, status: 'online' as const },
  { id: 'f2', name: 'Marcus Chen', level: 38, questsTogether: 9, status: 'online' as const },
  { id: 'f3', name: 'Sofia Rivera', level: 55, questsTogether: 8, status: 'offline' as const },
  { id: 'f4', name: 'Liam O\'Brien', level: 29, questsTogether: 6, status: 'offline' as const },
  { id: 'f5', name: 'Aisha Patel', level: 33, questsTogether: 5, status: 'online' as const },
];

export default function ProfileFriendsPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-violet-400" />
            My Friends
          </h1>
          <p className="text-slate-400 mt-1">{friendStats.total} friends &middot; {friendStats.online} online</p>
        </div>
        <Link href="/friends" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
          <UserPlus className="w-4 h-4" />
          Manage Friends
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center border border-white/5">
          <Users className="w-5 h-5 text-violet-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-white">{friendStats.total}</p>
          <p className="text-xs text-slate-500">Total Friends</p>
        </div>
        <div className="glass rounded-xl p-4 text-center border border-white/5">
          <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-white">{friendStats.online}</p>
          <p className="text-xs text-slate-500">Online Now</p>
        </div>
        <div className="glass rounded-xl p-4 text-center border border-white/5">
          <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-heading font-bold text-white">{friendStats.questsTogether}</p>
          <p className="text-xs text-slate-500">Quests Together</p>
        </div>
      </motion.div>

      {/* Top quest partners */}
      <motion.div variants={itemVariants}>
        <h3 className="font-heading font-semibold text-white mb-4">Top Quest Partners</h3>
        <div className="space-y-2">
          {topFriends.map((friend, i) => (
            <div key={friend.id} className="glass rounded-xl p-4 flex items-center gap-4 border border-transparent hover:border-slate-700/50 transition-colors">
              <span className="w-6 text-center text-sm font-heading font-bold text-slate-500">{i + 1}</span>
              <Avatar name={friend.name} size="md" status={friend.status} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{friend.name}</p>
                <p className="text-xs text-slate-500">Level {friend.level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-heading font-bold text-violet-400">{friend.questsTogether}</p>
                <p className="text-xs text-slate-500">quests</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
