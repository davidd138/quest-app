'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Clock, Zap, MapPin, Star, ArrowRight } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const difficultyColors: Record<string, string> = {
  easy: 'text-emerald-400 bg-emerald-500/15',
  medium: 'text-amber-400 bg-amber-500/15',
  hard: 'text-rose-400 bg-rose-500/15',
  legendary: 'text-violet-400 bg-violet-500/15',
};

const newQuests = [
  { id: 'nq1', title: 'Harbor Mysteries', description: 'Uncover the secrets of the old port district.', category: 'Mystery', difficulty: 'medium', points: 450, duration: 45, location: 'Port District', addedDaysAgo: 1 },
  { id: 'nq2', title: 'Artisan Trail', description: 'Visit local artisans and learn their crafts.', category: 'Cultural', difficulty: 'easy', points: 250, duration: 30, location: 'Old Town', addedDaysAgo: 2 },
  { id: 'nq3', title: 'Night Watch', description: 'Patrol the ancient walls under the stars.', category: 'Adventure', difficulty: 'hard', points: 700, duration: 60, location: 'City Walls', addedDaysAgo: 3 },
  { id: 'nq4', title: 'Spice Market Challenge', description: 'Navigate the bustling market and identify rare ingredients.', category: 'Culinary', difficulty: 'medium', points: 350, duration: 35, location: 'Central Market', addedDaysAgo: 4 },
  { id: 'nq5', title: 'The Forgotten Library', description: 'Explore a hidden underground library beneath the university.', category: 'Educational', difficulty: 'legendary', points: 1200, duration: 90, location: 'University Quarter', addedDaysAgo: 5 },
  { id: 'nq6', title: 'River Walk Expedition', description: 'Follow the river trail through scenic landscapes.', category: 'Nature', difficulty: 'easy', points: 200, duration: 25, location: 'Riverside', addedDaysAgo: 6 },
];

export default function NewArrivalsPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-amber-400" />
          New Arrivals
        </h1>
        <p className="text-slate-400 mt-1">Freshly published quests waiting to be explored</p>
      </motion.div>

      <div className="space-y-4">
        {newQuests.map((quest) => (
          <motion.div key={quest.id} variants={itemVariants}>
            <Link href={`/quests/${quest.id}`}>
              <div className="glass rounded-2xl p-6 border border-white/5 hover:border-violet-500/20 transition-all group">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600/20 via-navy-800 to-emerald-600/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-7 h-7 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-white text-lg group-hover:text-violet-400 transition-colors">{quest.title}</h3>
                      {quest.addedDaysAgo <= 2 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">New</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{quest.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className={`px-2 py-0.5 rounded-lg font-medium capitalize ${difficultyColors[quest.difficulty]}`}>{quest.difficulty}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{quest.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{quest.duration} min</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" />{quest.category}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="font-heading font-bold text-white text-lg">{quest.points}</span>
                    </div>
                    <p className="text-xs text-slate-500">{quest.addedDaysAgo}d ago</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
