'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Zap, Trophy, Ticket } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const mockEvent = {
  id: 'e1',
  title: 'Spring Quest Festival',
  description: 'A week-long celebration of adventure! Complete special quests, earn double points, and compete for exclusive seasonal rewards.',
  bannerGradient: 'from-emerald-600/30 via-violet-600/20 to-amber-600/30',
  startDate: '2026-03-20',
  endDate: '2026-03-27',
  location: 'Global',
  participants: 1842,
  maxParticipants: 5000,
  rewards: [
    { name: 'Spring Explorer Badge', type: 'Badge', rarity: 'Epic' },
    { name: '500 Bonus Points', type: 'Points', rarity: 'Common' },
    { name: 'Cherry Blossom Avatar Frame', type: 'Cosmetic', rarity: 'Legendary' },
  ],
  quests: [
    { title: 'Bloom Trail', difficulty: 'Easy', points: 200 },
    { title: 'Garden Labyrinth', difficulty: 'Medium', points: 400 },
    { title: 'Temple of Seasons', difficulty: 'Hard', points: 800 },
  ],
};

export default function PageClient({ id }: { id: string }) {
  const daysUntilStart = Math.max(0, Math.ceil((new Date(mockEvent.startDate).getTime() - Date.now()) / 86400000));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <Link href="/events" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
      </motion.div>

      {/* Banner */}
      <motion.div variants={itemVariants} className={`rounded-2xl overflow-hidden relative h-48 md:h-64 bg-gradient-to-r ${mockEvent.bannerGradient}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Calendar className="w-24 h-24 text-white/10" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-navy-950 to-transparent">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">{mockEvent.title}</h1>
        </div>
      </motion.div>

      {/* Info bar */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center border border-white/5">
          <Calendar className="w-5 h-5 text-violet-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-white">{mockEvent.startDate}</p>
          <p className="text-xs text-slate-500">Start Date</p>
        </div>
        <div className="glass rounded-xl p-4 text-center border border-white/5">
          <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-white">{daysUntilStart > 0 ? `${daysUntilStart} days` : 'Live!'}</p>
          <p className="text-xs text-slate-500">{daysUntilStart > 0 ? 'Until Start' : 'Status'}</p>
        </div>
        <div className="glass rounded-xl p-4 text-center border border-white/5">
          <MapPin className="w-5 h-5 text-rose-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-white">{mockEvent.location}</p>
          <p className="text-xs text-slate-500">Location</p>
        </div>
        <div className="glass rounded-xl p-4 text-center border border-white/5">
          <Users className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-white">{mockEvent.participants.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Participants</p>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div variants={itemVariants} className="glass rounded-xl p-6 border border-white/5">
        <p className="text-slate-300 leading-relaxed">{mockEvent.description}</p>
      </motion.div>

      {/* Event quests */}
      <motion.div variants={itemVariants}>
        <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-violet-400" />
          Event Quests
        </h2>
        <div className="space-y-2">
          {mockEvent.quests.map((quest, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-4 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <span className="text-sm font-bold text-violet-400">{i + 1}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{quest.title}</p>
                <p className="text-xs text-slate-500">{quest.difficulty}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-sm font-bold text-white">{quest.points}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Rewards */}
      <motion.div variants={itemVariants}>
        <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Rewards
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {mockEvent.rewards.map((reward, i) => (
            <div key={i} className="glass rounded-xl p-4 border border-white/5 text-center">
              <Ticket className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">{reward.name}</p>
              <p className="text-xs text-slate-500">{reward.rarity} {reward.type}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Register */}
      <motion.div variants={itemVariants} className="flex justify-center pb-8">
        <button className="px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-lg transition-all shadow-xl shadow-violet-600/25 flex items-center gap-3">
          <Ticket className="w-5 h-5" />
          Register for Event
        </button>
      </motion.div>
    </motion.div>
  );
}
