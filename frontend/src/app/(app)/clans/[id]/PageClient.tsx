'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Users, Trophy, Zap, Crown, Calendar, MessageSquare, Settings } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const mockClan = {
  id: 'c1',
  name: 'Shadow Seekers',
  description: 'Elite adventurers exploring the unknown. We tackle the hardest quests and never back down.',
  tag: 'SHDW',
  level: 15,
  totalPoints: 45600,
  questsCompleted: 234,
  memberCount: 24,
  maxMembers: 30,
  createdAt: '2025-06-15',
  leader: { name: 'Elena Vasquez', level: 42 },
  members: [
    { id: 'm1', name: 'Elena Vasquez', role: 'Leader', level: 42, points: 8500, status: 'online' as const },
    { id: 'm2', name: 'Marcus Chen', role: 'Officer', level: 38, points: 6200, status: 'online' as const },
    { id: 'm3', name: 'Sofia Rivera', role: 'Officer', level: 55, points: 9800, status: 'offline' as const },
    { id: 'm4', name: 'Liam O\'Brien', role: 'Member', level: 29, points: 3200, status: 'offline' as const },
    { id: 'm5', name: 'Aisha Patel', role: 'Member', level: 33, points: 4100, status: 'online' as const },
  ],
};

const roleColors: Record<string, string> = {
  Leader: 'text-amber-400 bg-amber-500/15',
  Officer: 'text-violet-400 bg-violet-500/15',
  Member: 'text-slate-400 bg-slate-500/15',
};

export default function PageClient({ id }: { id: string }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <Link href="/clans" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Clans
        </Link>
      </motion.div>

      {/* Clan header */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-8 border border-violet-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-emerald-600/5" />
        <div className="relative flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-heading text-3xl font-bold text-white">{mockClan.name}</h1>
              <span className="text-xs px-2 py-1 rounded-lg bg-white/10 text-slate-400 font-mono">[{mockClan.tag}]</span>
            </div>
            <p className="text-slate-400 mb-4">{mockClan.description}</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <Crown className="w-4 h-4 text-amber-400" />
                {mockClan.leader.name}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <Users className="w-4 h-4 text-violet-400" />
                {mockClan.memberCount}/{mockClan.maxMembers}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Since {mockClan.createdAt}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        {[
          { icon: Zap, label: 'Total Points', value: mockClan.totalPoints.toLocaleString(), color: 'text-violet-400' },
          { icon: Trophy, label: 'Quests Completed', value: mockClan.questsCompleted.toString(), color: 'text-amber-400' },
          { icon: Shield, label: 'Clan Level', value: mockClan.level.toString(), color: 'text-emerald-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 text-center border border-white/5">
            <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
            <p className="text-2xl font-heading font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Members */}
      <motion.div variants={itemVariants}>
        <h2 className="font-heading text-xl font-bold text-white mb-4">Members</h2>
        <div className="space-y-2">
          {mockClan.members.map((member) => (
            <div key={member.id} className="glass rounded-xl p-4 flex items-center gap-4 border border-transparent hover:border-slate-700/50 transition-colors">
              <Avatar name={member.name} size="md" status={member.status} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{member.name}</p>
                <p className="text-xs text-slate-500">Level {member.level}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${roleColors[member.role] || ''}`}>
                {member.role}
              </span>
              <p className="text-sm font-heading font-bold text-slate-300">{member.points.toLocaleString()} pts</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div variants={itemVariants} className="flex gap-3 pb-8">
        <button className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Clan Chat
        </button>
        <button className="px-6 py-3 rounded-xl glass border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </motion.div>
    </motion.div>
  );
}
