'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Search, Edit, Trash2, Eye, Clock } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const mockEvents = [
  { id: 'e1', title: 'Spring Quest Festival', startDate: '2026-03-20', endDate: '2026-03-27', status: 'upcoming', participants: 0, quests: 3 },
  { id: 'e2', title: 'Winter Challenge', startDate: '2025-12-15', endDate: '2025-12-31', status: 'completed', participants: 2451, quests: 5 },
  { id: 'e3', title: 'Mystery Month', startDate: '2026-04-01', endDate: '2026-04-30', status: 'draft', participants: 0, quests: 8 },
  { id: 'e4', title: 'Explorer Week', startDate: '2026-03-10', endDate: '2026-03-17', status: 'active', participants: 1342, quests: 4 },
];

const statusColors: Record<string, string> = {
  draft: 'text-slate-400 bg-slate-500/15',
  upcoming: 'text-amber-400 bg-amber-500/15',
  active: 'text-emerald-400 bg-emerald-500/15',
  completed: 'text-violet-400 bg-violet-500/15',
};

export default function AdminEventsPage() {
  const [search, setSearch] = useState('');
  const filtered = mockEvents.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-violet-400" />
            Event Management
          </h1>
          <p className="text-slate-400 mt-1">{mockEvents.length} events</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all" />
      </motion.div>

      <div className="space-y-3">
        {filtered.map((event) => (
          <motion.div key={event.id} variants={itemVariants} className="glass rounded-xl p-5 border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">{event.title}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.startDate} to {event.endDate}</span>
                <span>{event.quests} quests</span>
                <span>{event.participants.toLocaleString()} participants</span>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize ${statusColors[event.status]}`}>
              {event.status}
            </span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"><Eye className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"><Edit className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
