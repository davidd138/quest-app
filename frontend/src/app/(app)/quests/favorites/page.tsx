'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Clock,
  Star,
  Layers,
  Share2,
  ArrowUpDown,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import FavoriteButton from '@/components/quest/FavoriteButton';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FavoriteQuest {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  category: string;
  estimatedDuration: number;
  totalPoints: number;
  stages: number;
  rating: number;
  favoritedAt: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_FAVORITES: FavoriteQuest[] = [
  { id: 'q1', title: 'The Lost Temple of Sol', description: 'Uncover ancient secrets hidden beneath the bustling streets of Madrid', difficulty: 'hard', category: 'adventure', estimatedDuration: 90, totalPoints: 850, stages: 5, rating: 4.8, favoritedAt: '2026-03-10' },
  { id: 'q2', title: 'Mystery at the Prado', description: 'A priceless painting holds a coded message that only you can decipher', difficulty: 'legendary', category: 'mystery', estimatedDuration: 120, totalPoints: 1200, stages: 7, rating: 4.9, favoritedAt: '2026-03-08' },
  { id: 'q3', title: 'Culinary Secrets of La Latina', description: 'Discover hidden flavors and legendary recipes in the heart of the city', difficulty: 'easy', category: 'culinary', estimatedDuration: 45, totalPoints: 400, stages: 3, rating: 4.5, favoritedAt: '2026-03-05' },
  { id: 'q4', title: 'Urban Explorer: Gran Via', description: 'Navigate the architectural wonders of the grand boulevard', difficulty: 'medium', category: 'urban', estimatedDuration: 60, totalPoints: 600, stages: 4, rating: 4.3, favoritedAt: '2026-02-28' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SortKey = 'date' | 'difficulty' | 'rating';

const DIFFICULTY_ORDER: Record<string, number> = { easy: 1, medium: 2, hard: 3, legendary: 4 };
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-500/20 text-emerald-300',
  medium: 'bg-amber-500/20 text-amber-300',
  hard: 'bg-rose-500/20 text-rose-300',
  legendary: 'bg-violet-500/20 text-violet-300',
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteQuest[]>(MOCK_FAVORITES);
  const [sortBy, setSortBy] = useState<SortKey>('date');

  const sorted = useMemo(() => {
    const list = [...favorites];
    switch (sortBy) {
      case 'date':
        return list.sort((a, b) => b.favoritedAt.localeCompare(a.favoritedAt));
      case 'difficulty':
        return list.sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] || 0) - (DIFFICULTY_ORDER[b.difficulty] || 0));
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      default:
        return list;
    }
  }, [favorites, sortBy]);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/quests/favorites` : '';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back link */}
      <Link href="/quests" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Quests
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            Favorite Quests
          </h1>
          <p className="text-slate-400 mt-1 ml-[52px]">
            {favorites.length} quest{favorites.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        <div className="flex gap-3">
          {/* Share link */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigator.clipboard?.writeText(shareUrl)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share My Favorites
          </motion.button>
        </div>
      </motion.div>

      {/* Sort controls */}
      {favorites.length > 0 && (
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500 mr-2">Sort by:</span>
          {(['date', 'difficulty', 'rating'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === key
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {key === 'date' ? 'Date Added' : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Favorites list */}
      {sorted.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <AnimatePresence>
            {sorted.map((quest) => (
              <motion.div
                key={quest.id}
                variants={itemVariants}
                exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                layout
                className="glass rounded-2xl border border-white/10 p-5 hover:border-violet-500/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Favorite button */}
                  <div className="pt-1">
                    <FavoriteButton
                      questId={quest.id}
                      initialFavorited={true}
                      onToggle={(favorited) => {
                        if (!favorited) removeFavorite(quest.id);
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/quests/${quest.id}`}>
                      <h3 className="font-heading font-semibold text-white group-hover:text-violet-300 transition-colors">
                        {quest.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{quest.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${DIFFICULTY_COLORS[quest.difficulty]}`}>
                        {quest.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-slate-400">
                        {quest.category}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {quest.estimatedDuration}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {quest.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {quest.stages} stages
                      </span>
                      <span className="text-slate-600">
                        Added {new Date(quest.favoritedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-heading font-semibold text-white mb-2">No favorites yet</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Tap the heart icon on any quest to add it to your favorites for quick access.
          </p>
          <Link href="/quests">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-lg shadow-violet-600/25"
            >
              Browse Quests
            </motion.button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
