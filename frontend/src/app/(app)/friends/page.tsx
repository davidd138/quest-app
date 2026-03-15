'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Search, MessageSquare, Gamepad2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface Friend {
  id: string;
  name: string;
  avatarUrl?: string;
  status: 'online' | 'offline';
  level: number;
  questsCompleted: number;
  lastActive: string;
}

const mockFriends: Friend[] = [
  { id: 'f1', name: 'Elena Vasquez', status: 'online', level: 42, questsCompleted: 87, lastActive: '2026-03-15T10:00:00Z' },
  { id: 'f2', name: 'Marcus Chen', status: 'online', level: 38, questsCompleted: 65, lastActive: '2026-03-15T09:30:00Z' },
  { id: 'f3', name: 'Sofia Rivera', status: 'offline', level: 55, questsCompleted: 120, lastActive: '2026-03-14T22:00:00Z' },
  { id: 'f4', name: 'Liam O\'Brien', status: 'offline', level: 29, questsCompleted: 42, lastActive: '2026-03-14T18:00:00Z' },
  { id: 'f5', name: 'Aisha Patel', status: 'online', level: 33, questsCompleted: 56, lastActive: '2026-03-15T08:45:00Z' },
  { id: 'f6', name: 'Kai Nakamura', status: 'offline', level: 47, questsCompleted: 98, lastActive: '2026-03-13T16:00:00Z' },
];

export default function FriendsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'online'>('all');

  const filtered = mockFriends
    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    .filter((f) => tab === 'all' || f.status === 'online');

  const onlineCount = mockFriends.filter((f) => f.status === 'online').length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-violet-400" />
            Friends
          </h1>
          <p className="text-slate-400 mt-1">
            {mockFriends.length} friends &middot; {onlineCount} online
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
          <UserPlus className="w-4 h-4" />
          Add Friend
        </button>
      </motion.div>

      {/* Search and tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search friends..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl glass border border-white/10">
          {(['all', 'online'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? 'bg-violet-500/20 text-violet-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Friends list */}
      <div className="space-y-2">
        {filtered.map((friend) => (
          <motion.div
            key={friend.id}
            variants={itemVariants}
            className="glass rounded-xl p-4 flex items-center gap-4 border border-transparent hover:border-slate-700/50 transition-colors group"
          >
            <Avatar name={friend.name} src={friend.avatarUrl} size="md" status={friend.status} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm truncate">{friend.name}</p>
              <p className="text-xs text-slate-500">
                Level {friend.level} &middot; {friend.questsCompleted} quests
              </p>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-violet-400 transition-colors" title="Message">
                <MessageSquare className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-emerald-400 transition-colors" title="Invite to quest">
                <Gamepad2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <motion.div variants={itemVariants} className="glass rounded-2xl p-12 text-center border border-slate-700/30">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-semibold text-white mb-2">No friends found</h3>
          <p className="text-slate-400 text-sm">Try a different search or add new friends.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
