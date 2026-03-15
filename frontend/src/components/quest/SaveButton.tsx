'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark } from 'lucide-react';

interface SaveButtonProps {
  /** Unique identifier for the item being saved. */
  itemId: string;
  /** Type of content being saved (quest, collection, review). */
  itemType?: string;
  /** Optional display count of total saves. */
  saveCount?: number;
  /** Callback fired when the saved state changes. */
  onToggle?: (saved: boolean) => void;
  /** Extra wrapper classes. */
  className?: string;
  /** Size variant. */
  size?: 'sm' | 'md' | 'lg';
}

const STORAGE_KEY = 'quest-app-saved-items';

function getSavedItems(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function persistSavedItems(items: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota exceeded or access denied
  }
}

const sizeMap = {
  sm: { button: 'w-8 h-8', icon: 16, text: 'text-xs' },
  md: { button: 'w-10 h-10', icon: 20, text: 'text-sm' },
  lg: { button: 'w-12 h-12', icon: 24, text: 'text-base' },
};

const SaveButton: React.FC<SaveButtonProps> = ({
  itemId,
  itemType = 'quest',
  saveCount,
  onToggle,
  className = '',
  size = 'md',
}) => {
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const s = sizeMap[size];

  // Hydrate from localStorage
  useEffect(() => {
    const items = getSavedItems();
    const key = `${itemType}:${itemId}`;
    if (items[key]) {
      setSaved(true);
    }
  }, [itemId, itemType]);

  const handleToggle = useCallback(() => {
    const key = `${itemType}:${itemId}`;
    const items = getSavedItems();
    const next = !saved;

    if (next) {
      items[key] = true;
    } else {
      delete items[key];
    }

    persistSavedItems(items);
    setSaved(next);
    onToggle?.(next);

    if (next) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  }, [saved, itemId, itemType, onToggle]);

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={handleToggle}
        aria-label={saved ? 'Remove from saved' : 'Save'}
        data-testid="save-button"
        className={`${s.button} flex items-center justify-center rounded-xl transition-all duration-200 ${
          saved
            ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
            : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10'
        }`}
      >
        <motion.div
          animate={saved ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Bookmark
            size={s.icon}
            fill={saved ? 'currentColor' : 'none'}
            data-testid="bookmark-icon"
          />
        </motion.div>
      </motion.button>

      {saveCount !== undefined && (
        <span className={`${s.text} text-slate-500 font-medium`} data-testid="save-count">
          {saveCount}
        </span>
      )}

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium shadow-lg shadow-violet-600/30 z-50"
          >
            Saved!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SaveButton;
