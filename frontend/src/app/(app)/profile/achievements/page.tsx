'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Star, Lock, Filter } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  earned: boolean;
  earnedAt?: string;
  progress: number;
  total: number;
}

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
  Common: { bg: 'bg-slate-500/15', border: 'border-slate-500/30', text: 'text-slate-400' },
  Rare: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400' },
  Epic: { bg: 'bg-violet-500/15', border: 'border-violet-500/30', text: 'text-violet-400' },
  Legendary: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400' },
};

const mockAchievements: Achievement[] = [
  { id: 'a1', title: 'First Steps', description: 'Complete your first quest', rarity: 'Common', earned: true, earnedAt: '2025-09-01', progress: 1, total: 1 },
  { id: 'a2', title: 'Explorer', description: 'Complete 10 quests', rarity: 'Rare', earned: true, earnedAt: '2025-11-15', progress: 10, total: 10 },
  { id: 'a3', title: 'Quest Master', description: 'Complete 50 quests', rarity: 'Legendary', earned: true, earnedAt: '2026-03-10', progress: 50, total: 50 },
  { id: 'a4', title: 'Social Butterfly', description: 'Add 20 friends', rarity: 'Rare', earned: false, progress: 12, total: 20 },
  { id: 'a5', title: 'Speed Runner', description: 'Complete 5 quests under par time', rarity: 'Epic', earned: false, progress: 3, total: 5 },
  { id: 'a6', title: 'Perfect Score', description: 'Get 100% on all stages of a quest', rarity: 'Epic', earned: true, earnedAt: '2026-02-20', progress: 1, total: 1 },
  { id: 'a7', title: 'Clan Founder', description: 'Create a clan', rarity: 'Rare', earned: false, progress: 0, total: 1 },
  { id: 'a8', title: 'Night Owl', description: 'Complete a quest after midnight', rarity: 'Common', earned: true, earnedAt: '2025-10-31', progress: 1, total: 1 },
];

export default function ProfileAchievementsPage() {
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const earned = mockAchievements.filter((a) => a.earned).length;
  const filtered = mockAchievements.filter((a) => filter === 'all' || (filter === 'earned' ? a.earned : !a.earned));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            My Achievements
          </h1>
          <p className="text-slate-400 mt-1">{earned} of {mockAchievements.length} earned</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl glass border border-white/10">
          {(['all', 'earned', 'locked'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-violet-500/20 text-violet-400' : 'text-slate-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((achievement) => {
          const colors = rarityColors[achievement.rarity];
          return (
            <motion.div key={achievement.id} variants={itemVariants}>
              <Link href={`/achievements/${achievement.id}`}>
                <div className={`glass rounded-xl p-5 border transition-all hover:scale-[1.02] ${achievement.earned ? colors.border : 'border-white/5 opacity-60'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${achievement.earned ? colors.bg : 'bg-slate-800'}`}>
                      {achievement.earned ? <Trophy className={`w-6 h-6 ${colors.text}`} /> : <Lock className="w-6 h-6 text-slate-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{achievement.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{achievement.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} font-medium`}>{achievement.rarity}</span>
                        {!achievement.earned && (
                          <span className="text-xs text-slate-500">{achievement.progress}/{achievement.total}</span>
                        )}
                      </div>
                      {!achievement.earned && (
                        <div className="w-full h-1.5 rounded-full bg-navy-800 overflow-hidden mt-2">
                          <div className="h-full rounded-full bg-violet-500/50" style={{ width: `${(achievement.progress / achievement.total) * 100}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
