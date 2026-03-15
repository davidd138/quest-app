'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestTagsProps {
  /** List of tags. */
  tags: string[];
  /** Maximum visible tags before showing overflow. */
  maxVisible?: number;
  /** Callback when a tag is clicked. */
  onClick?: (tag: string) => void;
  /** Extra wrapper classes. */
  className?: string;
}

/** Map tag content to a color scheme. */
function getTagColor(tag: string): string {
  const lower = tag.toLowerCase();

  // Location-related tags
  if (
    ['city', 'park', 'beach', 'mountain', 'river', 'district', 'street', 'square', 'museum', 'market'].some(
      (kw) => lower.includes(kw),
    )
  ) {
    return 'bg-blue-500/15 text-blue-300 border-blue-400/20';
  }

  // Difficulty-related tags
  if (['easy', 'beginner', 'hard', 'expert', 'challenging', 'legendary'].some((kw) => lower.includes(kw))) {
    return 'bg-amber-500/15 text-amber-300 border-amber-400/20';
  }

  // Type-related tags (default to violet)
  return 'bg-violet-500/15 text-violet-300 border-violet-400/20';
}

const QuestTags: React.FC<QuestTagsProps> = ({
  tags,
  maxVisible = 3,
  onClick,
  className = '',
}) => {
  const [showAll, setShowAll] = useState(false);

  const visibleTags = showAll ? tags : tags.slice(0, maxVisible);
  const overflowCount = tags.length - maxVisible;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      <AnimatePresence mode="popLayout">
        {visibleTags.map((tag, i) => (
          <motion.button
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            onClick={() => onClick?.(tag)}
            className={[
              'px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all cursor-pointer',
              'hover:brightness-125 active:scale-95',
              getTagColor(tag),
            ].join(' ')}
          >
            {tag}
          </motion.button>
        ))}
      </AnimatePresence>

      {!showAll && overflowCount > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowAll(true)}
          className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-white/10 text-slate-400 border border-white/10 hover:bg-white/15 hover:text-slate-300 transition-all cursor-pointer"
        >
          +{overflowCount} more
        </motion.button>
      )}

      {showAll && overflowCount > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowAll(false)}
          className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-white/10 text-slate-400 border border-white/10 hover:bg-white/15 hover:text-slate-300 transition-all cursor-pointer"
        >
          Show less
        </motion.button>
      )}
    </div>
  );
};

export default QuestTags;
