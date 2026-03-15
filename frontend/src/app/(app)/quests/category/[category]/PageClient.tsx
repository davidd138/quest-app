'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Search,
  Landmark,
  GraduationCap,
  ChefHat,
  TreePine,
  Building2,
  Users,
  Clock,
  Zap,
  MapPin,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_QUESTS } from '@/lib/graphql/queries';
import { QUEST_DIFFICULTIES } from '@/lib/constants';
import type { Quest, QuestConnection, QuestDifficulty } from '@/types';

// ---------- Category Meta ----------

interface CategoryMeta {
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  adventure: {
    label: 'Adventure',
    description: 'Embark on thrilling expeditions through uncharted territories',
    icon: Compass,
    gradient: 'from-violet-600 to-indigo-600',
  },
  mystery: {
    label: 'Mystery',
    description: 'Solve enigmatic puzzles and uncover hidden secrets',
    icon: Search,
    gradient: 'from-slate-600 to-zinc-600',
  },
  cultural: {
    label: 'Cultural',
    description: 'Immerse yourself in rich traditions and heritage',
    icon: Landmark,
    gradient: 'from-amber-500 to-orange-500',
  },
  educational: {
    label: 'Educational',
    description: 'Learn fascinating facts while exploring the world',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-cyan-500',
  },
  culinary: {
    label: 'Culinary',
    description: 'Discover local flavors and gastronomic delights',
    icon: ChefHat,
    gradient: 'from-rose-500 to-pink-500',
  },
  nature: {
    label: 'Nature',
    description: 'Connect with the natural world and its wonders',
    icon: TreePine,
    gradient: 'from-emerald-500 to-green-500',
  },
  urban: {
    label: 'Urban',
    description: 'Navigate city streets and discover urban gems',
    icon: Building2,
    gradient: 'from-gray-500 to-slate-600',
  },
  team_building: {
    label: 'Team Building',
    description: 'Collaborate with others for group adventures',
    icon: Users,
    gradient: 'from-fuchsia-500 to-purple-600',
  },
};

type SortOption = 'newest' | 'rating' | 'difficulty' | 'duration';

// ---------- Animation Variants ----------

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

// ---------- Components ----------

function QuestCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-navy-800" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-navy-800 rounded" />
        <div className="h-4 w-full bg-navy-800 rounded" />
        <div className="h-4 w-2/3 bg-navy-800 rounded" />
      </div>
    </div>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
  const diffColors: Record<string, { badge: string }> = {
    easy: { badge: 'bg-emerald-500/15 text-emerald-400' },
    medium: { badge: 'bg-amber-500/15 text-amber-400' },
    hard: { badge: 'bg-rose-500/15 text-rose-400' },
    legendary: { badge: 'bg-violet-500/15 text-violet-400' },
  };

  const d = diffColors[quest.difficulty] || diffColors.easy;

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
            <div className="absolute bottom-3 left-3">
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

// ---------- Page Client ----------

interface Props {
  category: string;
}

const DIFFICULTY_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2, legendary: 3 };

export default function CategoryPageClient({ category }: Props) {
  const meta = CATEGORY_META[category];
  const [difficulty, setDifficulty] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const { data, loading, execute } = useQuery<QuestConnection>(LIST_QUESTS);

  const fetchQuests = useCallback(() => {
    const vars: Record<string, string | number> = { limit: 100, category };
    if (difficulty) vars.difficulty = difficulty;
    execute(vars);
  }, [category, difficulty, execute]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const sortedQuests = (() => {
    const quests = data?.items || [];
    const sorted = [...quests];

    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        sorted.sort((a, b) => b.totalPoints - a.totalPoints);
        break;
      case 'difficulty':
        sorted.sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0));
        break;
      case 'duration':
        sorted.sort((a, b) => a.estimatedDuration - b.estimatedDuration);
        break;
    }

    return sorted;
  })();

  const Icon = meta?.icon || Compass;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/categories"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Categories
      </Link>

      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl overflow-hidden bg-gradient-to-br ${meta?.gradient || 'from-violet-600 to-indigo-600'} p-8 relative`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <Icon className="absolute right-8 top-1/2 -translate-y-1/2 w-24 h-24 text-white/10" />
        <div className="relative">
          <h1 className="font-heading text-3xl font-bold text-white">
            {meta?.label || category.replace(/_/g, ' ')}
          </h1>
          <p className="text-white/70 mt-2 max-w-lg">
            {meta?.description || `Explore quests in the ${category} category`}
          </p>
          <p className="text-white/50 text-sm mt-3">
            {sortedQuests.length} {sortedQuests.length === 1 ? 'quest' : 'quests'} available
          </p>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3"
      >
        {/* Difficulty Sub-filter */}
        <div className="relative flex-1">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="appearance-none w-full pl-4 pr-10 py-2.5 rounded-xl bg-navy-800/50 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 cursor-pointer"
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

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none w-full sm:w-44 pl-4 pr-10 py-2.5 rounded-xl bg-navy-800/50 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="rating">Highest Points</option>
            <option value="difficulty">By Difficulty</option>
            <option value="duration">By Duration</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </motion.div>

      {/* Quest Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <QuestCardSkeleton key={i} />
          ))}
        </div>
      ) : sortedQuests.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {sortedQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-16 text-center"
        >
          <Icon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold text-white mb-2">
            No quests found
          </h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            {difficulty
              ? 'Try adjusting your difficulty filter to find more quests.'
              : `No quests are available in the ${meta?.label || category} category yet.`}
          </p>
          {difficulty && (
            <button
              onClick={() => setDifficulty('')}
              className="mt-6 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              Clear Filter
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
