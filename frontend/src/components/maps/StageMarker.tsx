'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  HelpCircle,
  BookOpen,
  Handshake,
  Megaphone,
  Compass,
  Lightbulb,
  Lock,
  Check,
} from 'lucide-react';
import type { ChallengeType } from '@/types';

type MarkerState = 'completed' | 'current' | 'locked';

interface StageMarkerProps {
  order: number;
  title: string;
  state: MarkerState;
  challengeType: ChallengeType;
  onClick?: () => void;
}

const challengeIcons: Record<ChallengeType, React.ElementType> = {
  conversation: MessageSquare,
  riddle: HelpCircle,
  knowledge: BookOpen,
  negotiation: Handshake,
  persuasion: Megaphone,
  exploration: Compass,
  trivia: Lightbulb,
};

const stateStyles: Record<MarkerState, { bg: string; border: string; ring: string; text: string }> = {
  completed: {
    bg: 'bg-emerald-500',
    border: 'border-emerald-400',
    ring: 'ring-emerald-500/30',
    text: 'text-white',
  },
  current: {
    bg: 'bg-violet-500',
    border: 'border-violet-400',
    ring: 'ring-violet-500/40',
    text: 'text-white',
  },
  locked: {
    bg: 'bg-slate-600',
    border: 'border-slate-500',
    ring: 'ring-slate-500/20',
    text: 'text-slate-300',
  },
};

const StageMarker: React.FC<StageMarkerProps> = ({
  order,
  title,
  state,
  challengeType,
  onClick,
}) => {
  const styles = stateStyles[state];
  const Icon = state === 'completed' ? Check : state === 'locked' ? Lock : challengeIcons[challengeType];

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      {/* Pulse ring for current stage */}
      {state === 'current' && (
        <motion.div
          className={`absolute inset-0 rounded-full ${styles.bg} opacity-30`}
          animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Main marker */}
      <motion.div
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-10 h-10 rounded-full ${styles.bg} ${styles.border} border-2 ring-4 ${styles.ring} flex items-center justify-center shadow-lg`}
      >
        {state === 'completed' ? (
          <Check size={18} className="text-white" />
        ) : state === 'locked' ? (
          <Lock size={14} className="text-slate-300" />
        ) : (
          <span className="text-sm font-bold text-white">{order}</span>
        )}
      </motion.div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="glass rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
          <div className="flex items-center gap-2">
            <Icon size={12} className={styles.text} />
            <span className="text-xs font-medium text-white">{title}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 capitalize">
            {state === 'completed' ? 'Completed' : state === 'current' ? 'Current Stage' : 'Locked'}
          </div>
        </div>
        <div className="w-2 h-2 glass rotate-45 mx-auto -mt-1" />
      </div>
    </div>
  );
};

export default StageMarker;
