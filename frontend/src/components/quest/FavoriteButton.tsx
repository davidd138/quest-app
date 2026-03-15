'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FavoriteButtonProps {
  questId: string;
  initialFavorited?: boolean;
  showCount?: boolean;
  count?: number;
  onToggle?: (favorited: boolean) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// localStorage helper
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'quest-favorites';

function getFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavorites(favorites: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    // Storage full or unavailable
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  questId,
  initialFavorited,
  showCount = false,
  count = 0,
  onToggle,
  className = '',
}) => {
  const [favorited, setFavorited] = useState(initialFavorited ?? false);
  const [bouncing, setBouncing] = useState(false);

  // Sync with localStorage on mount
  useEffect(() => {
    if (initialFavorited !== undefined) return;
    const favorites = getFavorites();
    setFavorited(favorites.has(questId));
  }, [questId, initialFavorited]);

  const toggle = useCallback(() => {
    const next = !favorited;
    setFavorited(next);

    // Bounce animation
    if (next) {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 400);
    }

    // Persist to localStorage
    const favorites = getFavorites();
    if (next) {
      favorites.add(questId);
    } else {
      favorites.delete(questId);
    }
    saveFavorites(favorites);

    onToggle?.(next);
  }, [favorited, questId, onToggle]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      className={`group/fav inline-flex items-center gap-1.5 transition-colors ${className}`}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={favorited}
    >
      <motion.div
        animate={
          bouncing
            ? { scale: [1, 1.4, 0.9, 1.15, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Heart
          className={`w-5 h-5 transition-colors duration-200 ${
            favorited
              ? 'text-rose-500 fill-rose-500'
              : 'text-slate-500 group-hover/fav:text-rose-400'
          }`}
        />
      </motion.div>

      {showCount && (
        <AnimatePresence mode="wait">
          <motion.span
            key={favorited ? count + 1 : count}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-slate-500 tabular-nums"
          >
            {favorited ? count + 1 : count}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  );
};

export default FavoriteButton;
