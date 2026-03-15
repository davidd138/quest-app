'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Flame,
  Zap,
  Clock,
  Star,
  Compass,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_QUESTS } from '@/lib/graphql/queries';
import type { Quest, QuestConnection } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// Simulated trending data
interface TrendingQuest {
  quest: Quest;
  playsLast7d: number;
  playsGrowth: number; // percentage growth
  chartData: number[]; // 7 data points for the mini chart
}

function generateTrendingData(quests: Quest[]): TrendingQuest[] {
  return quests.map((quest, i) => {
    const base = Math.floor(Math.random() * 500) + 100;
    const growth = Math.floor(Math.random() * 200) - 30;
    const chartData = Array.from({ length: 7 }, (_, j) => {
      const trend = growth > 0 ? j * (growth / 7) : 0;
      return Math.max(0, base + Math.floor(trend) + Math.floor(Math.random() * 50 - 25));
    });
    return {
      quest,
      playsLast7d: chartData.reduce((a, b) => a + b, 0),
      playsGrowth: growth,
      chartData,
    };
  });
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((value, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full ${color} transition-all`}
          style={{
            height: `${Math.max(15, ((value - min) / range) * 100)}%`,
            opacity: 0.4 + (i / data.length) * 0.6,
          }}
        />
      ))}
    </div>
  );
}

function TrendingCard({
  item,
  rank,
}: {
  item: TrendingQuest;
  rank: number;
}) {
  const quest = item.quest;
  const isTop3 = rank <= 3;

  const diffColors: Record<string, string> = {
    easy: 'bg-emerald-500/15 text-emerald-400',
    medium: 'bg-amber-500/15 text-amber-400',
    hard: 'bg-rose-500/15 text-rose-400',
    legendary: 'bg-violet-500/15 text-violet-400',
  };

  return (
    <motion.div variants={itemVariants} layout>
      <Link href={`/quests/${quest.id}`}>
        <div
          className={`glass rounded-2xl overflow-hidden group cursor-pointer border transition-all duration-300 hover:shadow-xl ${
            isTop3
              ? 'border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/5'
              : 'border-transparent hover:border-violet-500/20 hover:shadow-violet-500/5'
          }`}
        >
          {/* Cover */}
          <div className="relative h-40 bg-gradient-to-br from-violet-600/20 via-navy-800 to-emerald-600/10 overflow-hidden">
            {quest.coverImageUrl ? (
              <img
                src={quest.coverImageUrl}
                alt={quest.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Compass className="w-14 h-14 text-violet-500/20 group-hover:text-violet-500/30 transition-colors" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />

            {/* Rank badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                  isTop3
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-navy-900/70 backdrop-blur-sm text-slate-300'
                }`}
              >
                #{rank}
              </span>
            </div>

            {/* Hot badge */}
            {isTop3 && (
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Flame size={12} />
                  HOT
                </span>
              </div>
            )}

            {/* Difficulty */}
            {!isTop3 && (
              <div className="absolute top-3 right-3">
                <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${diffColors[quest.difficulty] || ''}`}>
                  {quest.difficulty}
                </span>
              </div>
            )}

            {/* Mini chart overlay */}
            <div className="absolute bottom-3 right-3">
              <MiniChart
                data={item.chartData}
                color={item.playsGrowth > 0 ? 'bg-emerald-400' : 'bg-slate-500'}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-heading text-lg font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
              {quest.title}
            </h3>
            <p className="text-sm text-slate-400 mt-1 line-clamp-1 leading-relaxed">
              {quest.description}
            </p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Zap size={12} className="text-violet-400" />
                  {quest.totalPoints} pts
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-emerald-400" />
                  {quest.estimatedDuration}m
                </span>
                {quest.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {quest.location.name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs font-medium">
                <span className="text-slate-400">
                  {item.playsLast7d.toLocaleString()} plays
                </span>
                <span
                  className={`flex items-center gap-0.5 ${
                    item.playsGrowth > 0 ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {item.playsGrowth > 0 && <ArrowUpRight size={11} />}
                  {item.playsGrowth > 0 ? '+' : ''}
                  {item.playsGrowth}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CategoryBreakdown({ trendingItems }: { trendingItems: TrendingQuest[] }) {
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    trendingItems.forEach((item) => {
      const cat = item.quest.category;
      counts[cat] = (counts[cat] || 0) + item.playsLast7d;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [trendingItems]);

  const maxPlays = categories[0]?.[1] || 1;

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-heading text-base font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 size={16} className="text-violet-400" />
        Category Breakdown
      </h3>
      <div className="space-y-3">
        {categories.map(([category, plays]) => (
          <div key={category}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 capitalize">{category.replace(/_/g, ' ')}</span>
              <span className="text-slate-500">{plays.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(plays / maxPlays) * 100}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrendingPage() {
  const { data, loading, execute } = useQuery<QuestConnection>(LIST_QUESTS);
  const [trendingData, setTrendingData] = useState<TrendingQuest[]>([]);

  const fetchQuests = useCallback(() => {
    execute({ limit: 20 });
  }, [execute]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  useEffect(() => {
    if (data?.items) {
      const trending = generateTrendingData(data.items);
      trending.sort((a, b) => b.playsLast7d - a.playsLast7d);
      setTrendingData(trending);
    }
  }, [data]);

  const risingQuests = useMemo(
    () =>
      [...trendingData]
        .filter((t) => t.playsGrowth > 50)
        .sort((a, b) => b.playsGrowth - a.playsGrowth)
        .slice(0, 4),
    [trendingData],
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-emerald-400" />
          Trending Quests
        </h1>
        <p className="text-slate-400 mt-1">
          Most popular quests in the last 7 days
        </p>
      </motion.div>

      {/* Rising section */}
      {risingQuests.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Flame size={18} className="text-amber-400" />
            <h2 className="font-heading text-xl font-bold text-white">Rising Fast</h2>
            <span className="text-xs text-slate-500">Fastest growing quests</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {risingQuests.map((item, i) => (
              <Link key={item.quest.id} href={`/quests/${item.quest.id}`}>
                <div className="glass rounded-xl p-4 min-w-[240px] max-w-[260px] border border-amber-500/15 hover:border-amber-500/30 transition-all group cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <ArrowUpRight size={12} />
                      +{item.playsGrowth}% growth
                    </span>
                    <MiniChart data={item.chartData} color="bg-amber-400" />
                  </div>
                  <h4 className="font-heading font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                    {item.quest.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.playsLast7d.toLocaleString()} plays this week
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-40 bg-navy-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-3/4 bg-navy-800 rounded" />
                    <div className="h-4 w-full bg-navy-800 rounded" />
                    <div className="flex gap-2">
                      <div className="h-4 w-16 bg-navy-800 rounded-lg" />
                      <div className="h-4 w-16 bg-navy-800 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : trendingData.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {trendingData.map((item, i) => (
                <TrendingCard key={item.quest.id} item={item} rank={i + 1} />
              ))}
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-16 text-center">
              <TrendingUp className="w-14 h-14 text-slate-600 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-semibold text-white mb-2">
                No trending data yet
              </h3>
              <p className="text-slate-400">
                Check back later to see which quests are trending.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {trendingData.length > 0 && (
            <CategoryBreakdown trendingItems={trendingData} />
          )}

          {/* Links */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-heading text-base font-semibold text-white mb-3">Explore</h3>
            <div className="space-y-1">
              {[
                { label: 'All Quests', href: '/quests' },
                { label: 'Discover', href: '/discover' },
                { label: 'Leaderboard', href: '/leaderboard' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {link.label}
                  <ChevronRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
