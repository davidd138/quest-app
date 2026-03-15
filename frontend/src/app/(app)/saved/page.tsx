'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  Compass,
  FolderOpen,
  Star,
  Trash2,
  ArrowUpDown,
  Layers,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import Tabs from '@/components/ui/Tabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

type SortOption = 'date' | 'rating' | 'difficulty';

interface SavedItem {
  id: string;
  type: 'quest' | 'collection' | 'review';
  title: string;
  description: string;
  savedAt: string;
  rating?: number;
  difficulty?: string;
  imageUrl?: string;
  category?: string;
}

// Demo data
const DEMO_SAVED: SavedItem[] = [
  {
    id: 'sq1',
    type: 'quest',
    title: 'Madrid Mystery Tour',
    description: 'Explore the hidden secrets of Madrid through an exciting adventure.',
    savedAt: '2026-03-10T10:00:00Z',
    rating: 4.8,
    difficulty: 'medium',
    category: 'mystery',
  },
  {
    id: 'sq2',
    type: 'quest',
    title: 'Barcelona Gaudi Walk',
    description: 'Discover the architectural wonders of Gaudi across Barcelona.',
    savedAt: '2026-03-08T14:00:00Z',
    rating: 4.5,
    difficulty: 'easy',
    category: 'cultural',
  },
  {
    id: 'sc1',
    type: 'collection',
    title: 'Best of Spain',
    description: 'Curated collection of the best quests across Spain.',
    savedAt: '2026-03-12T09:00:00Z',
    rating: 4.9,
  },
  {
    id: 'sr1',
    type: 'review',
    title: 'Review: Seville Adventure',
    description: '"An amazing experience that took me through the streets of Seville..."',
    savedAt: '2026-03-05T16:00:00Z',
    rating: 5.0,
  },
];

const difficultyOrder: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  legendary: 4,
};

function SavedItemCard({
  item,
  onRemove,
}: {
  item: SavedItem;
  onRemove: (id: string) => void;
}) {
  const diffColors: Record<string, string> = {
    easy: 'bg-emerald-500/15 text-emerald-400',
    medium: 'bg-amber-500/15 text-amber-400',
    hard: 'bg-rose-500/15 text-rose-400',
    legendary: 'bg-violet-500/15 text-violet-400',
  };

  const typeIcons: Record<string, React.ElementType> = {
    quest: Compass,
    collection: Layers,
    review: MessageSquare,
  };

  const Icon = typeIcons[item.type] || Compass;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      transition={{ duration: 0.25 }}
      className="glass rounded-2xl overflow-hidden group border border-transparent hover:border-violet-500/20 transition-all duration-300"
    >
      {/* Cover */}
      <div className="h-32 bg-gradient-to-br from-violet-600/20 via-navy-800 to-emerald-600/10 flex items-center justify-center relative">
        <Icon className="w-10 h-10 text-violet-500/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />

        {item.difficulty && (
          <span
            className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-lg font-medium ${
              diffColors[item.difficulty] || ''
            }`}
          >
            {item.difficulty}
          </span>
        )}

        {/* Remove button */}
        <button
          onClick={() => onRemove(item.id)}
          className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-navy-900/60 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Remove from saved"
          data-testid={`remove-${item.id}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-slate-500 capitalize bg-navy-800/50 px-2 py-0.5 rounded-lg">
            {item.type}
          </span>
          {item.category && (
            <span className="text-xs text-slate-500 capitalize bg-navy-800/50 px-2 py-0.5 rounded-lg">
              {item.category}
            </span>
          )}
        </div>

        <h3 className="font-heading text-base font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
          {item.title}
        </h3>
        <p className="text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          {item.rating !== undefined && (
            <span className="flex items-center gap-1">
              <Star size={12} className="text-amber-400" />
              {item.rating.toFixed(1)}
            </span>
          )}
          <span>
            Saved {new Date(item.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyTab({ type }: { type: string }) {
  const iconMap: Record<string, React.ElementType> = {
    quests: Compass,
    collections: Layers,
    reviews: MessageSquare,
  };
  const Icon = iconMap[type] || Bookmark;

  return (
    <div className="glass rounded-2xl p-12 text-center">
      <Icon className="w-14 h-14 text-slate-600 mx-auto mb-4" />
      <h3 className="font-heading text-lg font-semibold text-white mb-2">
        No saved {type} yet
      </h3>
      <p className="text-slate-400 text-sm max-w-sm mx-auto">
        Bookmark {type} you want to revisit later. They will appear here.
      </p>
      {type === 'quests' && (
        <Link
          href="/quests"
          className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          Browse Quests
        </Link>
      )}
    </div>
  );
}

export default function SavedPage() {
  const [savedItems, setSavedItems] = useLocalStorage<SavedItem[]>(
    'quest-app-saved-content',
    DEMO_SAVED,
  );
  const [sortBy, setSortBy] = useState<SortOption>('date');

  const handleRemove = useCallback(
    (id: string) => {
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setSavedItems],
  );

  const sortItems = useCallback(
    (items: SavedItem[]) => {
      return [...items].sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'difficulty':
            return (difficultyOrder[a.difficulty || ''] || 0) - (difficultyOrder[b.difficulty || ''] || 0);
          default:
            return 0;
        }
      });
    },
    [sortBy],
  );

  const savedQuests = useMemo(
    () => sortItems(savedItems.filter((i) => i.type === 'quest')),
    [savedItems, sortItems],
  );

  const savedCollections = useMemo(
    () => sortItems(savedItems.filter((i) => i.type === 'collection')),
    [savedItems, sortItems],
  );

  const savedReviews = useMemo(
    () => sortItems(savedItems.filter((i) => i.type === 'review')),
    [savedItems, sortItems],
  );

  function renderGrid(items: SavedItem[], emptyType: string) {
    if (items.length === 0) {
      return <EmptyTab type={emptyType} />;
    }

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        <AnimatePresence>
          {items.map((item) => (
            <SavedItemCard key={item.id} item={item} onRemove={handleRemove} />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  const tabs = [
    {
      key: 'quests',
      label: `Saved Quests (${savedQuests.length})`,
      icon: <Compass size={16} />,
      content: renderGrid(savedQuests, 'quests'),
    },
    {
      key: 'collections',
      label: `Collections (${savedCollections.length})`,
      icon: <Layers size={16} />,
      content: renderGrid(savedCollections, 'collections'),
    },
    {
      key: 'reviews',
      label: `Reviews (${savedReviews.length})`,
      icon: <MessageSquare size={16} />,
      content: renderGrid(savedReviews, 'reviews'),
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-violet-400" />
            Saved Content
          </h1>
          <p className="text-slate-400 mt-1">Your bookmarked quests, collections, and reviews</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 border border-white/10">
            <ArrowUpDown size={14} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="date">Date Saved</option>
              <option value="rating">Rating</option>
              <option value="difficulty">Difficulty</option>
            </select>
          </div>

          {/* Folders placeholder */}
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm">
            <FolderOpen size={16} />
            Folders
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs tabs={tabs} />
      </motion.div>
    </motion.div>
  );
}
