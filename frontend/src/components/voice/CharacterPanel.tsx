'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Brain, Swords, Volume2 } from 'lucide-react';
import type { Character, Challenge } from '@/types';
import CharacterAvatar from '@/components/quest/CharacterAvatar';
import Badge from '@/components/ui/Badge';

type Emotion = 'happy' | 'thinking' | 'challenging';

interface CharacterPanelProps {
  character: Character;
  emotion: Emotion;
  challenge: Challenge;
  className?: string;
}

const emotionConfig: Record<Emotion, { icon: typeof Smile; label: string; color: string }> = {
  happy: { icon: Smile, label: 'Happy', color: 'text-emerald-400' },
  thinking: { icon: Brain, label: 'Thinking', color: 'text-amber-400' },
  challenging: { icon: Swords, label: 'Challenging', color: 'text-rose-400' },
};

const CharacterPanel: React.FC<CharacterPanelProps> = ({
  character,
  emotion,
  challenge,
  className = '',
}) => {
  const emotionInfo = emotionConfig[emotion];
  const EmotionIcon = emotionInfo.icon;

  return (
    <div
      className={`flex flex-col h-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden ${className}`}
    >
      {/* Character portrait */}
      <div className="flex flex-col items-center pt-8 pb-4 px-4 border-b border-white/10">
        <CharacterAvatar character={character} size="lg" />
        <h3 className="mt-3 text-base font-semibold text-white">
          {character.name}
        </h3>
        <p className="text-xs text-slate-400">{character.role}</p>

        {/* Emotion indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={emotion}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`mt-3 flex items-center gap-1.5 text-xs ${emotionInfo.color}`}
          >
            <EmotionIcon size={14} />
            <span>{emotionInfo.label}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Voice style */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Volume2 size={12} />
          <span className="capitalize">{character.voiceStyle} voice</span>
        </div>
      </div>

      {/* Challenge info */}
      <div className="px-4 py-3 flex-1">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">
          Current Challenge
        </p>
        <Badge color="violet" size="sm">
          {challenge.type}
        </Badge>
        <p className="mt-2 text-xs text-slate-300 leading-relaxed">
          {challenge.description}
        </p>
      </div>
    </div>
  );
};

export default CharacterPanel;
