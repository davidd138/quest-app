'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Users, Trash2, Ban, MoreVertical, Eye } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const mockClans = [
  { id: 'c1', name: 'Shadow Seekers', tag: 'SHDW', members: 24, maxMembers: 30, leader: 'Elena V.', totalPoints: 45600, status: 'active', createdAt: '2025-06-15' },
  { id: 'c2', name: 'Night Explorers', tag: 'NEXP', members: 18, maxMembers: 20, leader: 'Marcus C.', totalPoints: 32100, status: 'active', createdAt: '2025-08-22' },
  { id: 'c3', name: 'Quest Kings', tag: 'QKNG', members: 5, maxMembers: 50, leader: 'Sofia R.', totalPoints: 12400, status: 'active', createdAt: '2025-12-01' },
  { id: 'c4', name: 'Toxic Raiders', tag: 'TOXR', members: 3, maxMembers: 10, leader: 'Bad User', totalPoints: 800, status: 'suspended', createdAt: '2026-01-15' },
];

export default function AdminClansPage() {
  const [search, setSearch] = useState('');
  const filtered = mockClans.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.tag.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-violet-400" />
          Clan Management
        </h1>
        <p className="text-slate-400 mt-1">{mockClans.length} total clans</p>
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clans..." className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all" />
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-slate-500 font-medium">Clan</th>
                <th className="text-left p-4 text-slate-500 font-medium">Leader</th>
                <th className="text-center p-4 text-slate-500 font-medium">Members</th>
                <th className="text-center p-4 text-slate-500 font-medium">Points</th>
                <th className="text-center p-4 text-slate-500 font-medium">Status</th>
                <th className="text-center p-4 text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((clan) => (
                <tr key={clan.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-white">{clan.name}</p>
                      <p className="text-xs text-slate-500 font-mono">[{clan.tag}]</p>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{clan.leader}</td>
                  <td className="p-4 text-center text-slate-300">{clan.members}/{clan.maxMembers}</td>
                  <td className="p-4 text-center text-slate-300">{clan.totalPoints.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${clan.status === 'active' ? 'text-emerald-400 bg-emerald-500/15' : 'text-rose-400 bg-rose-500/15'}`}>
                      {clan.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors" title="Suspend"><Ban className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
