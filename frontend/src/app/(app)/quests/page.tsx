'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Compass,
  Clock,
  Zap,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_QUESTS } from '@/lib/graphql/queries';
import { QUEST_CATEGORIES, QUEST_DIFFICULTIES } from '@/lib/constants';
import type { Quest, QuestConnection } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

function QuestCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-navy-800" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-navy-800 rounded" />
        <div className="h-4 w-full bg-navy-800 rounded" />
        <div className="h-4 w-2/3 bg-navy-800 rounded" />
        <div className="flex gap-2 mt-4">
          <div className="h-6 w-16 bg-navy-800 rounded-lg" />
          <div className="h-6 w-16 bg-navy-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
  const diffColors: Record<string, { badge: string; dot: string }> = {
    easy: { badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-400' },
    medium: { badge: 'bg-amber-500/15 text-amber-400', dot: 'bg-amber-400' },
    hard: { badge: 'bg-rose-500/15 text-rose-400', dot: 'bg-rose-400' },
    legendary: { badge: 'bg-violet-500/15 text-violet-400', dot: 'bg-violet-400' },
  };

  const d = diffColors[quest.difficulty] || diffColors.easy;

  const categoryLabel = quest.category.replace(/_/g, ' ');

  return (
    <motion.div variants={cardVariants} layout>
      <Link href={`/quests/${quest.id}`}>
        <div className="glass rounded-2xl overflow-hidden group cursor-pointer border border-transparent hover:border-violet-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5">
          {/* Cover */}
          <div className="relative h-44 bg-gradient-to-br from-violet-600/20 via-navy-800 to-emerald-600/10 overflow-hidden">
            {quest.coverImageUrl ? (
              <img
                src={quest.coverImageUrl}
                alt={quest.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Compass className="w-16 h-16 text-violet-500/20 group-hover:text-violet-500/30 transition-colors" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
            <div className="absolute top-3 right-3">
              <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${d.badge}`}>
                {quest.difficulty}
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="text-xs text-slate-300 capitalize bg-navy-900/60 px-2 py-1 rounded-lg backdrop-blur-sm">
                {categoryLabel}
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1 bg-navy-900/60 px-2 py-1 rounded-lg backdrop-blur-sm">
                <MapPin className="w-3 h-3" />
                {quest.location?.name || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-heading text-lg font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
              {quest.title}
            </h3>
            <p className="text-sm text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              {quest.description}
            </p>

            <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-violet-400" />
                {quest.totalPoints} pts
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                {quest.estimatedDuration} min
              </span>
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                {quest.stages?.length || 0} stages
              </span>
            </div>

            {quest.tags && quest.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {quest.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded bg-navy-800/50 text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function QuestsPage() {
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [search, setSearch] = useState('');
  const { data, loading, error, execute } = useQuery<QuestConnection>(LIST_QUESTS);

  const fetchQuests = useCallback(() => {
    const vars: Record<string, string | number> = { limit: 50 };
    if (category) vars.category = category;
    if (difficulty) vars.difficulty = difficulty;
    execute(vars).catch(() => {});
  }, [category, difficulty, execute]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const filteredQuests =
    data?.items?.filter((q) =>
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase())
    ) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-3xl font-bold text-white">Quest Catalog</h1>
        <p className="text-slate-400 mt-1">Discover and embark on new adventures</p>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quests..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none w-full md:w-44 pl-4 pr-10 py-2.5 rounded-xl bg-navy-800/50 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 cursor-pointer"
          >
            <option value="">All Categories</option>
            {QUEST_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Difficulty Filter */}
        <div className="relative">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="appearance-none w-full md:w-36 pl-4 pr-10 py-2.5 rounded-xl bg-navy-800/50 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 cursor-pointer"
          >
            <option value="">All Difficulties</option>
            {QUEST_DIFFICULTIES.map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="glass rounded-xl p-6 border border-rose-500/30 bg-rose-500/5">
          <p className="text-rose-400 font-medium">Error loading quests</p>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
          <button onClick={fetchQuests} className="mt-3 px-4 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Quest Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <QuestCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredQuests.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-16 text-center"
        >
          <Compass className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold text-white mb-2">No quests found</h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            {search || category || difficulty
              ? 'Try adjusting your filters to find more quests.'
              : 'No quests are available at the moment. Check back soon!'}
          </p>
          {(search || category || difficulty) && (
            <button
              onClick={() => {
                setSearch('');
                setCategory('');
                setDifficulty('');
              }}
              className="mt-6 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
