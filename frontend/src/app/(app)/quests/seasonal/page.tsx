'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Snowflake, Sun, Leaf, Flower2, Clock, Zap, Star } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const seasons = [
  { name: 'Spring', icon: Flower2, gradient: 'from-emerald-600/20 to-pink-600/20', border: 'border-emerald-500/30', active: true, quests: 12, endDate: '2026-06-20' },
  { name: 'Summer', icon: Sun, gradient: 'from-amber-600/20 to-orange-600/20', border: 'border-amber-500/30', active: false, quests: 15, endDate: '2026-09-22' },
  { name: 'Autumn', icon: Leaf, gradient: 'from-orange-600/20 to-rose-600/20', border: 'border-orange-500/30', active: false, quests: 10, endDate: '2026-12-21' },
  { name: 'Winter', icon: Snowflake, gradient: 'from-blue-600/20 to-cyan-600/20', border: 'border-blue-500/30', active: false, quests: 8, endDate: '2027-03-20' },
];

const springQuests = [
  { id: 'sq1', title: 'Cherry Blossom Trail', difficulty: 'Easy', points: 200, category: 'Nature' },
  { id: 'sq2', title: 'Garden of Wonders', difficulty: 'Medium', points: 400, category: 'Exploration' },
  { id: 'sq3', title: 'The Pollinator Mystery', difficulty: 'Hard', points: 600, category: 'Mystery' },
  { id: 'sq4', title: 'Rain Dance Ritual', difficulty: 'Medium', points: 350, category: 'Cultural' },
  { id: 'sq5', title: 'Farmers Market Quest', difficulty: 'Easy', points: 150, category: 'Culinary' },
];

export default function SeasonalQuestsPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">Seasonal Quests</h1>
        <p className="text-slate-400">Limited-time quests that change with the seasons</p>
      </motion.div>

      {/* Season selector */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {seasons.map((season) => {
          const Icon = season.icon;
          return (
            <div
              key={season.name}
              className={`glass rounded-xl p-4 text-center border cursor-pointer transition-all ${
                season.active ? `${season.border} shadow-lg` : 'border-white/5 opacity-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${season.gradient} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="font-heading font-semibold text-white text-sm">{season.name}</p>
              <p className="text-xs text-slate-500">{season.quests} quests</p>
              {season.active && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
                  Active
                </span>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Current season quests */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-emerald-400" />
            Spring 2026 Quests
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            Ends June 20, 2026
          </div>
        </div>

        <div className="space-y-3">
          {springQuests.map((quest) => (
            <Link key={quest.id} href={`/quests/${quest.id}`}>
              <div className="glass rounded-xl p-5 border border-white/5 hover:border-emerald-500/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600/20 to-pink-600/10 flex items-center justify-center flex-shrink-0">
                    <Flower2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white group-hover:text-emerald-400 transition-colors">{quest.title}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{quest.category}</span>
                      <span>{quest.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-heading font-bold text-white">{quest.points}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
