'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Swords,
  User,
  Lock,
  Sparkles,
  Volume2,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import type { Character } from '@/types';

// ---------- Types ----------

export interface CollectedCharacter {
  id: string;
  character: Character;
  questId: string;
  questTitle: string;
  stageId: string;
  met: boolean;
  metAt?: string;
  performanceRating: number; // 0-5 stars
  memorableQuotes: string[];
  accentColor: string; // tailwind color key e.g. 'violet', 'emerald', 'amber'
}

interface CharacterCollectionCardProps {
  collected: CollectedCharacter;
  onClick?: (collected: CollectedCharacter) => void;
  className?: string;
}

// ---------- Helpers ----------

const accentMap: Record<string, { border: string; bg: string; text: string; ring: string; glow: string }> = {
  violet: {
    border: 'border-violet-500/30',
    bg: 'bg-violet-600/15',
    text: 'text-violet-400',
    ring: 'ring-violet-500/30',
    glow: 'shadow-violet-500/20',
  },
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-600/15',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/30',
    glow: 'shadow-emerald-500/20',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-600/15',
    text: 'text-amber-400',
    ring: 'ring-amber-500/30',
    glow: 'shadow-amber-500/20',
  },
  rose: {
    border: 'border-rose-500/30',
    bg: 'bg-rose-600/15',
    text: 'text-rose-400',
    ring: 'ring-rose-500/30',
    glow: 'shadow-rose-500/20',
  },
  blue: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-600/15',
    text: 'text-blue-400',
    ring: 'ring-blue-500/30',
    glow: 'shadow-blue-500/20',
  },
  fuchsia: {
    border: 'border-fuchsia-500/30',
    bg: 'bg-fuchsia-600/15',
    text: 'text-fuchsia-400',
    ring: 'ring-fuchsia-500/30',
    glow: 'shadow-fuchsia-500/20',
  },
};

const defaultAccent = accentMap.violet;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-600'
          }
        />
      ))}
    </div>
  );
}

// ---------- Component ----------

const CharacterCollectionCard: React.FC<CharacterCollectionCardProps> = ({
  collected,
  onClick,
  className = '',
}) => {
  const [hovered, setHovered] = useState(false);
  const accent = accentMap[collected.accentColor] || defaultAccent;
  const { character, met } = collected;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.(collected)}
      className={[
        'group relative rounded-2xl overflow-hidden cursor-pointer',
        'bg-white/[0.04] backdrop-blur-xl',
        'border transition-all duration-300',
        met ? `${accent.border} hover:shadow-lg hover:${accent.glow}` : 'border-white/5',
        className,
      ].join(' ')}
    >
      {/* Top gradient accent stripe */}
      <div
        className={`h-1 w-full ${
          met
            ? `bg-gradient-to-r ${accent.bg.replace('/15', '/60')}`
            : 'bg-white/5'
        }`}
      />

      <div className="p-4">
        {/* Avatar */}
        <div className="flex justify-center mb-3">
          <div
            className={[
              'relative w-20 h-20 rounded-xl flex items-center justify-center',
              met
                ? `bg-gradient-to-br ${accent.bg} ring-2 ${accent.ring}`
                : 'bg-white/5 ring-1 ring-white/10',
              'transition-all duration-300',
            ].join(' ')}
          >
            {met ? (
              character.avatarUrl ? (
                <img
                  src={character.avatarUrl}
                  alt={character.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <span className={`text-2xl font-bold ${accent.text}`}>
                  {getInitials(character.name)}
                </span>
              )
            ) : (
              <div className="flex flex-col items-center gap-1">
                <User className="w-8 h-8 text-slate-600" />
                <Lock className="w-3 h-3 text-slate-600 absolute bottom-1.5 right-1.5" />
              </div>
            )}

            {/* Sparkle for newly met */}
            {met && collected.metAt && (
              <div className="absolute -top-1 -right-1">
                <Sparkles className={`w-4 h-4 ${accent.text}`} />
              </div>
            )}
          </div>
        </div>

        {/* Name and role */}
        <div className="text-center mb-2">
          <h4 className={`font-heading font-semibold text-sm ${
            met ? 'text-white' : 'text-slate-600'
          }`}>
            {met ? character.name : '???'}
          </h4>
          <p className={`text-[11px] mt-0.5 ${met ? 'text-slate-400' : 'text-slate-600'}`}>
            {met ? character.role : 'Unknown'}
          </p>
        </div>

        {/* Quest badge */}
        <div className="flex justify-center mb-3">
          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
            met
              ? `${accent.bg} ${accent.text}`
              : 'bg-white/5 text-slate-600'
          }`}>
            {met ? collected.questTitle : 'Locked'}
          </span>
        </div>

        {/* Star rating (only if met) */}
        {met && (
          <div className="flex justify-center mb-3">
            <StarRating rating={collected.performanceRating} size={12} />
          </div>
        )}

        {/* Voice style indicator (only if met) */}
        {met && (
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Volume2 className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] text-slate-500 capitalize">{character.voiceStyle}</span>
          </div>
        )}

        {/* Challenge again button */}
        {met && (
          <Link href={`/quest-play/${collected.questId}/stage/${collected.stageId}`}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold ${accent.bg} ${accent.text} hover:opacity-90 transition-all`}
            >
              <Swords className="w-3.5 h-3.5" />
              Challenge again
            </motion.button>
          </Link>
        )}

        {!met && (
          <div className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-600">
            <Lock className="w-3 h-3" />
            Not yet encountered
          </div>
        )}
      </div>

      {/* Hover personality preview */}
      <AnimatePresence>
        {hovered && met && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 z-20 p-4 bg-gradient-to-t from-navy-950/98 via-navy-950/95 to-transparent"
          >
            <div className="space-y-2">
              <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                <span className="text-slate-500 font-medium">Personality:</span>{' '}
                {character.personality}
              </p>
              {collected.memorableQuotes.length > 0 && (
                <p className="text-[11px] text-violet-300/80 italic line-clamp-1 flex items-start gap-1">
                  <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  &ldquo;{collected.memorableQuotes[0]}&rdquo;
                </p>
              )}
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <span>Tap for full details</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CharacterCollectionCard;
