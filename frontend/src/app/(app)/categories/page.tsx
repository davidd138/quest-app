'use client';

import { useEffect, useState } from 'react';
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
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_QUESTS } from '@/lib/graphql/queries';
import type { Quest, QuestConnection } from '@/types';

// ---------- Category Config ----------

interface CategoryConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  hoverGlow: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'adventure',
    label: 'Adventure',
    description: 'Embark on thrilling expeditions through uncharted territories',
    icon: Compass,
    gradient: 'from-violet-600 to-indigo-600',
    hoverGlow: 'hover:shadow-violet-500/20',
  },
  {
    key: 'mystery',
    label: 'Mystery',
    description: 'Solve enigmatic puzzles and uncover hidden secrets',
    icon: Search,
    gradient: 'from-slate-600 to-zinc-600',
    hoverGlow: 'hover:shadow-slate-500/20',
  },
  {
    key: 'cultural',
    label: 'Cultural',
    description: 'Immerse yourself in rich traditions and heritage',
    icon: Landmark,
    gradient: 'from-amber-500 to-orange-500',
    hoverGlow: 'hover:shadow-amber-500/20',
  },
  {
    key: 'educational',
    label: 'Educational',
    description: 'Learn fascinating facts while exploring the world',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-cyan-500',
    hoverGlow: 'hover:shadow-blue-500/20',
  },
  {
    key: 'culinary',
    label: 'Culinary',
    description: 'Discover local flavors and gastronomic delights',
    icon: ChefHat,
    gradient: 'from-rose-500 to-pink-500',
    hoverGlow: 'hover:shadow-rose-500/20',
  },
  {
    key: 'nature',
    label: 'Nature',
    description: 'Connect with the natural world and its wonders',
    icon: TreePine,
    gradient: 'from-emerald-500 to-green-500',
    hoverGlow: 'hover:shadow-emerald-500/20',
  },
  {
    key: 'urban',
    label: 'Urban',
    description: 'Navigate city streets and discover urban gems',
    icon: Building2,
    gradient: 'from-gray-500 to-slate-600',
    hoverGlow: 'hover:shadow-gray-500/20',
  },
  {
    key: 'team_building',
    label: 'Team Building',
    description: 'Collaborate with others for group adventures',
    icon: Users,
    gradient: 'from-fuchsia-500 to-purple-600',
    hoverGlow: 'hover:shadow-fuchsia-500/20',
  },
];

// ---------- Animation Variants ----------

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1 },
};

// ---------- Components ----------

function CategoryCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-navy-800" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-1/2 bg-navy-800 rounded" />
        <div className="h-4 w-full bg-navy-800 rounded" />
        <div className="h-4 w-1/3 bg-navy-800 rounded" />
      </div>
    </div>
  );
}

function FeaturedQuestScroll({ quests }: { quests: Quest[] }) {
  if (quests.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {quests.map((quest) => (
        <Link
          key={quest.id}
          href={`/quests/${quest.id}`}
          className="flex-shrink-0 w-64"
        >
          <div className="glass rounded-xl overflow-hidden group hover:border-violet-500/30 border border-transparent transition-all">
            <div className="relative h-28 bg-gradient-to-br from-violet-600/20 via-navy-800 to-emerald-600/10">
              {quest.coverImageUrl ? (
                <img
                  src={quest.coverImageUrl}
                  alt={quest.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-violet-500/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
            </div>
            <div className="p-3">
              <h4 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-violet-300 transition-colors">
                {quest.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {quest.totalPoints} pts &middot; {quest.estimatedDuration} min
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ---------- Page ----------

export default function CategoriesPage() {
  const { data, loading, execute } = useQuery<QuestConnection>(LIST_QUESTS);
  const [questCounts, setQuestCounts] = useState<Record<string, number>>({});
  const [featuredQuests, setFeaturedQuests] = useState<Record<string, Quest[]>>({});

  useEffect(() => {
    execute({ limit: 200 });
  }, [execute]);

  useEffect(() => {
    if (!data?.items) return;

    const counts: Record<string, number> = {};
    const featured: Record<string, Quest[]> = {};

    for (const quest of data.items) {
      const cat = quest.category;
      counts[cat] = (counts[cat] || 0) + 1;
      if (!featured[cat]) featured[cat] = [];
      if (featured[cat].length < 5) featured[cat].push(quest);
    }

    setQuestCounts(counts);
    setFeaturedQuests(featured);
  }, [data]);

  const totalQuests = data?.items?.length || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-3xl font-bold text-white">All Categories</h1>
        <p className="text-slate-400 mt-1">
          Browse {totalQuests} quests across {CATEGORIES.length} categories
        </p>
      </motion.div>

      {/* Category Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = questCounts[cat.key] || 0;
            const featured = featuredQuests[cat.key] || [];

            return (
              <motion.div key={cat.key} variants={cardVariants} layout>
                <Link href={`/quests/category/${cat.key}`}>
                  <div
                    className={`glass rounded-2xl overflow-hidden group cursor-pointer border border-transparent hover:border-white/10 transition-all duration-300 hover:shadow-xl ${cat.hoverGlow}`}
                  >
                    {/* Gradient Header */}
                    <div className={`relative h-32 bg-gradient-to-br ${cat.gradient} overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-16 h-16 text-white/30 group-hover:text-white/50 transition-colors duration-300 group-hover:scale-110 transform" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-xs px-2.5 py-1 rounded-lg font-medium bg-black/30 text-white/90 backdrop-blur-sm">
                          {count} {count === 1 ? 'quest' : 'quests'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-heading text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                          {cat.label}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    </div>

                    {/* Featured Quest Preview */}
                    {featured.length > 0 && (
                      <div className="px-5 pb-5">
                        <div className="pt-3 border-t border-white/5">
                          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">
                            Featured
                          </p>
                          <p className="text-sm text-slate-300 line-clamp-1">
                            {featured[0].title}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Featured Quests Horizontal Scroll per Category */}
      {!loading && Object.keys(featuredQuests).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8 mt-4"
        >
          {CATEGORIES.filter((cat) => (featuredQuests[cat.key]?.length || 0) > 0).map((cat) => (
            <div key={cat.key}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
                    <cat.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-white">
                    {cat.label}
                  </h3>
                </div>
                <Link
                  href={`/quests/category/${cat.key}`}
                  className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <FeaturedQuestScroll quests={featuredQuests[cat.key]} />
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
