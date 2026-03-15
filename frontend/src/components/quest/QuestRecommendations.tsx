'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  Users,
  Star,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight,
  Heart,
  Compass,
  Flame,
  Target,
  Brain,
} from 'lucide-react';
import type { QuestCategory, QuestDifficulty } from '@/types';

// ---------- Types ----------

interface RecommendedQuest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  coverGradient: string;
  points: number;
  duration: number;
  rating: number;
  playCount: number;
  enjoymentScore?: number;
  suggestedDifficulty?: string;
  friendsPlaying?: string[];
}

// ---------- Mock Data ----------

const playStyleQuests: RecommendedQuest[] = [
  { id: 'r1', title: 'Shadow of the Colosseum', description: 'Unravel the mystery of disappeared gladiators in ancient ruins', category: 'mystery', difficulty: 'hard', coverGradient: 'from-violet-600/40 to-rose-600/30', points: 920, duration: 95, rating: 4.9, playCount: 284, enjoymentScore: 96, suggestedDifficulty: 'Perfect for you' },
  { id: 'r2', title: 'Whispering Gardens', description: 'A peaceful nature quest through enchanted botanical wonders', category: 'nature', difficulty: 'easy', coverGradient: 'from-emerald-600/40 to-teal-600/30', points: 380, duration: 35, rating: 4.6, playCount: 1102, enjoymentScore: 91 },
  { id: 'r3', title: 'The Cipher\'s Edge', description: 'Crack codes and decode messages in this cerebral adventure', category: 'educational', difficulty: 'legendary', coverGradient: 'from-amber-600/40 to-orange-600/30', points: 1350, duration: 130, rating: 4.8, playCount: 89, enjoymentScore: 94, suggestedDifficulty: 'A challenge awaits' },
  { id: 'r4', title: 'Street Art Safari', description: 'Discover hidden murals and meet the artists behind them', category: 'cultural', difficulty: 'medium', coverGradient: 'from-cyan-600/40 to-blue-600/30', points: 520, duration: 55, rating: 4.4, playCount: 678, enjoymentScore: 88 },
];

const trendingQuests: RecommendedQuest[] = [
  { id: 't1', title: 'Midnight Express', description: 'Race against time in the most thrilling urban quest', category: 'adventure', difficulty: 'hard', coverGradient: 'from-rose-600/40 to-pink-600/30', points: 880, duration: 80, rating: 4.7, playCount: 2341 },
  { id: 't2', title: 'Taste of Tradition', description: 'A culinary journey through centuries of flavor', category: 'culinary', difficulty: 'easy', coverGradient: 'from-orange-600/40 to-amber-600/30', points: 420, duration: 50, rating: 4.5, playCount: 1890 },
  { id: 't3', title: 'The Last Alchemist', description: 'Combine ingredients of knowledge to create the philosopher\'s stone', category: 'educational', difficulty: 'legendary', coverGradient: 'from-purple-600/40 to-indigo-600/30', points: 1500, duration: 140, rating: 5.0, playCount: 567 },
];

const friendsPlayingQuests: RecommendedQuest[] = [
  { id: 'f1', title: 'Team Labyrinth', description: 'Navigate the ultimate team challenge maze', category: 'team_building', difficulty: 'medium', coverGradient: 'from-fuchsia-600/40 to-violet-600/30', points: 650, duration: 70, rating: 4.6, playCount: 432, friendsPlaying: ['Elena V.', 'Marcus C.', 'Sofia R.'] },
  { id: 'f2', title: 'Treasure of Sierra Madre', description: 'A classic treasure hunt across mountain trails', category: 'adventure', difficulty: 'hard', coverGradient: 'from-emerald-600/40 to-green-600/30', points: 950, duration: 110, rating: 4.8, playCount: 213, friendsPlaying: ['James W.', 'Aiko T.'] },
  { id: 'f3', title: 'Puzzle Palace', description: 'Can you outsmart the palace\'s ancient riddles?', category: 'mystery', difficulty: 'medium', coverGradient: 'from-indigo-600/40 to-blue-600/30', points: 600, duration: 65, rating: 4.3, playCount: 891, friendsPlaying: ['Elena V.'] },
];

// ---------- Helpers ----------

const difficultyColors: Record<QuestDifficulty, string> = {
  easy: 'bg-emerald-500/20 text-emerald-400',
  medium: 'bg-amber-500/20 text-amber-400',
  hard: 'bg-rose-500/20 text-rose-400',
  legendary: 'bg-violet-500/20 text-violet-400',
};

// ---------- Carousel ----------

function SwipeCarousel({ quests, sectionId }: { quests: RecommendedQuest[]; sectionId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const scrollAmount = 300;
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative group">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass border border-white/15 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-xl hover:bg-white/10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass border border-white/15 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-xl hover:bg-white/10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide scroll-smooth"
      >
        {quests.map((quest, i) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="flex-shrink-0 w-[280px]"
          >
            <Link href={`/quests/${quest.id}`}>
              <div className="glass rounded-2xl border border-white/10 overflow-hidden group/card cursor-pointer hover:border-violet-500/30 transition-all duration-300">
                {/* Cover */}
                <div className={`h-36 bg-gradient-to-br ${quest.coverGradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Compass className="w-16 h-16 text-white/10" />
                  </div>
                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
                    <Star size={12} className="text-amber-400" fill="currentColor" />
                    <span className="text-xs font-semibold text-white">{quest.rating}</span>
                  </div>
                  {/* Difficulty */}
                  <div className="absolute bottom-3 left-3">
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-semibold ${difficultyColors[quest.difficulty]}`}>
                      {quest.difficulty}
                    </span>
                  </div>
                  {/* Enjoyment score */}
                  {quest.enjoymentScore && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
                      <Heart size={10} className="text-emerald-400" fill="currentColor" />
                      <span className="text-[10px] font-bold text-emerald-300">{quest.enjoymentScore}%</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-heading font-semibold text-white group-hover/card:text-violet-300 transition-colors truncate mb-1">
                    {quest.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {quest.description}
                  </p>

                  {/* Suggested difficulty tag */}
                  {quest.suggestedDifficulty && (
                    <div className="flex items-center gap-1.5 mb-3 text-xs text-violet-400">
                      <Brain className="w-3 h-3" />
                      <span className="font-medium">{quest.suggestedDifficulty}</span>
                    </div>
                  )}

                  {/* Friends playing */}
                  {quest.friendsPlaying && quest.friendsPlaying.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex -space-x-1.5">
                        {quest.friendsPlaying.slice(0, 3).map((friend, j) => (
                          <div
                            key={j}
                            className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 border border-navy-900 flex items-center justify-center text-[8px] font-bold text-white"
                          >
                            {friend[0]}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {quest.friendsPlaying.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Zap size={10} />{quest.points}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock size={10} />{quest.duration}m
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Users size={10} />{quest.playCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------- Section Header ----------

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  iconColor,
  iconBg,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <h3 className="font-heading font-bold text-white text-lg">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

// ---------- Main Component ----------

export default function QuestRecommendations() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      {/* Based on your play style */}
      <section>
        <SectionHeader
          icon={Brain}
          title="Based on Your Play Style"
          subtitle="AI-curated quests matching your preferences"
          iconColor="text-violet-400"
          iconBg="bg-violet-500/15"
        />
        <SwipeCarousel quests={playStyleQuests} sectionId="playstyle" />
      </section>

      {/* Trending */}
      <section>
        <SectionHeader
          icon={TrendingUp}
          title="Trending Quests"
          subtitle="Most popular this week"
          iconColor="text-rose-400"
          iconBg="bg-rose-500/15"
        />
        <SwipeCarousel quests={trendingQuests} sectionId="trending" />
      </section>

      {/* Friends are playing */}
      <section>
        <SectionHeader
          icon={Users}
          title="Friends Are Playing"
          subtitle="Join your friends on their adventures"
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/15"
        />
        <SwipeCarousel quests={friendsPlayingQuests} sectionId="friends" />
      </section>
    </motion.div>
  );
}
