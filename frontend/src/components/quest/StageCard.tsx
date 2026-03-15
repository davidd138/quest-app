'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Star } from 'lucide-react';
import type { Stage, CompletedStage, ChallengeType } from '@/types';
import Badge from '@/components/ui/Badge';
import CharacterAvatar from './CharacterAvatar';

interface StageCardProps {
  stage: Stage;
  stageNumber: number;
  state: 'locked' | 'current' | 'completed';
  completedData?: CompletedStage;
  onClick?: () => void;
  className?: string;
}

const challengeColors: Record<ChallengeType, 'violet' | 'emerald' | 'amber' | 'rose' | 'slate'> = {
  conversation: 'violet',
  riddle: 'amber',
  knowledge: 'emerald',
  negotiation: 'rose',
  persuasion: 'rose',
  exploration: 'emerald',
  trivia: 'amber',
};

const StageCard: React.FC<StageCardProps> = ({
  stage,
  stageNumber,
  state,
  completedData,
  onClick,
  className = '',
}) => {
  const isLocked = state === 'locked';
  const isCurrent = state === 'current';
  const isCompleted = state === 'completed';

  return (
    <motion.div
      whileHover={isLocked ? undefined : { scale: 1.02 }}
      whileTap={isLocked ? undefined : { scale: 0.98 }}
      onClick={isLocked ? undefined : onClick}
      className={[
        'relative rounded-2xl border p-5 transition-all duration-300',
        isLocked
          ? 'bg-white/[0.02] border-white/5 opacity-50 blur-[1px] cursor-not-allowed'
          : 'bg-white/5 backdrop-blur-xl border-white/10 cursor-pointer hover:border-white/20',
        isCurrent
          ? 'border-violet-500/50 shadow-lg shadow-violet-500/10 animate-pulse-glow'
          : '',
        isCompleted ? 'border-emerald-500/30' : '',
        className,
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        {/* Stage number indicator */}
        <div
          className={[
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border',
            isCompleted
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : isCurrent
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                : 'bg-white/5 border-white/10 text-slate-500',
          ].join(' ')}
        >
          {isCompleted ? <Check size={18} /> : isLocked ? <Lock size={14} /> : stageNumber}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-white truncate">
              {stage.title}
            </h4>
            <div className="flex items-center gap-1 text-xs text-amber-400 ml-2 flex-shrink-0">
              <Star size={12} />
              {stage.points}
            </div>
          </div>

          {/* Character */}
          <div className="flex items-center gap-2 mb-2">
            <CharacterAvatar character={stage.character} size="sm" />
            <span className="text-xs text-slate-400">{stage.character.name}</span>
          </div>

          {/* Challenge type badge */}
          <Badge color={challengeColors[stage.challenge.type]} size="sm">
            {stage.challenge.type}
          </Badge>

          {/* Completed score */}
          {isCompleted && completedData && (
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
              <Check size={12} />
              <span>Score: {completedData.points} pts</span>
              <span className="text-slate-500">
                ({completedData.attempts} {completedData.attempts === 1 ? 'attempt' : 'attempts'})
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StageCard;
