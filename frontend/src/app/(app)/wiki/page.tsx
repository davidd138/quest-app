'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Mic,
  Swords,
  Users,
  Map,
  Award,
  ScrollText,
  Clock,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

interface Guide {
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readingTime: number;
  popular?: boolean;
}

const difficultyColors: Record<string, { badge: string; dot: string }> = {
  beginner: { badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-400' },
  intermediate: { badge: 'bg-amber-500/15 text-amber-400', dot: 'bg-amber-400' },
  advanced: { badge: 'bg-rose-500/15 text-rose-400', dot: 'bg-rose-400' },
};

const GUIDES: Guide[] = [
  {
    slug: 'voice-chat-tips',
    title: 'Voice Chat Tips',
    description: 'Master the art of voice conversations with AI characters. Learn tone, pacing, and how to unlock hidden dialogue.',
    category: 'Voice Chat Tips',
    icon: <Mic className="w-6 h-6" />,
    difficulty: 'beginner',
    readingTime: 5,
    popular: true,
  },
  {
    slug: 'challenge-strategies',
    title: 'Challenge Strategies',
    description: 'Proven strategies for tackling every challenge type from riddles to knowledge tests and conversation puzzles.',
    category: 'Challenge Strategies',
    icon: <Swords className="w-6 h-6" />,
    difficulty: 'intermediate',
    readingTime: 8,
    popular: true,
  },
  {
    slug: 'character-interaction',
    title: 'Character Interaction',
    description: 'Understand character personalities, backstories, and how your approach affects their responses and quest outcomes.',
    category: 'Character Interaction',
    icon: <Users className="w-6 h-6" />,
    difficulty: 'intermediate',
    readingTime: 7,
  },
  {
    slug: 'map-navigation',
    title: 'Map Navigation',
    description: 'Navigate the quest map like a pro. Tips on route planning, distance estimation, and finding hidden locations.',
    category: 'Map Navigation',
    icon: <Map className="w-6 h-6" />,
    difficulty: 'beginner',
    readingTime: 4,
    popular: true,
  },
  {
    slug: 'scoring-guide',
    title: 'Scoring Guide',
    description: 'How points are calculated, bonus multipliers, streak rewards, and tips to climb the leaderboard fast.',
    category: 'Scoring Guide',
    icon: <Award className="w-6 h-6" />,
    difficulty: 'advanced',
    readingTime: 10,
  },
  {
    slug: 'community-rules',
    title: 'Community Rules',
    description: 'Guidelines for creating community quests, participating in clans, and maintaining a positive gaming environment.',
    category: 'Community Rules',
    icon: <ScrollText className="w-6 h-6" />,
    difficulty: 'beginner',
    readingTime: 3,
  },
];

export default function WikiPage() {
  const [search, setSearch] = useState('');

  const filteredGuides = GUIDES.filter(
    (g) =>
      !search ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase())
  );

  const popularGuides = GUIDES.filter((g) => g.popular);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-violet-400" />
          <h1 className="font-heading text-3xl font-bold text-white">Quest Wiki</h1>
        </div>
        <p className="text-slate-400">Master every challenge with our comprehensive guides</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-xl"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guides..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25 transition-all"
        />
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Guide Grid */}
        <div className="lg:col-span-3">
          {filteredGuides.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-2 gap-4"
            >
              {filteredGuides.map((guide) => {
                const d = difficultyColors[guide.difficulty];
                return (
                  <motion.div key={guide.slug} variants={cardVariants}>
                    <Link href={`/wiki/${guide.slug}`}>
                      <div className="glass rounded-2xl p-6 group cursor-pointer border border-transparent hover:border-violet-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5 backdrop-blur-xl bg-white/[0.03]">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-emerald-500/10 flex items-center justify-center text-violet-400 group-hover:text-violet-300 transition-colors shrink-0">
                            {guide.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                              {guide.title}
                            </h3>
                            <p className="text-sm text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                              {guide.description}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${d.badge}`}>
                                {guide.difficulty}
                              </span>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {guide.readingTime} min read
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-16 text-center"
            >
              <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-semibold text-white mb-2">No guides found</h3>
              <p className="text-slate-400">Try adjusting your search to find relevant guides.</p>
            </motion.div>
          )}
        </div>

        {/* Popular Guides Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Most Popular
            </h2>
            <div className="glass rounded-2xl overflow-hidden divide-y divide-slate-700/30 backdrop-blur-xl bg-white/[0.03]">
              {popularGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/wiki/${guide.slug}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-violet-400 shrink-0">
                    {guide.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-violet-300 transition-colors truncate">
                      {guide.title}
                    </p>
                    <p className="text-xs text-slate-500">{guide.readingTime} min</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
