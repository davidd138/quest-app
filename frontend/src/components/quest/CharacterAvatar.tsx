'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character } from '@/types';

type AvatarSize = 'sm' | 'md' | 'lg';

interface CharacterAvatarProps {
  character: Character;
  size?: AvatarSize;
  showInfo?: boolean;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; ring: string }> = {
  sm: { container: 'w-7 h-7', text: 'text-[10px]', ring: 'ring-1' },
  md: { container: 'w-11 h-11', text: 'text-sm', ring: 'ring-2' },
  lg: { container: 'w-16 h-16', text: 'text-xl', ring: 'ring-2' },
};

const voiceRingColors: Record<string, string> = {
  warm: 'ring-amber-400/60',
  mysterious: 'ring-violet-400/60',
  energetic: 'ring-rose-400/60',
  calm: 'ring-emerald-400/60',
  authoritative: 'ring-blue-400/60',
  playful: 'ring-pink-400/60',
};

const voiceBgColors: Record<string, string> = {
  warm: 'from-amber-600/30 to-orange-600/30',
  mysterious: 'from-violet-600/30 to-purple-600/30',
  energetic: 'from-rose-600/30 to-red-600/30',
  calm: 'from-emerald-600/30 to-teal-600/30',
  authoritative: 'from-blue-600/30 to-indigo-600/30',
  playful: 'from-pink-600/30 to-fuchsia-600/30',
};

const roleEmojis: Record<string, string> = {
  guide: '🧭',
  merchant: '🏪',
  sage: '🧙',
  guardian: '🛡️',
  storyteller: '📖',
  chef: '👨‍🍳',
  explorer: '🗺️',
  detective: '🔍',
  artist: '🎨',
  musician: '🎵',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRoleEmoji(role: string): string | null {
  const lower = role.toLowerCase();
  for (const [key, emoji] of Object.entries(roleEmojis)) {
    if (lower.includes(key)) return emoji;
  }
  return null;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  size = 'md',
  showInfo = false,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const sizeConfig = sizeStyles[size];
  const ringColor = voiceRingColors[character.voiceStyle] ?? 'ring-slate-400/60';
  const bgGradient = voiceBgColors[character.voiceStyle] ?? 'from-slate-600/30 to-gray-600/30';
  const emoji = getRoleEmoji(character.role);

  return (
    <div
      className={`relative inline-flex flex-col items-center ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Avatar circle */}
      <div
        className={[
          'rounded-full flex items-center justify-center font-bold bg-gradient-to-br',
          sizeConfig.container,
          sizeConfig.text,
          sizeConfig.ring,
          ringColor,
          bgGradient,
          'text-white',
        ].join(' ')}
      >
        {character.avatarUrl ? (
          <img
            src={character.avatarUrl}
            alt={character.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : emoji ? (
          <span>{emoji}</span>
        ) : (
          <span>{getInitials(character.name)}</span>
        )}
      </div>

      {/* Name and role */}
      {showInfo && (
        <div className="mt-1.5 text-center">
          <p className="text-xs font-medium text-white">{character.name}</p>
          <p className="text-[10px] text-slate-400">{character.role}</p>
        </div>
      )}

      {/* Personality tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-48 p-3 rounded-xl bg-navy-950/95 backdrop-blur-xl border border-white/10 shadow-xl pointer-events-none"
          >
            <p className="text-xs font-semibold text-white mb-0.5">
              {character.name}
            </p>
            <p className="text-[10px] text-slate-400 mb-1">{character.role}</p>
            <p className="text-[10px] text-slate-300 leading-relaxed line-clamp-3">
              {character.personality}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharacterAvatar;
