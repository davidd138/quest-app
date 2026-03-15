'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, Layers } from 'lucide-react';
import type { Quest, Progress, QuestCategory } from '@/types';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import DifficultyBadge from './DifficultyBadge';

interface QuestCardProps {
  quest: Quest;
  progress?: Progress;
  onClick?: () => void;
  className?: string;
}

const categoryGradients: Record<QuestCategory, string> = {
  adventure: 'from-violet-600/40 to-indigo-600/40',
  mystery: 'from-slate-600/40 to-zinc-700/40',
  cultural: 'from-amber-600/40 to-orange-600/40',
  culinary: 'from-rose-600/40 to-pink-600/40',
  nature: 'from-emerald-600/40 to-teal-600/40',
  educational: 'from-blue-600/40 to-cyan-600/40',
  urban: 'from-gray-600/40 to-neutral-600/40',
  team_building: 'from-fuchsia-600/40 to-purple-600/40',
};

const categoryColors: Record<QuestCategory, 'violet' | 'emerald' | 'amber' | 'rose' | 'slate'> = {
  adventure: 'violet',
  mystery: 'slate',
  cultural: 'amber',
  culinary: 'rose',
  nature: 'emerald',
  educational: 'violet',
  urban: 'slate',
  team_building: 'rose',
};

const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  progress,
  onClick,
  className = '',
}) => {
  const gradient = categoryGradients[quest.category];
  const progressPercentage = progress
    ? (progress.completedStages.length / quest.stages.length) * 100
    : 0;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={[
        'group relative rounded-2xl overflow-hidden cursor-pointer',
        'bg-white/5 backdrop-blur-xl border border-white/10',
        'hover:border-white/20 hover:shadow-xl hover:shadow-violet-500/10',
        'transition-shadow duration-300',
        className,
      ].join(' ')}
    >
      {/* Cover gradient */}
      <div
        className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}
      >
        {quest.coverImageUrl ? (
          <img
            src={quest.coverImageUrl}
            alt={quest.title}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)]" />
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge color={categoryColors[quest.category]} size="sm">
            {quest.category.replace('_', ' ')}
          </Badge>
        </div>

        {/* Difficulty badge */}
        <div className="absolute top-3 right-3">
          <DifficultyBadge difficulty={quest.difficulty} />
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-white mb-1.5 line-clamp-1 group-hover:text-violet-300 transition-colors">
          {quest.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {quest.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {quest.estimatedDuration}m
            </span>
            <span className="flex items-center gap-1">
              <Star size={12} />
              {quest.totalPoints} pts
            </span>
            <span className="flex items-center gap-1">
              <Layers size={12} />
              {quest.stages.length} stages
            </span>
          </div>
        </div>

        {/* Progress bar */}
        {progress && progress.status === 'in_progress' && (
          <ProgressBar
            value={progressPercentage}
            color="violet"
            size="sm"
            gradient
            striped
          />
        )}
        {progress && progress.status === 'completed' && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Completed - {progress.totalPoints} pts
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QuestCard;
