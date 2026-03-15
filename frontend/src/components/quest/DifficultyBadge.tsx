'use client';

import React from 'react';
import { Star } from 'lucide-react';
import type { QuestDifficulty } from '@/types';

interface DifficultyBadgeProps {
  difficulty: QuestDifficulty;
  showStars?: boolean;
  className?: string;
}

const difficultyConfig: Record<
  QuestDifficulty,
  { label: string; color: string; stars: number; glow?: string }
> = {
  easy: {
    label: 'Easy',
    color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    stars: 1,
  },
  medium: {
    label: 'Medium',
    color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    stars: 2,
  },
  hard: {
    label: 'Hard',
    color: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    stars: 3,
  },
  legendary: {
    label: 'Legendary',
    color: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    stars: 4,
    glow: 'shadow-lg shadow-violet-500/20',
  },
};

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  showStars = true,
  className = '',
}) => {
  const config = difficultyConfig[difficulty];

  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border',
        config.color,
        config.glow ?? '',
        className,
      ].join(' ')}
    >
      {config.label}
      {showStars && (
        <span className="flex items-center gap-px ml-0.5">
          {Array.from({ length: config.stars }).map((_, i) => (
            <Star key={i} size={8} fill="currentColor" />
          ))}
        </span>
      )}
    </span>
  );
};

export default DifficultyBadge;
